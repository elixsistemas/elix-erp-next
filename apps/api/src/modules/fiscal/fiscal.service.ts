import type { CfopListQuery, CfopUpsert, NcmListQuery, NcmUpsert } from "./fiscal.schema";
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