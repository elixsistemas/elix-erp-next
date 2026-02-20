import type { FastifyReply, FastifyRequest } from "fastify";
import { ProductCreateSchema, ProductUpdateSchema, ProductListQuerySchema } from "./products.schema";
import * as service from "./products.service";
import { IdParamSchema } from "../../config/params";

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const q = ProductListQuerySchema.parse(req.query);

  const data = await service.list({
    companyId,
    q: q.q,
    limit: q.limit,
    active: q.active,
    kind: q.kind,
  });

  return rep.send(data);
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const product = await service.get(companyId, id);
  if (!product) return rep.code(404).send({ message: "Product not found" });

  return rep.send(product);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const payload = ProductCreateSchema.parse(req.body);

  const created = await service.create(companyId, payload);

  if (created && typeof created === "object" && "error" in created) {
    if (created.error === "SKU_ALREADY_EXISTS") return rep.code(409).send({ message: "SKU already exists" });
    if (created.error === "EAN_ALREADY_EXISTS") return rep.code(409).send({ message: "EAN already exists" });
    return rep.code(400).send({ message: "Cannot create product" });
  }

  return rep.code(201).send(created);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const payload = ProductUpdateSchema.parse(req.body);

  const updated = await service.update(companyId, id, payload);

  if (!updated) return rep.code(404).send({ message: "Product not found" });

  if (typeof updated === "object" && "error" in updated) {
    if (updated.error === "SKU_ALREADY_EXISTS") return rep.code(409).send({ message: "SKU already exists" });
    if (updated.error === "EAN_ALREADY_EXISTS") return rep.code(409).send({ message: "EAN already exists" });
    return rep.code(400).send({ message: "Cannot update product" });
  }

  return rep.send(updated);
}

export async function remove(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const ok = await service.deactivate(companyId, id);
  if (!ok) return rep.code(404).send({ message: "Product not found" });

  return rep.code(204).send();
}

export async function stock(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const qty = await service.stock(companyId, id);
  return rep.send({ productId: id, stock: qty });
}
