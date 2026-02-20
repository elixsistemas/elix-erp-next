import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "./useCompany";
import { CompanyFormSheet } from "./components/CompanyFormSheet";
import { maskCNPJ, maskCep, maskPhoneBR } from "@/shared/br/masks";
import { onlyDigits } from "@/shared/br/digits";

export default function CompanyPage() {
  const vm = useCompany();
  const c = vm.company;

  const cnpjMasked = c?.cnpj ? maskCNPJ(onlyDigits(c.cnpj)) : "—";
  const cepMasked = c?.zip_code ? maskCep(onlyDigits(c.zip_code)) : "—";
  const phoneMasked = c?.phone ? maskPhoneBR(onlyDigits(c.phone)) : "—";

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Minha Empresa</div>
          <div className="text-sm text-muted-foreground">
            Dados do emitente para Orçamentos, Pedidos, Vendas e documentos.
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={vm.reload} disabled={vm.loading}>
            Atualizar
          </Button>
          <Button onClick={() => vm.setOpen(true)} disabled={!c}>
            Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="border rounded-lg p-4 space-y-2">
          <div className="text-sm text-muted-foreground">Identidade</div>
          <div className="font-medium">{c?.name ?? (vm.loading ? "Carregando..." : "—")}</div>
          <div className="text-sm">CNPJ: <span className="font-mono tabular-nums">{cnpjMasked}</span></div>
          <div className="text-sm">Razão: {c?.legal_name ?? "—"}</div>
          <div className="text-sm">Fantasia: {c?.trade_name ?? "—"}</div>
        </div>

        <div className="border rounded-lg p-4 space-y-2">
          <div className="text-sm text-muted-foreground">Contato</div>
          <div className="text-sm">Email: {c?.email ?? "—"}</div>
          <div className="text-sm">Telefone: <span className="font-mono tabular-nums">{phoneMasked}</span></div>
          <div className="text-sm">Site: {c?.website ?? "—"}</div>
        </div>

        <div className="border rounded-lg p-4 space-y-2">
          <div className="text-sm text-muted-foreground">Status e Padrões</div>
          <div className="text-sm">
            Status:{" "}
            {c?.is_active ?? true ? <Badge>Ativa</Badge> : <Badge variant="destructive">Inativa</Badge>}
          </div>
          <div className="text-sm">
            Estoque negativo:{" "}
            {(c?.allow_negative_stock ?? false) ? <Badge variant="secondary">Permitido</Badge> : <Badge variant="outline">Bloqueado</Badge>}
          </div>
          <div className="text-sm">
            Conta padrão:{" "}
            {c?.default_bank_account_id ? `#${c.default_bank_account_id}` : "—"}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-2">
        <div className="text-sm text-muted-foreground">Endereço</div>
        <div className="text-sm">
          CEP: <span className="font-mono tabular-nums">{cepMasked}</span>
        </div>
        <div className="text-sm">{c?.address_line1 ?? "—"}</div>
        <div className="text-sm">{c?.district ?? ""} {c?.city ? `• ${c.city}/${c.state ?? ""}` : ""}</div>
        <div className="text-sm">{c?.country ?? "BR"}</div>
      </div>

      <CompanyFormSheet
        open={vm.open}
        onOpenChange={vm.setOpen}
        company={vm.company}
        bankAccounts={vm.bankAccounts}
        saving={vm.saving}
        onSave={vm.save}
      />
    </div>
  );
}
