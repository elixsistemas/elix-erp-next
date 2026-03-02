import { api } from "@/shared/api/client";
import type {
  PagedResult,
  ListFiscalQuery,
  Cfop,
  CfopUpsert,
  Ncm,
  NcmUpsert,
  Cest,
  CestUpsert,
  ImportResult,
} from "./fiscal.types";

function toQueryString(q: ListFiscalQuery = {}) {
  const qs = new URLSearchParams();

  if (q.search?.trim()) qs.set("search", q.search.trim());
  if (q.active === "1" || q.active === "0") qs.set("active", q.active);
  if (q.page) qs.set("page", String(q.page));
  if (q.pageSize) qs.set("pageSize", String(q.pageSize));

  const s = qs.toString();
  return s ? `?${s}` : "";
}

/* =========================
   CFOP
========================= */
export async function listCfop(query: ListFiscalQuery = {}) {
  return api<PagedResult<Cfop>>(`/fiscal/cfop${toQueryString(query)}`);
}

export async function createCfop(body: CfopUpsert) {
  return api<Cfop>(`/fiscal/cfop`, { method: "POST", body });
}

export async function updateCfop(id: number, body: Partial<CfopUpsert>) {
  return api<Cfop>(`/fiscal/cfop/${id}`, { method: "PATCH", body });
}

export async function importCfop(items: CfopUpsert[], dryRun = false) {
  return api<ImportResult>(`/fiscal/cfop/import`, {
    method: "POST",
    body: { dryRun, items },
  });
}

/* =========================
   NCM
========================= */
export async function listNcm(query: ListFiscalQuery = {}) {
  return api<PagedResult<Ncm>>(`/fiscal/ncm${toQueryString(query)}`);
}

export async function createNcm(body: NcmUpsert) {
  return api<Ncm>(`/fiscal/ncm`, { method: "POST", body });
}

export async function updateNcm(id: number, body: Partial<NcmUpsert>) {
  return api<Ncm>(`/fiscal/ncm/${id}`, { method: "PATCH", body });
}

export async function importNcm(items: NcmUpsert[], dryRun = false) {
  return api<ImportResult>(`/fiscal/ncm/import`, {
    method: "POST",
    body: { dryRun, items },
  });
}

export async function toggleCfop(id: number) {
  return api<Cfop>(`/fiscal/cfop/${id}/toggle`, { method: "PATCH" });
}

export async function toggleNcm(id: number) {
  return api<Ncm>(`/fiscal/ncm/${id}/toggle`, { method: "PATCH" });
}

export async function importNcmFile(file: File, dryRun = false) {
  const fd = new FormData();
  fd.append("file", file);

  const qs = dryRun ? "?dryRun=1" : "";
  return api<ImportResult>(`/fiscal/ncm/import-file${qs}`, {
    method: "POST",
    body: fd,
  });
}

export async function importCfopFile(file: File, dryRun: boolean) {
  const fd = new FormData();
  fd.append("file", file);
  const qs = dryRun ? "?dryRun=1" : "";
  return api<ImportResult & { itemsCount?: number }>(`/fiscal/cfop/import-file${qs}`, {
    method: "POST",
    body: fd,
  });
}

/* =========================
   CEST
========================= */
export async function listCest(query: ListFiscalQuery = {}) {
  return api<PagedResult<Cest>>(`/fiscal/cest${toQueryString(query)}`);
}

export async function createCest(body: CestUpsert) {
  return api<Cest>(`/fiscal/cest`, { method: "POST", body });
}

export async function updateCest(id: number, body: Partial<CestUpsert>) {
  return api<Cest>(`/fiscal/cest/${id}`, { method: "PATCH", body });
}

export async function importCest(items: CestUpsert[], dryRun = false) {
  return api<ImportResult>(`/fiscal/cest/import`, {
    method: "POST",
    body: { dryRun, items },
  });
}

export async function toggleCest(id: number) {
  return api<Cest>(`/fiscal/cest/${id}/toggle`, { method: "PATCH" });
}

export async function importCestFile(file: File, dryRun = false) {
  const fd = new FormData();
  fd.append("file", file);

  const qs = dryRun ? "?dryRun=1" : "";
  return api<ImportResult & { itemsCount?: number }>(`/fiscal/cest/import-file${qs}`, {
    method: "POST",
    body: fd,
  });
}