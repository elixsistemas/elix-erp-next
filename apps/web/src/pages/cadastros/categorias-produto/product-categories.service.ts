import { api } from "@/shared/api/client";
import type {
  ProductCategory,
  ProductCategoryFormData,
  ProductCategoryListParams,
  ProductCategoryNode,
} from "./product-categories.types";

const BASE_URL = "/product-categories";

export async function listProductCategories(params: ProductCategoryListParams = {}) {
  const search = new URLSearchParams();

  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.active) search.set("active", params.active);

  const qs = search.toString();
  return api<ProductCategory[]>(`${BASE_URL}${qs ? `?${qs}` : ""}`);
}

export async function listProductCategoriesTree() {
  return api<ProductCategoryNode[]>(`${BASE_URL}/tree`);
}

export async function createProductCategory(data: ProductCategoryFormData) {
  return api<ProductCategory>(BASE_URL, {
    method: "POST",
    body: data,
  });
}

export async function updateProductCategory(
  id: number,
  data: Partial<ProductCategoryFormData>,
) {
  return api<ProductCategory>(`${BASE_URL}/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteProductCategory(id: number) {
  return api<void>(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}