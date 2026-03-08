import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  CarrierOption,
  CarrierVehicle,
  CarrierVehicleFormValues,
} from "../carrierVehicles.types";
import { EMPTY_CARRIER_VEHICLE_FORM } from "../carrierVehicles.schema";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  saving: boolean;
  initialData: CarrierVehicle | null;
  carrierOptions: CarrierOption[];
  onSubmit: (data: CarrierVehicleFormValues) => Promise<void> | void;
};

export function CarrierVehicleSheet({
  open,
  onOpenChange,
  mode,
  saving,
  initialData,
  carrierOptions,
  onSubmit,
}: Props) {
  const [tab, setTab] = React.useState("geral");
  const [form, setForm] = React.useState<CarrierVehicleFormValues>(
    EMPTY_CARRIER_VEHICLE_FORM,
  );

  React.useEffect(() => {
    if (!open) return;

    setTab("geral");

    if (mode === "edit" && initialData) {
      setForm({
        carrierId: String(initialData.carrier_id),

        plate: initialData.plate ?? "",
        secondaryPlate: initialData.secondary_plate ?? "",

        renavam: initialData.renavam ?? "",
        state: initialData.state ?? "",

        vehicleType: initialData.vehicle_type ?? "",
        bodyType: initialData.body_type ?? "",
        brandModel: initialData.brand_model ?? "",

        capacityKg:
          initialData.capacity_kg != null ? String(initialData.capacity_kg) : "",
        capacityM3:
          initialData.capacity_m3 != null ? String(initialData.capacity_m3) : "",
        taraKg: initialData.tara_kg != null ? String(initialData.tara_kg) : "",

        rntrc: initialData.rntrc ?? "",
        notes: initialData.notes ?? "",

        active: !!initialData.active,
      });
      return;
    }

    setForm(EMPTY_CARRIER_VEHICLE_FORM);
  }, [open, mode, initialData]);

  function set<K extends keyof CarrierVehicleFormValues>(
    key: K,
    value: CarrierVehicleFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    await onSubmit(form);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Novo veículo" : `Editar veículo #${initialData?.id ?? ""}`}
          </SheetTitle>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="capacidade">Capacidade</TabsTrigger>
            <TabsTrigger value="observacoes">Observações</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-4">
                <Label>Transportadora</Label>
                <Select
                  value={form.carrierId}
                  onValueChange={(value) => set("carrierId", value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a transportadora" />
                  </SelectTrigger>
                  <SelectContent>
                    {carrierOptions.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.trade_name || item.legal_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="plate">Placa</Label>
                <Input
                  id="plate"
                  value={form.plate}
                  onChange={(e) => set("plate", e.target.value.toUpperCase())}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="secondaryPlate">Placa secundária</Label>
                <Input
                  id="secondaryPlate"
                  value={form.secondaryPlate}
                  onChange={(e) =>
                    set("secondaryPlate", e.target.value.toUpperCase())
                  }
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="state">UF</Label>
                <Input
                  id="state"
                  maxLength={2}
                  value={form.state}
                  onChange={(e) => set("state", e.target.value.toUpperCase())}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="renavam">Renavam</Label>
                <Input
                  id="renavam"
                  value={form.renavam}
                  onChange={(e) => set("renavam", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="vehicleType">Tipo de veículo</Label>
                <Input
                  id="vehicleType"
                  value={form.vehicleType}
                  onChange={(e) => set("vehicleType", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="bodyType">Tipo de carroceria</Label>
                <Input
                  id="bodyType"
                  value={form.bodyType}
                  onChange={(e) => set("bodyType", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="brandModel">Marca / Modelo</Label>
                <Input
                  id="brandModel"
                  value={form.brandModel}
                  onChange={(e) => set("brandModel", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="rntrc">RNTRC</Label>
                <Input
                  id="rntrc"
                  value={form.rntrc}
                  onChange={(e) => set("rntrc", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="md:col-span-4 rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.active}
                    onCheckedChange={(checked) => set("active", checked)}
                    disabled={saving}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Veículo ativo</span>
                    <span className="text-xs text-muted-foreground">
                      Disponível para uso na operação.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="capacidade" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="capacityKg">Capacidade (kg)</Label>
                <Input
                  id="capacityKg"
                  value={form.capacityKg}
                  onChange={(e) => set("capacityKg", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="capacityM3">Capacidade (m³)</Label>
                <Input
                  id="capacityM3"
                  value={form.capacityM3}
                  onChange={(e) => set("capacityM3", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="taraKg">Tara (kg)</Label>
                <Input
                  id="taraKg"
                  value={form.taraKg}
                  onChange={(e) => set("taraKg", e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="observacoes" className="mt-4 space-y-4">
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                disabled={saving}
                placeholder="Informações operacionais do veículo."
              />
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}