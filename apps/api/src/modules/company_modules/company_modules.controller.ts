// apps/api/src/modules/company_modules/company_modules.controller.ts
import type { FastifyReply, FastifyRequest } from "fastify";
import { CompanyModulesUpdateSchema, type CompanyModulesUpdateBody } from "./company_modules.schema";
import * as service from "./company_modules.service";
import { invalidateModulesCache } from "../../config/requireModule";

type UpdateReq = FastifyRequest<{ Body: CompanyModulesUpdateBody }>;

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const result = await service.list(companyId);
  return rep.send(result);
}

export async function update(req: UpdateReq, rep: FastifyReply) {
  try {
    const companyId = req.auth!.companyId;

    const payload = CompanyModulesUpdateSchema.parse(req.body);
    const result = await service.update(companyId, payload.modules);

    invalidateModulesCache(companyId);

    return rep.send(result);
  } catch (err) {
    req.log.error({ err }, "COMPANY_MODULES_UPDATE_ERROR");
    return rep.code(500).send({ message: "Failed to update modules" });
  }
}