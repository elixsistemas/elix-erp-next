import * as React from "react";
import { toast } from "sonner";
import { onlyDigits } from "@/shared/br/digits";
import { useDebouncedValue } from "@/shared/br/hooks/useDebouncedValue";
import type { Carrier, CarrierFormValues } from "./carriers.types";
import {
  carrierFormSchema,
  EMPTY_CARRIER_FORM,
  normalizeCarrierPayload,
} from "./carriers.schema";
import * as svc from "./carriers.service";

type Mode = "create" | "edit";

function toNull<T>(v: T | "" | undefined | null) {
  return v === "" || typeof v === "undefined" ? null : v;
}

function sanitizePayload(data: CarrierFormValues) {
  const payload = normalizeCarrierPayload(data);

  return {
    ...payload,
    document: toNull(onlyDigits(payload.document ?? "")),
    phone: toNull(onlyDigits(payload.phone ?? "")),
    zipCode: toNull(onlyDigits(payload.zipCode ?? "")),
    state: payload.state ? payload.state.toUpperCase() : null,
    plate: payload.plate ? payload.plate.toUpperCase() : null,
  };
}

export function useCarriers() {
  const [rows, setRows] = React.useState<Carrier[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [q, setQ] = React.useState("");
  const debouncedQ = useDebouncedValue(q, 300);
  const [showInactive, setShowInactive] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("create");
  const [editing, setEditing] = React.useState<Carrier | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState<CarrierFormValues>(EMPTY_CARRIER_FORM);

  async function reload() {
    setLoading(true);
    try {
      const data = await svc.listCarriers({
        q: debouncedQ,
        active: showInactive ? undefined : "1",
      });
      setRows(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao carregar transportadoras", {
        description: err?.message || "Tente novamente.",
      });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void reload();
  }, [debouncedQ, showInactive]);

  function onCreate() {
    setMode("create");
    setEditing(null);
    setForm(EMPTY_CARRIER_FORM);
    setOpen(true);
  }

  function onEdit(row: Carrier) {
    setMode("edit");
    setEditing(row);
    setForm({
      code: row.code ?? "",
      name: row.name ?? "",
      legal_name: row.legal_name ?? "",
      document: row.document ?? "",
      state_registration: row.state_registration ?? "",
      rntrc: row.rntrc ?? "",

      email: row.email ?? "",
      phone: row.phone ?? "",
      contact_name: row.contact_name ?? "",

      zip_code: row.zip_code ?? "",
      street: row.street ?? "",
      street_number: row.street_number ?? "",
      complement: row.complement ?? "",
      neighborhood: row.neighborhood ?? "",
      city: row.city ?? "",
      state: row.state ?? "",

      vehicle_type: row.vehicle_type ?? "",
      plate: row.plate ?? "",

      notes: row.notes ?? "",
      active: !!row.active,
    });
    setOpen(true);
  }

  async function onRemove(row: Carrier) {
    try {
      await svc.deleteCarrier(row.id);
      toast.success("Transportadora removida");
      await reload();
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao remover transportadora", {
        description: err?.message || "Tente novamente.",
      });
    }
  }

  async function onSubmit(data?: CarrierFormValues) {
    const current = data ?? form;
    const parsed = carrierFormSchema.safeParse(current);

    if (!parsed.success) {
      toast.error("Revise o formulário", {
        description: parsed.error.issues?.[0]?.message || "Dados inválidos.",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = sanitizePayload(parsed.data);

      if (mode === "create") {
        await svc.createCarrier(payload);
        toast.success("Transportadora criada");
      } else if (editing) {
        await svc.updateCarrier(editing.id, payload);
        toast.success("Transportadora atualizada");
      }

      setOpen(false);
      await reload();
    } catch (err: any) {
      console.error(err);
      toast.error("Falha ao salvar transportadora", {
        description:
          err?.message === "DOCUMENT_ALREADY_EXISTS"
            ? "Já existe uma transportadora com este documento."
            : err?.message || "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  }

  return {
    rows,
    loading,
    q,
    setQ,
    showInactive,
    setShowInactive,
    open,
    setOpen,
    mode,
    editing,
    saving,
    form,
    setForm,
    reload,
    onCreate,
    onEdit,
    onRemove,
    onSubmit,
  };
}