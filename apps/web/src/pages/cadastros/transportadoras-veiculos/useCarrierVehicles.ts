import * as React from "react";
import { toast } from "sonner";
import { useDebouncedValue } from "@/shared/br/hooks/useDebouncedValue";

import type {
  CarrierVehicle,
  CarrierOption,
  CarrierVehicleFormValues,
} from "./carrierVehicles.types";
import {
  carrierVehicleFormSchema,
  EMPTY_CARRIER_VEHICLE_FORM,
  normalizeCarrierVehiclePayload,
} from "./carrierVehicles.schema";
import * as svc from "./carrierVehicles.service";

type Mode = "create" | "edit";

export function useCarrierVehicles(initialCarrierId?: string) {
  const [rows, setRows] = React.useState<CarrierVehicle[]>([]);
  const [carrierOptions, setCarrierOptions] = React.useState<CarrierOption[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [q, setQ] = React.useState("");
  const debouncedQ = useDebouncedValue(q, 300);

  const [carrierIdFilter, setCarrierIdFilter] = React.useState(initialCarrierId ?? "");
  const [showInactive, setShowInactive] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("create");
  const [editing, setEditing] = React.useState<CarrierVehicle | null>(null);
  const [saving, setSaving] = React.useState(false);

  async function loadOptions() {
    try {
      const data = await svc.listCarrierOptions();
      setCarrierOptions(data);
    } catch (err) {
      console.error(err);
      setCarrierOptions([]);
    }
  }

  async function reload() {
    setLoading(true);
    try {
      const data = await svc.listCarrierVehicles({
        q: debouncedQ,
        active: showInactive ? undefined : "1",
        carrierId: carrierIdFilter || undefined,
      });
      setRows(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao carregar veículos", {
        description: err?.message || "Tente novamente.",
      });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void loadOptions();
  }, []);

  React.useEffect(() => {
    setCarrierIdFilter(initialCarrierId ?? "");
  }, [initialCarrierId]);

  React.useEffect(() => {
    void reload();
  }, [debouncedQ, showInactive, carrierIdFilter]);

  function onCreate() {
    setMode("create");
    setEditing(null);
    setOpen(true);
  }

  function onEdit(row: CarrierVehicle) {
    setMode("edit");
    setEditing(row);
    setOpen(true);
  }

  async function onRemove(row: CarrierVehicle) {
    try {
      await svc.deleteCarrierVehicle(row.id);
      toast.success("Veículo removido");
      await reload();
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao remover veículo", {
        description: err?.message || "Tente novamente.",
      });
    }
  }

  async function onSubmit(formData: CarrierVehicleFormValues) {
    const parsed = carrierVehicleFormSchema.safeParse(formData);

    if (!parsed.success) {
      toast.error("Revise o formulário", {
        description: parsed.error.issues?.[0]?.message || "Dados inválidos.",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = normalizeCarrierVehiclePayload(parsed.data);

      if (mode === "create") {
        await svc.createCarrierVehicle(payload);
        toast.success("Veículo criado");
      } else if (editing) {
        await svc.updateCarrierVehicle(editing.id, payload);
        toast.success("Veículo atualizado");
      }

      setOpen(false);
      await reload();
    } catch (err: any) {
      console.error(err);

      toast.error("Falha ao salvar veículo", {
        description:
          err?.message === "PLATE_ALREADY_EXISTS"
            ? "Já existe um veículo com esta placa."
            : err?.message === "CARRIER_NOT_FOUND"
              ? "Transportadora não encontrada."
              : err?.message || "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  return {
    rows,
    carrierOptions,
    loading,
    q,
    setQ,
    carrierIdFilter,
    setCarrierIdFilter,
    showInactive,
    setShowInactive,
    open,
    setOpen,
    mode,
    editing,
    saving,
    reload,
    onCreate,
    onEdit,
    onRemove,
    onSubmit,
  };
}