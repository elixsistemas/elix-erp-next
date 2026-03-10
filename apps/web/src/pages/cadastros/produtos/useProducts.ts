import * as React from "react";
import { toast } from "sonner";

import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductKind,
} from "./products.types";

import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "./products.service";

import {
  ProductUpsertSchema,
  type ProductUpsertForm,
} from "./products.schema";

type Mode = "create" | "edit";

export function useProducts() {
  const [rows, setRows] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [q, setQ] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);

  const [kind, setKind] = React.useState<
    "all" | ProductKind
  >("all");

  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("create");

  const [editing, setEditing] = React.useState<Product | null>(
    null,
  );

  const reload = React.useCallback(async () => {
    setLoading(true);

    try {
      const data = await listProducts({
        q: q.trim() ? q.trim() : undefined,
        limit: 50,
        active: showInactive ? undefined : 1,
        kind: kind === "all" ? undefined : kind,
      });

      setRows(data);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao listar produtos");
    } finally {
      setLoading(false);
    }
  }, [q, showInactive, kind]);

  React.useEffect(() => {
    const t = setTimeout(() => void reload(), 350);
    return () => clearTimeout(t);
  }, [q, showInactive, kind, reload]);

  function onCreate() {
    setMode("create");
    setEditing(null);
    setOpen(true);
  }

  function onEdit(row: Product) {
    setMode("edit");
    setEditing(row);
    setOpen(true);
  }

  async function onRemove(row: Product) {
    if (!confirm(`Desativar o item "${row.name}"?`)) return;

    try {
      await deleteProduct(row.id);
      toast.success("Item desativado");
      await reload();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao desativar item");
    }
  }

  async function onSubmit(form: ProductUpsertForm) {
    const parsed = ProductUpsertSchema.safeParse(form);

    if (!parsed.success) {
      toast.error(
        parsed.error.issues?.[0]?.message ??
          "Validação falhou",
      );
      return;
    }

    setSaving(true);

    try {
      const payload = sanitizePayload(parsed.data);

      if (mode === "create") {
        await createProduct(payload as ProductCreate);
        toast.success("Item criado");
      } else {
        if (!editing) throw new Error("Edição inválida");

        await updateProduct(
          editing.id,
          payload as ProductUpdate,
        );

        toast.success("Item atualizado");
      }

      setOpen(false);
      setEditing(null);

      await reload();
    } catch (e: any) {
      const msg = String(e?.message ?? "");

      if (msg.includes("SKU_ALREADY_EXISTS"))
        toast.error("SKU já existe para esta empresa.");
      else if (msg.includes("EAN_ALREADY_EXISTS"))
        toast.error("EAN já existe para esta empresa.");
      else toast.error(e?.message ?? "Falha ao salvar item");
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

    kind,
    setKind,

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

function sanitizePayload(data: ProductUpsertForm) {
  const toNull = (v: any) =>
    v === "" || typeof v === "undefined" ? null : v;

  const kind: ProductKind = data.kind ?? "product";

  let trackInventory = true;

  if (kind === "service") trackInventory = false;
  else if (kind === "kit") trackInventory = false;
  else if (kind === "consumable")
    trackInventory = Boolean(
      data.track_inventory ?? false,
    );
  else trackInventory = Boolean(
      data.track_inventory ?? true,
    );

  return {
    ...data,
    kind,
    track_inventory: trackInventory,

    sku: toNull(data.sku),
    description: toNull(data.description),
    uom: toNull(data.uom),

    ncm: toNull(data.ncm),
    ncm_id: toNull(data.ncm_id),

    ean: toNull(data.ean),

    cest: toNull(data.cest),

    fiscal_json: toNull(data.fiscal_json),

    image_url: toNull(data.image_url),

    weight_kg:
      typeof data.weight_kg === "number"
        ? data.weight_kg
        : null,

    width_cm:
      typeof data.width_cm === "number"
        ? data.width_cm
        : null,

    height_cm:
      typeof data.height_cm === "number"
        ? data.height_cm
        : null,

    length_cm:
      typeof data.length_cm === "number"
        ? data.length_cm
        : null,

    active:
      typeof data.active === "boolean"
        ? data.active
        : true,
  };
}