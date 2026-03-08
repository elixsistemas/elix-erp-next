import * as React from "react";
import { toast } from "sonner";
import { useDebouncedValue } from "@/shared/br/hooks/useDebouncedValue";

import type { Carrier } from "./carriers.types";
import {
  carrierFormSchema,
  EMPTY_CARRIER_FORM,
  normalizeCarrierPayload,
} from "./carriers.schema";
import * as svc from "./carriers.service";

type Mode = "create" | "edit";

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
    setOpen(true);
  }

  function onEdit(row: Carrier) {
    setMode("edit");
    setEditing(row);
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

  async function onSubmit(formData: any) {
    const parsed = carrierFormSchema.safeParse(formData);

    if (!parsed.success) {
      toast.error("Revise o formulário", {
        description: parsed.error.issues?.[0]?.message || "Dados inválidos.",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = normalizeCarrierPayload(parsed.data);

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
    reload,
    onCreate,
    onEdit,
    onRemove,
    onSubmit,
  };
}