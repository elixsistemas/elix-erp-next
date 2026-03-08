import type { FastifyReply, FastifyRequest } from "fastify";
import { IdParamSchema } from "../../config/params";
import {
  CarrierVehicleCreateSchema,
  CarrierVehicleListQuerySchema,
  CarrierVehicleUpdateSchema,
} from "./carrier-vehicles.schema";
import * as service from "./carrier-vehicles.service";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const q = CarrierVehicleListQuerySchema.parse(req.query ?? {});
  const rows = await service.list(companyId, q);
  return rep.send(rows);
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const row = await service.get(companyId, id);

  if (!row) return rep.code(404).send({ error: "NOT_FOUND" });
  return rep.send(row);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const body = CarrierVehicleCreateSchema.parse(req.body);
  const result = await service.create(companyId, body);

  if ((result as any)?.error === "INVALID_CARRIER") {
    return rep.code(400).send({ error: "INVALID_CARRIER" });
  }

  if ((result as any)?.error === "CARRIER_NOT_FOUND") {
    return rep.code(404).send({ error: "CARRIER_NOT_FOUND" });
  }

  if ((result as any)?.error === "INVALID_PLATE") {
    return rep.code(400).send({ error: "INVALID_PLATE" });
  }

  if ((result as any)?.error === "PLATE_ALREADY_EXISTS") {
    return rep.code(409).send({ error: "PLATE_ALREADY_EXISTS" });
  }

  return rep.code(201).send((result as any).data);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const body = CarrierVehicleUpdateSchema.parse(req.body);
  const result = await service.update(companyId, id, body);

  if ((result as any)?.error === "CARRIER_NOT_FOUND") {
    return rep.code(404).send({ error: "CARRIER_NOT_FOUND" });
  }

  if ((result as any)?.error === "INVALID_PLATE") {
    return rep.code(400).send({ error: "INVALID_PLATE" });
  }

  if ((result as any)?.error === "PLATE_ALREADY_EXISTS") {
    return rep.code(409).send({ error: "PLATE_ALREADY_EXISTS" });
  }

  const row = (result as any).data ?? null;
  if (!row) return rep.code(404).send({ error: "NOT_FOUND" });

  return rep.send(row);
}

export async function remove(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const ok = await service.remove(companyId, id);

  if (!ok) return rep.code(404).send({ error: "NOT_FOUND" });
  return rep.code(204).send();
}