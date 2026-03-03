import type {
  CfopListQuery,
  CfopUpsert,
  NcmListQuery,
  NcmUpsert,
  CestListQuery,
  CestUpsert,
} from "./fiscal.schema";
import * as repo from "./fiscal.repository";

export async function listCfop(q: CfopListQuery) {
  return repo.listCfop(q);
}
export async function createCfop(data: CfopUpsert) {
  return repo.createCfop(data);
}
export async function updateCfop(id: number, patch: Partial<CfopUpsert>) {
  return repo.updateCfop(id, patch);
}
export async function importCfop(items: CfopUpsert[], dryRun: boolean) {
  return repo.upsertCfopMany(items, dryRun);
}

export async function listNcm(q: NcmListQuery) {
  return repo.listNcm(q);
}
export async function createNcm(data: NcmUpsert) {
  return repo.createNcm(data);
}
export async function updateNcm(id: number, patch: Partial<NcmUpsert>) {
  return repo.updateNcm(id, patch);
}
export async function importNcm(items: NcmUpsert[], dryRun: boolean) {
  return repo.upsertNcmMany(items, dryRun);
}

export async function toggleCfop(id: number) {
  return repo.toggleCfop(id);
}

export async function toggleNcm(id: number) {
  return repo.toggleNcm(id);
}

export async function listCest(q: CestListQuery) {
  return repo.listCest(q);
}
export async function createCest(data: CestUpsert) {
  return repo.createCest(data);
}
export async function updateCest(id: number, patch: Partial<CestUpsert>) {
  return repo.updateCest(id, patch);
}
export async function importCest(items: CestUpsert[], dryRun: boolean) {
  return repo.upsertCestMany(items, dryRun);
}

export async function toggleCest(id: number) {
  return repo.toggleCest(id);
}

export async function listUom(q: any) { return repo.listUom(q); }
export async function listCsosn(q: any) { return repo.listCsosn(q); }
export async function listIcmsOrigem(q: any) { return repo.listIcmsOrigem(q); }
export async function listCstIcms(q: any) { return repo.listCstIcms(q); }
export async function listPisCst(q: any) { return repo.listPisCst(q); }
export async function listCofinsCst(q: any) { return repo.listCofinsCst(q); }
export async function listIpiCst(q: any) { return repo.listIpiCst(q); }