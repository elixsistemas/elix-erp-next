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
import type { Carrier } from "../carriers.types";
import type { CarrierFormValues } from "../carriers.schema";
import { BrDocumentInput } from "@/shared/br/ui/BrDocumentInput";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Carrier | null;
  saving: boolean;
  form: CarrierFormValues;
  setForm: (fn: (prev: CarrierFormValues) => CarrierFormValues) => void;
  onSave: () => void;
};

const inferredPersonType = (form.document ?? "").replace(/\D/g, "").length > 11 ? "PJ" : "PF";

export function CarriersDialog(props: Props) {
  const { editing, saving, form } = props;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar transportadora" : "Nova transportadora"}
          </DialogTitle>
          <DialogDescription>
            Cadastre dados fiscais, contato e endereço da transportadora.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-2">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Código</Label>
              <Input
                value={form.code || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, code: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => props.setForm((p) => ({ ...p, name: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label>Razão social</Label>
              <Input
                value={form.legalName || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, legalName: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>CPF/CNPJ</Label>
                <BrDocumentInput
                value={form.document || ""}
                onChange={(value) => props.setForm((p) => ({ ...p, document: value }))}
                personType={inferredPersonType}
                />
            </div>

            <div className="grid gap-2">
              <Label>Inscrição estadual</Label>
              <Input
                value={form.stateRegistration || ""}
                onChange={(e) =>
                  props.setForm((p) => ({ ...p, stateRegistration: e.target.value }))
                }
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>RNTRC</Label>
              <Input
                value={form.rntrc || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, rntrc: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Contato</Label>
              <Input
                value={form.contactName || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, contactName: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Telefone</Label>
              <Input
                value={form.phone || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, phone: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>E-mail</Label>
              <Input
                value={form.email || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, email: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="grid gap-2">
              <Label>CEP</Label>
              <Input
                value={form.zipCode || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, zipCode: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2 md:col-span-2">
              <Label>Rua</Label>
              <Input
                value={form.street || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, street: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Número</Label>
              <Input
                value={form.streetNumber || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, streetNumber: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Complemento</Label>
              <Input
                value={form.complement || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, complement: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Bairro</Label>
              <Input
                value={form.neighborhood || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, neighborhood: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Cidade</Label>
              <Input
                value={form.city || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, city: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>UF</Label>
              <Input
                value={form.state || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, state: e.target.value }))}
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Tipo de veículo</Label>
              <Input
                value={form.vehicleType || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, vehicleType: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2">
              <Label>Placa</Label>
              <Input
                value={form.plate || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, plate: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <Label>Ativa</Label>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => props.setForm((p) => ({ ...p, active: checked }))}
                disabled={saving}
              />
            </div>

            <div className="grid gap-2 md:col-span-3">
              <Label>Observações</Label>
              <Input
                value={form.notes || ""}
                onChange={(e) => props.setForm((p) => ({ ...p, notes: e.target.value }))}
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