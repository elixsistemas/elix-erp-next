import * as repo from "./services.repository";
import type {
  ServiceCreate,
  ServiceListQuery,
  ServiceUpdate,
} from "./services.schema";

export function list(args: { companyId: number } & ServiceListQuery) {
  return repo.listServices(args);
}

export function get(companyId: number, id: number) {
  return repo.getService(companyId, id);
}

export function create(companyId: number, data: ServiceCreate) {
  return repo.createService(companyId, data);
}

export function update(
  companyId: number,
  id: number,
  data: ServiceUpdate,
) {
  return repo.updateService(companyId, id, data);
}

export function remove(companyId: number, id: number) {
  return repo.deactivateService(companyId, id);
}