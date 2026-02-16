// components/BankAccountDialog.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import type { BankAccount } from "../bank-accounts.types";
import type { BankAccountFormState } from "../bank-accounts.schemas";

export function BankAccountDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  editing: BankAccount | null;
  saving: boolean;

  form: BankAccountFormState;
  setForm: (fn: (prev: BankAccountFormState) => BankAccountFormState) => void;

  onSave: () => void;
}) {
  const { editing, saving, form } = props;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar conta bancária" : "Nova conta bancária"}</DialogTitle>
          <DialogDescription>
            {editing ? "Atualize os dados principais da conta." : "Cadastre uma nova conta para movimentação e conciliação."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Código do banco</Label>
            <Input
              placeholder="Ex: 237"
              value={form.bankCode}
              onChange={(e) => props.setForm((p) => ({ ...p, bankCode: e.target.value }))}
              disabled={!!editing || saving}
            />
            {editing && <p className="text-xs text-slate-500">Banco não editável (por enquanto).</p>}
          </div>

          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              placeholder="Ex: Bradesco Matriz"
              value={form.name}
              onChange={(e) => props.setForm((p) => ({ ...p, name: e.target.value }))}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label>Agência</Label>
            <Input
              value={form.agency}
              onChange={(e) => props.setForm((p) => ({ ...p, agency: e.target.value }))}
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-2">
              <Label>Conta</Label>
              <Input
                value={form.account}
                onChange={(e) => props.setForm((p) => ({ ...p, account: e.target.value }))}
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Dígito</Label>
              <Input
                value={form.accountDigit}
                onChange={(e) => props.setForm((p) => ({ ...p, accountDigit: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Convênio</Label>
            <Input
              value={form.convenio}
              onChange={(e) => props.setForm((p) => ({ ...p, convenio: e.target.value }))}
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label>Carteira</Label>
            <Input
              value={form.wallet}
              onChange={(e) => props.setForm((p) => ({ ...p, wallet: e.target.value }))}
              disabled={saving}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label>Configurações (JSON opcional)</Label>
            <Input
              placeholder='Ex: {"cnab":"400","banco":"inter"}'
              value={form.settingsJson}
              onChange={(e) => props.setForm((p) => ({ ...p, settingsJson: e.target.value }))}
              disabled={saving}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => props.onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={props.onSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
