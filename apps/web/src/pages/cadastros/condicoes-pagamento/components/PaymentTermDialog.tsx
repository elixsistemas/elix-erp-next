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
import type { PaymentTerm, PaymentTermFormState } from "../payment-terms.types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: PaymentTerm | null;
  saving: boolean;
  form: PaymentTermFormState;
  setForm: (fn: (prev: PaymentTermFormState) => PaymentTermFormState) => void;
  onSave: () => void;
};

export function PaymentTermDialog(props: Props) {
  const { editing, saving, form } = props;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar condição de pagamento" : "Nova condição de pagamento"}
          </DialogTitle>
          <DialogDescription>
            Use os vencimentos em dias separados por barra, vírgula, espaço ou ponto e vírgula.
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

            <div className="grid gap-2">
              <Label>Vencimentos (dias)</Label>
              <Input
                placeholder="Ex.: 0 | 30/60 | 10,40,70"
                value={form.offsets}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, offsets: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select
                value={form.termType}
                onValueChange={(v: PaymentTermFormState["termType"]) =>
                  props.setForm((p) => ({ ...p, termType: v }))
                }
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">À vista</SelectItem>
                  <SelectItem value="installment">Parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Carência (dias)</Label>
              <Input
                value={form.graceDays}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, graceDays: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Juros</Label>
              <Select
                value={form.interestMode}
                onValueChange={(v: PaymentTermFormState["interestMode"]) =>
                  props.setForm((p) => ({ ...p, interestMode: v }))
                }
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="fixed">Valor fixo</SelectItem>
                  <SelectItem value="percent">Percentual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Valor do juros</Label>
              <Input
                value={form.interestValue}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, interestValue: e.target.value }))
                }
                disabled={saving || form.interestMode === "none"}
              />
            </div>

            <div className="grid gap-2">
              <Label>Desconto</Label>
              <Select
                value={form.discountMode}
                onValueChange={(v: PaymentTermFormState["discountMode"]) =>
                  props.setForm((p) => ({ ...p, discountMode: v }))
                }
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="fixed">Valor fixo</SelectItem>
                  <SelectItem value="percent">Percentual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Valor do desconto</Label>
              <Input
                value={form.discountValue}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, discountValue: e.target.value }))
                }
                disabled={saving || form.discountMode === "none"}
              />
            </div>

            <div className="grid gap-2">
              <Label>Multa</Label>
              <Input
                value={form.penaltyValue}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, penaltyValue: e.target.value }))
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
          </div>

          <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Desconto antecipado</Label>
              </div>
              <Switch
                checked={form.allowsEarlyPaymentDiscount}
                onCheckedChange={(checked) =>
                  props.setForm((p) => ({
                    ...p,
                    allowsEarlyPaymentDiscount: checked,
                  }))
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
                <Label>Ativa</Label>
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