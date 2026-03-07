import type { FastifyReply, FastifyRequest } from "fastify";
import {
  CompanyModulesUpdateSchema,
  type CompanyModulesUpdateBody,
} from "./company_modules.schema";
import * as service from "./company_modules.service";
import { invalidateModulesCache } from "../../config/requireModule";

type UpdateReq = FastifyRequest<{ Body: CompanyModulesUpdateBody }>;

export async function listCatalog(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const result = await service.listCatalog(companyId);
  return rep.send(result);
}

export async function listEnabled(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const result = await service.listEnabled(companyId);
  return rep.send(result);
}

export async function update(req: UpdateReq, rep: FastifyReply) {
  try {
    const companyId = req.auth!.companyId;
    const payload = CompanyModulesUpdateSchema.parse(req.body);

    const result = await service.update(companyId, payload.modules);

    invalidateModulesCache(companyId);

    return rep.send(result);
  } catch (err: any) {
    req.log.error({ err }, "COMPANY_MODULES_UPDATE_ERROR");

    return rep.code(400).send({
      message: err?.message ?? "Failed to update company modules",
    });
  }
}