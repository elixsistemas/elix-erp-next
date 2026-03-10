import * as React from "react";
import { toast } from "sonner";

import type {
  Service,
  ServiceCreate,
  ServiceUpdate,
} from "./services.types";

import {
  createService,
  deleteService,
  listServices,
  updateService,
} from "./services.service";

import {
  ServiceUpsertSchema,
  type ServiceUpsertForm,
} from "./services.schema";

type Mode = "create" | "edit";

export function useServices() {
  const [rows, setRows] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [q, setQ] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("create");
  const [editing, setEditing] = React.useState<Service | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);

    try {
      const data = await listServices({
        q: q.trim() ? q.trim() : undefined,
        limit: 50,
        active: showInactive ? undefined : 1,
      });

      setRows(data);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao listar serviços");
    } finally {
      setLoading(false);
    }
  }, [q, showInactive]);

  React.useEffect(() => {
    const t = setTimeout(() => void reload(), 350);
    return () => clearTimeout(t);
  }, [q, showInactive, reload]);

  function onCreate() {
    setMode("create");
    setEditing(null);
    setOpen(true);
  }

  function onEdit(row: Service) {
    setMode("edit");
    setEditing(row);
    setOpen(true);
  }

  async function onRemove(row: Service) {
    if (!confirm(`Desativar o serviço "${row.name}"?`)) return;

    try {
      await deleteService(row.id);
      toast.success("Serviço desativado");
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao desativar serviço");
    }
  }

  async function onSubmit(form: ServiceUpsertForm) {
    const parsed = ServiceUpsertSchema.safeParse(form);

    if (!parsed.success) {
      toast.error(
        parsed.error.issues?.[0]?.message ?? "Validação falhou",
      );
      return;
    }

    setSaving(true);

    try {
      const payload = sanitizePayload(parsed.data);

      if (mode === "create") {
        await createService(payload as ServiceCreate);
        toast.success("Serviço criado");
      } else {
        if (!editing) throw new Error("Edição inválida");

        await updateService(editing.id, payload as ServiceUpdate);
        toast.success("Serviço atualizado");
      }

      setOpen(false);
      setEditing(null);

      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao salvar serviço");
    } finally {
      setSaving(false);
    }
  }

  return {
    rows,
    loading,
    saving,
    q,
    setQ,
    showInactive,
    setShowInactive,
    open,
    setOpen,
    mode,
    editing,
    reload,
    onCreate,
    onEdit,
    onRemove,
    onSubmit,
  };
}

function sanitizePayload(data: ServiceUpsertForm) {
  const toNull = (v: any) =>
    v === "" || typeof v === "undefined" ? null : v;

  return {
    ...data,
    sku: toNull(data.sku),
    description: toNull(data.description),
    uom: toNull(data.uom),
    uom_id: toNull(data.uom_id),
    image_url: toNull(data.image_url),
    active:
      typeof data.active === "boolean"
        ? data.active
        : true,
  };
}