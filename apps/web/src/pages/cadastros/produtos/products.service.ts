import { api } from "@/shared/api/client";
import type {
  ListProductsQuery,
  Product,
  ProductCreate,
  ProductStockResponse,
  ProductUpdate,
} from "./products.types";

export async function listProducts(
  query: ListProductsQuery = {},
): Promise<Product[]> {
  const qs = new URLSearchParams();

  if (query.q?.trim()) qs.set("q", query.q.trim());
  if (query.limit) qs.set("limit", String(query.limit));
  if (typeof query.active === "number") qs.set("active", String(query.active));
  if (query.kind) qs.set("kind", query.kind);

  const url = `/products${qs.toString() ? `?${qs.toString()}` : ""}`;
  return api<Product[]>(url);
}

export async function getProduct(id: number): Promise<Product> {
  return api<Product>(`/products/${id}`);
}

export async function createProduct(body: ProductCreate): Promise<Product> {
  return api<Product>(`/products`, { method: "POST", body });
}

export async function updateProduct(
  id: number,
  body: ProductUpdate,
): Promise<Product> {
  return api<Product>(`/products/${id}`, { method: "PATCH", body });
}

export async function deleteProduct(id: number): Promise<void> {
  return api<void>(`/products/${id}`, { method: "DELETE" });
}

export async function getProductStock(
  id: number,
): Promise<ProductStockResponse> {
  return api<ProductStockResponse>(`/products/${id}/stock`);
}