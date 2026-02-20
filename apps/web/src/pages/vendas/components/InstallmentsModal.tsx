import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import type { BankAccountRow, SaleRow } from "../sales.types";
import { closeSale, listBankAccounts, previewInstallments } from "../sales.service";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function toCents(n: number) {
  return Math.round(Number(n) * 100);
}
function fromCents(c: number) {
  return Number((c / 100).toFixed(2));
}

type UiInstallment = {
  installmentNumber: number;
  dueDate: string;     // YYYY-MM-DD
  amountCents: number; // int cents
};

function rebalanceFromIndex(args: {
  installments: UiInstallment[];
  index: number;
  newAmountCents: number;
  totalCents: number;
}) {
  const { installments, index, newAmountCents, totalCents } = args;
  const next = installments.map((x) => ({ ...x }));

  next[index].amountCents = Math.max(0, newAmountCents);

  const frozenSum = next.slice(0, index + 1).reduce((acc, it) => acc + it.amountCents, 0);
  if (frozenSum > totalCents) return { ok: false as const, installments };

  const remainingCount = next.length - (index + 1);
  const remaining = totalCents - frozenSum;

  if (remainingCount <= 0) {
    if (remaining !== 0) return { ok: false as const, installments };
    return { ok: true as const, installments: next };
  }

  const base = Math.floor(remaining / remainingCount);
  let rem = remaining % remainingCount;

  for (let i = index + 1; i < next.length; i++) {
    const add = rem > 0 ? 1 : 0;
    next[i].amountCents = base + add;
    if (rem > 0) rem -= 1;
  }

  return { ok: true as const, installments: next };
}

type Props = {
  sale: SaleRow;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onClosed: () => Promise<void>;
};

export function InstallmentsModal({ sale, open, onOpenChange, onClosed }: Props) {
  const [loadingPreview, setLoadingPreview] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  const [issueDate, setIssueDate] = React.useState<string>("");
  const [uiInstallments, setUiInstallments] = React.useState<UiInstallment[]>([]);

  const [bankAccounts, setBankAccounts] = React.useState<BankAccountRow[]>([]);
  const [bankAccountId, setBankAccountId] = React.useState<number | null>(null);

  const [documentNo, setDocumentNo] = React.useState("");
  const [note, setNote] = React.useState("");

  const totalCents = toCents(Number(sale.total));

  React.useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const acc = await listBankAccounts();
        setBankAccounts(acc);
        const first = acc.find((x) => x.active);
        setBankAccountId(first?.id ?? null);
      } catch (e: any) {
        toast.error(String(e?.message ?? "Erro ao listar contas bancárias"));
      }
    })();
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    (async () => {
      setLoadingPreview(true);
      try {
        const prev = await previewInstallments(sale.id);
        setIssueDate(prev.issueDate);

        setUiInstallments(
          prev.installments.map((it) => ({
            installmentNumber: it.installmentNumber,
            dueDate: it.dueDate,
            amountCents: toCents(it.amount),
          }))
        );
      } catch (e: any) {
        const status = Number(e?.status ?? 0);
        if (status === 409) {
          toast.warning("Defina pagamento (forma/condição) antes de gerar parcelas.");
        } else {
          toast.error(String(e?.message ?? "Erro ao gerar parcelas").slice(0, 160));
        }
        onOpenChange(false);
      } finally {
        setLoadingPreview(false);
      }
    })();
  }, [open, sale.id, onOpenChange]);

  const sumCents = uiInstallments.reduce((acc, it) => acc + it.amountCents, 0);
  const sumOk = sumCents === totalCents;

  function changeDueDate(idx: number, dueDate: string) {
    setUiInstallments((prev) => {
      const next = prev.map((x) => ({ ...x }));
      next[idx].dueDate = dueDate;
      return next;
    });
  }

  function changeAmount(idx: number, value: string) {
    const cleaned = value.replace(",", ".").replace(/[^\d.]/g, "");
    const n = Number(cleaned);
    const newCents = toCents(Number.isFinite(n) ? n : 0);

    setUiInstallments((prev) => {
      const r = rebalanceFromIndex({
        installments: prev,
        index: idx,
        newAmountCents: newCents,
        totalCents,
      });

      if (!r.ok) {
        toast.warning("Valor inválido: soma das parcelas não pode ultrapassar o total.");
        return prev;
      }
      return r.installments;
    });
  }

  async function doClose() {
    if (!bankAccountId) {
      toast.error("Selecione a conta bancária.");
      return;
    }
    if (!uiInstallments.length) {
      toast.error("Sem parcelas.");
      return;
    }
    if (!sumOk) {
      toast.error("Soma das parcelas diferente do total.");
      return;
    }

    const ok = confirm("Fechar esta venda? Isso irá gerar o contas a receber.");
    if (!ok) return;

    setClosing(true);
    try {
      await closeSale(sale.id, {
        bankAccountId,
        documentNo: documentNo.trim() ? documentNo.trim() : null,
        note: note.trim() ? note.trim() : null,
        installments: uiInstallments.map((it) => ({
          dueDate: it.dueDate,
          amount: fromCents(it.amountCents),
        })),
      });

      toast.success("Venda finalizada.");
      onOpenChange(false);
      await onClosed();
    } catch (e: any) {
      const status = Number(e?.status ?? 0);
      if (status === 409) toast.warning("Venda já finalizada ou já possui títulos.");
      else toast.error(String(e?.message ?? "Erro ao finalizar venda").slice(0, 200));
      await onClosed();
    } finally {
      setClosing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gerar parcelas / Fechar venda</DialogTitle>
          <DialogDescription>
            Emissão: {issueDate || "—"} · Total: {brl.format(fromCents(totalCents))}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 rounded-xl border overflow-hidden">
            <div className="p-3 border-b bg-muted/40 font-medium">Parcelas</div>

            {loadingPreview ? (
              <div className="p-3 text-sm">Gerando parcelas...</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="text-left p-3">#</th>
                    <th className="text-left p-3">Vencimento</th>
                    <th className="text-right p-3">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {uiInstallments.map((it, idx) => (
                    <tr key={it.installmentNumber} className="border-t">
                      <td className="p-3 font-medium">{it.installmentNumber}</td>
                      <td className="p-3">
                        <Input type="date" value={it.dueDate} onChange={(e) => changeDueDate(idx, e.target.value)} />
                      </td>
                      <td className="p-3 text-right">
                        <Input
                          inputMode="decimal"
                          value={String(fromCents(it.amountCents))}
                          onChange={(e) => changeAmount(idx, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="p-3 border-t text-xs text-muted-foreground flex items-center justify-between">
              <div>Soma: {brl.format(fromCents(sumCents))}</div>
              <div className={sumOk ? "text-emerald-600" : "text-rose-600"}>
                {sumOk ? "OK" : "A soma deve bater com o total"}
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-4 space-y-3">
            <div className="font-medium">Dados do fechamento</div>

            <div className="grid gap-1">
              <div className="text-xs text-muted-foreground">Conta bancária</div>
              <Select
                value={bankAccountId ? String(bankAccountId) : ""}
                onValueChange={(v) => setBankAccountId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts
                    .filter((b) => b.active)
                    .map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        #{b.id} · {b.bank_code} · {b.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <div className="text-xs text-muted-foreground">Nº Documento (opcional)</div>
              <Input value={documentNo} onChange={(e) => setDocumentNo(e.target.value)} placeholder="PV-123" />
            </div>

            <div className="grid gap-1">
              <div className="text-xs text-muted-foreground">Observação (opcional)</div>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Boleto com ajuste manual..." />
            </div>

            <div className="text-[11px] text-muted-foreground">
              Editar valor redistribui automaticamente o restante nas próximas parcelas.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={closing}>
            Cancelar
          </Button>
          <Button onClick={doClose} disabled={closing || !sumOk || !bankAccountId}>
            {closing ? "Finalizando..." : "Fechar venda"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
