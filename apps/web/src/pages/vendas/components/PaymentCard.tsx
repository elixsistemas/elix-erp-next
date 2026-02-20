import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { PaymentTermRow, SaleRow } from "../sales.types";
import { listPaymentTerms, patchSale } from "../sales.service";
import { toast } from "sonner";

type Props = {
  sale: SaleRow;
  disabled?: boolean;
  onSaved: () => Promise<void>;
};

export function PaymentCard({ sale, disabled, onSaved }: Props) {
  const [terms, setTerms] = React.useState<PaymentTermRow[]>([]);
  const [loadingTerms, setLoadingTerms] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [paymentMethodId, setPaymentMethodId] = React.useState<number | "">(sale.payment_method_id ?? "");
  const [paymentTermId, setPaymentTermId] = React.useState<number | "">(sale.payment_term_id ?? "");

  React.useEffect(() => {
    (async () => {
      setLoadingTerms(true);
      try {
        const t = await listPaymentTerms();
        setTerms(t.filter((x) => x.active));
      } catch (e: any) {
        toast.error(String(e?.message ?? "Erro ao listar condições"));
      } finally {
        setLoadingTerms(false);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    try {
      await patchSale(sale.id, {
        paymentMethodId: paymentMethodId === "" ? null : Number(paymentMethodId),
        paymentTermId: paymentTermId === "" ? null : Number(paymentTermId),
      });
      toast.success("Pagamento atualizado.");
      await onSaved();
    } catch (e: any) {
      toast.error(String(e?.message ?? "Erro ao salvar pagamento"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="font-medium">Pagamento</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="grid gap-1">
          <div className="text-xs text-muted-foreground">Forma (payment_method_id)</div>
          <Input
            inputMode="numeric"
            value={paymentMethodId === "" ? "" : String(paymentMethodId)}
            onChange={(e) => setPaymentMethodId(e.target.value ? Number(e.target.value) : "")}
            placeholder="Ex: 1"
            disabled={disabled || saving}
          />
          <div className="text-[11px] text-muted-foreground">
            (Opcional: se você tiver /payment-methods, depois trocamos por Select.)
          </div>
        </div>

        <div className="grid gap-1">
          <div className="text-xs text-muted-foreground">Condição (payment_term_id)</div>
          <Select
            value={paymentTermId === "" ? "" : String(paymentTermId)}
            onValueChange={(v) => setPaymentTermId(v ? Number(v) : "")}
            disabled={disabled || saving || loadingTerms}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingTerms ? "Carregando..." : "Selecione..."} />
            </SelectTrigger>
            <SelectContent>
              {terms.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  #{t.id} · {t.name} ({(t.offsets ?? []).join("/")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={save} disabled={disabled || saving}>
        {saving ? "Salvando..." : "Salvar pagamento"}
      </Button>
    </div>
  );
}
