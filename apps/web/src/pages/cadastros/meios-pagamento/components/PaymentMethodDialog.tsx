import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentMethod, PaymentMethodFormState } from "../payment-methods.types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: PaymentMethod | null;
  saving: boolean;
  form: PaymentMethodFormState;
  setForm: (fn: (prev: PaymentMethodFormState) => PaymentMethodFormState) => void;
  onSave: () => void;
};

export function PaymentMethodDialog(props: Props) {
  const { editing, saving, form } = props;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar meio de pagamento" : "Novo meio de pagamento"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Atualize as regras financeiras e de integração."
              : "Cadastre um novo meio de pagamento para uso comercial e financeiro."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Código</Label>
              <Input
                value={form.code}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, code: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, name: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v: PaymentMethodFormState["type"]) =>
                  props.setForm((p) => ({ ...p, type: v }))
                }
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="credit_card">Cartão crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão débito</SelectItem>
                  <SelectItem value="bank_transfer">Transferência</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="wallet">Carteira</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Tipo de integração</Label>
              <Select
                value={form.integrationType}
                onValueChange={(v: PaymentMethodFormState["integrationType"]) =>
                  props.setForm((p) => ({ ...p, integrationType: v }))
                }
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="gateway">Gateway</SelectItem>
                  <SelectItem value="bank">Banco</SelectItem>
                  <SelectItem value="acquirer">Adquirente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label>Descrição</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, description: e.target.value }))
                }
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Liquidação (dias)</Label>
              <Input
                value={form.settlementDays}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, settlementDays: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Taxa (%)</Label>
              <Input
                value={form.feePercent}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, feePercent: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Taxa fixa</Label>
              <Input
                value={form.feeFixed}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, feeFixed: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Código externo</Label>
              <Input
                value={form.externalCode}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, externalCode: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Ordem</Label>
              <Input
                value={form.sortOrder}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, sortOrder: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Máx. parcelas</Label>
              <Input
                value={form.maxInstallments}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, maxInstallments: e.target.value }))
                }
                disabled={saving || !form.allowsInstallments}
              />
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Permite parcelamento</Label>
              </div>
              <Switch
                checked={form.allowsInstallments}
                onCheckedChange={(checked) =>
                  props.setForm((p) => ({
                    ...p,
                    allowsInstallments: checked,
                    maxInstallments: checked ? p.maxInstallments || "2" : "1",
                  }))
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Exige conta bancária</Label>
              </div>
              <Switch
                checked={form.requiresBankAccount}
                onCheckedChange={(checked) =>
                  props.setForm((p) => ({ ...p, requiresBankAccount: checked }))
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Padrão</Label>
              </div>
              <Switch
                checked={form.isDefault}
                onCheckedChange={(checked) =>
                  props.setForm((p) => ({ ...p, isDefault: checked }))
                }
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Ativo</Label>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) =>
                  props.setForm((p) => ({ ...p, active: checked }))
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