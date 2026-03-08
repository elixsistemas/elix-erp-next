import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Carrier } from "./carriers.types";
import {
  carrierFormSchema,
  normalizeCarrierPayload,
  type CarrierFormValues,
} from "./carriers.schema";
import * as svc from "./carriers.service";

const EMPTY_FORM: CarrierFormValues = {
  code: "",
  name: "",
  legalName: "",
  document: "",
  stateRegistration: "",
  rntrc: "",

  email: "",
  phone: "",
  contactName: "",

  zipCode: "",
  street: "",
  streetNumber: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",

  vehicleType: "",
  plate: "",
  notes: "",
  active: true,
};

export function useCarriers() {
  const [items, setItems] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"1" | "0" | "all">("1");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Carrier | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CarrierFormValues>(EMPTY_FORM);

  const filtered = useMemo(() => items, [items]);

  async function load() {
    setLoading(true);
    try {
      const list = await svc.listCarriers({
        q,
        active: statusFilter === "all" ? undefined : statusFilter,
      });
      setItems(list);
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao carregar transportadoras", {
        description: e?.message || "Verifique backend/token",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  }

  function openEdit(row: Carrier) {
    setEditing(row);
    setForm({
      code: row.code ?? "",
      name: row.name ?? "",
      legalName: row.legal_name ?? "",
      document: row.document ?? "",
      stateRegistration: row.state_registration ?? "",
      rntrc: row.rntrc ?? "",

      email: row.email ?? "",
      phone: row.phone ?? "",
      contactName: row.contact_name ?? "",

      zipCode: row.zip_code ?? "",
      street: row.street ?? "",
      streetNumber: row.street_number ?? "",
      complement: row.complement ?? "",
      neighborhood: row.neighborhood ?? "",
      city: row.city ?? "",
      state: row.state ?? "",

      vehicleType: row.vehicle_type ?? "",
      plate: row.plate ?? "",
      notes: row.notes ?? "",
      active: !!row.active,
    });
    setOpen(true);
  }

  async function save() {
    const parsed = carrierFormSchema.safeParse(form);

    if (!parsed.success) {
      toast.error("Revise o formulário", {
        description: parsed.error.issues?.[0]?.message ?? "Dados inválidos",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = normalizeCarrierPayload(parsed.data);

      if (editing) {
        await svc.updateCarrier(editing.id, payload);
        toast.success("Transportadora atualizada");
      } else {
        await svc.createCarrier(payload);
        toast.success("Transportadora criada");
      }

      setOpen(false);
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao salvar transportadora", {
        description:
          e?.message === "DOCUMENT_ALREADY_EXISTS"
            ? "Já existe uma transportadora com este documento"
            : e?.message || "Tente novamente",
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Carrier) {
    try {
      await svc.deleteCarrier(row.id);
      toast.success("Transportadora removida");
      await load();
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao remover", {
        description: e?.message || "Tente novamente",
      });
    }
  }

  return {
    items,
    filtered,
    loading,
    q,
    setQ,
    statusFilter,
    setStatusFilter,
    open,
    setOpen,
    editing,
    form,
    setForm,
    saving,
    load,
    openCreate,
    openEdit,
    save,
    remove,
  };
}