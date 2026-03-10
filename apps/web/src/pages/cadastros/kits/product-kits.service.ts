import { api } from "@/shared/api/client";
import type {
  ProductKitDetails,
  ProductKitRow,
  ProductKitUpsertPayload,
} from "./product-kits.types";

export async function listProductKits(q?: string) {
  const qs = new URLSearchParams();
  if (q?.trim()) qs.set("q", q.trim());

  return api<ProductKitRow[]>(
    `/product-kits${qs.toString() ? `?${qs.toString()}` : ""}`,
  );
}

export async function getProductKit(id: number) {
  return api<ProductKitDetails>(`/product-kits/${id}`);
}

export async function upsertProductKit(payload: ProductKitUpsertPayload) {
  return api<ProductKitDetails>(`/product-kits`, {
    method: "PUT",
    body: payload,
  });
}