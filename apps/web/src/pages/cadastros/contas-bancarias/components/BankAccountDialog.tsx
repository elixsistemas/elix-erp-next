import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar conta bancária" : "Nova conta bancária"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Atualize os dados bancários, titularidade e operação."
              : "Cadastre uma nova conta para recebimentos, pagamentos e conciliação."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Código do banco</Label>
              <Input
                value={form.bankCode}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, bankCode: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label>Nome da conta</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, name: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Nome do banco</Label>
              <Input
                value={form.bankName}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, bankName: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>ISPB</Label>
              <Input
                value={form.bankIspb}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, bankIspb: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Tipo da conta</Label>
              <Select
                value={form.accountType}
                onValueChange={(v: BankAccountFormState["accountType"]) =>
                  props.setForm((p) => ({ ...p, accountType: v }))
                }
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Corrente</SelectItem>
                  <SelectItem value="savings">Poupança</SelectItem>
                  <SelectItem value="payment">Pagamento</SelectItem>
                  <SelectItem value="cash">Caixa</SelectItem>
                  <SelectItem value="other">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label>Agência</Label>
              <Input
                value={form.agency}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, agency: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Dígito da agência</Label>
              <Input
                value={form.branchDigit}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, branchDigit: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Conta</Label>
              <Input
                value={form.account}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, account: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Dígito da conta</Label>
              <Input
                value={form.accountDigit}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, accountDigit: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Convênio</Label>
              <Input
                value={form.convenio}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, convenio: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Carteira</Label>
              <Input
                value={form.wallet}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, wallet: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label>Código externo</Label>
              <Input
                value={form.externalCode}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, externalCode: e.target.value }))
                }
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Titular</Label>
              <Input
                value={form.holderName}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, holderName: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Documento do titular</Label>
              <Input
                value={form.holderDocument}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, holderDocument: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Tipo de chave PIX</Label>
              <Select
                value={form.pixKeyType}
                onValueChange={(v: any) =>
                  props.setForm((p) => ({ ...p, pixKeyType: v }))
                }
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="phone">Telefone</SelectItem>
                  <SelectItem value="random">Aleatória</SelectItem>
                  <SelectItem value="other">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Chave PIX</Label>
              <Input
                value={form.pixKeyValue}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, pixKeyValue: e.target.value }))
                }
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
            <div className="flex items-center justify-between gap-4">
              <Label>Conta padrão</Label>
              <Switch
                checked={form.isDefault}
                onCheckedChange={(checked) =>
                  props.setForm((p) => ({ ...p, isDefault: checked }))
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label>Permite recebimentos</Label>
              <Switch
                checked={form.allowReceipts}
                onCheckedChange={(checked) =>
                  props.setForm((p) => ({ ...p, allowReceipts: checked }))
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label>Permite pagamentos</Label>
              <Switch
                checked={form.allowPayments}
                onCheckedChange={(checked) =>
                  props.setForm((p) => ({ ...p, allowPayments: checked }))
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label>Conciliação ativa</Label>
              <Switch
                checked={form.reconciliationEnabled}
                onCheckedChange={(checked) =>
                  props.setForm((p) => ({ ...p, reconciliationEnabled: checked }))
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <Label>Conta ativa</Label>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) =>
                  props.setForm((p) => ({ ...p, active: checked }))
                }
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Configurações (JSON opcional)</Label>
              <Input
                value={form.settingsJson}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, settingsJson: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Observações</Label>
              <Input
                value={form.notes}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, notes: e.target.value }))
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
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