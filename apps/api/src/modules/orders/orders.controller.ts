import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import * as service from "./orders.service";

// Params
const IdParamSchema = z.object({ id: z.string() });

// Query list
const ListQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  customerId: z.coerce.number().int().positive().optional(),
  status: z.string().optional(),
});

// Body create
const CreateOrderSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  quoteId: z.coerce.number().int().positive().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),

  status: z.string().optional(), // se quiser fixar sempre draft, pode remover
  subtotal: z.coerce.number(),
  discount: z.coerce.number().min(0),
  total: z.coerce.number(),

  items: z.array(
    z.object({
      productId: z.coerce.number().int().positive(),
      kind: z.enum(["product", "service"]),
      description: z.string().min(1).max(200),
      quantity: z.coerce.number().positive(),
      unitPrice: z.coerce.number().min(0),
      total: z.coerce.number().min(0),
    })
  ).min(1),
});

// Body update
const UpdateOrderSchema = z.object({
  status: z.string().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

function companyIdFromReq(req: any) {
  // ajuste aqui se no seu projeto for req.user / req.auth / req.session etc.
  return Number(req.auth?.companyId);
}

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = companyIdFromReq(req);
  const q = ListQuerySchema.parse(req.query);

  const rows = await service.list({
    companyId,
    from: q.from,
    to: q.to,
    customerId: q.customerId,
    status: q.status,
  });

  return rep.send(rows);
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = companyIdFromReq(req);
  const { id } = IdParamSchema.parse(req.params);
  const orderId = Number(id);

  const data = await service.get(companyId, orderId);
  if (!data) return rep.code(404).send({ message: "Pedido não encontrado." });

  return rep.send(data);
}

export async function create(req: FastifyRequest, rep: FastifyReply) {
  const companyId = companyIdFromReq(req);
  const body = CreateOrderSchema.parse(req.body);

  const res = await service.create({
    companyId,
    quoteId: body.quoteId ?? null,
    customerId: body.customerId,
    status: body.status ?? "draft",
    subtotal: body.subtotal,
    discount: body.discount,
    total: body.total,
    notes: body.notes ?? null,
    items: body.items.map((it) => ({
      productId: it.productId,
      kind: it.kind,
      description: it.description,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total,
    })),
  });

  if ("error" in res) {
    if (res.error === "QUOTE_NOT_FOUND") {
      return rep.code(404).send({ message: "Orçamento (quote) não encontrado para esta empresa." });
    }
    return rep.code(400).send({ message: "Não foi possível criar o pedido." });
  }

  return rep.code(201).send(res.data);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = companyIdFromReq(req);
  const { id } = IdParamSchema.parse(req.params);
  const orderId = Number(id);
  const body = UpdateOrderSchema.parse(req.body);

  const res = await service.update({
    companyId,
    orderId,
    status: body.status,
    notes: body.notes ?? null,
  });

  if ("error" in res) {
    if (res.error === "ORDER_NOT_FOUND") {
      return rep.code(404).send({ message: "Pedido não encontrado." });
    }
    return rep.code(400).send({ message: "Não foi possível atualizar o pedido." });
  }

  return rep.send(res.data);
}

export async function cancel(req: FastifyRequest, rep: FastifyReply) {
  const companyId = companyIdFromReq(req);
  const { id } = IdParamSchema.parse(req.params);
  const orderId = Number(id);

  const res = await service.cancel({ companyId, orderId });

  if ("error" in res) {
    // seu repo: AND status <> 'billed' => cancela somente se não faturado
    if (res.error === "ORDER_NOT_FOUND_OR_BILLED") {
      return rep.code(409).send({ message: "Pedido não encontrado ou já faturado." });
    }
    return rep.code(400).send({ message: "Não foi possível cancelar o pedido." });
  }

  return rep.send(res.data);
}

export async function bill(req: FastifyRequest, rep: FastifyReply) {
  const companyId = companyIdFromReq(req);
  const { id } = IdParamSchema.parse(req.params);
  const orderId = Number(id);

  const res = await service.billToSale({ companyId, orderId });

  if ("error" in res) {
    if (res.error === "ORDER_NOT_FOUND") return rep.code(404).send({ message: "Pedido não encontrado." });
    if (res.error === "ORDER_CANCELLED") return rep.code(409).send({ message: "Pedido cancelado." });
    if (res.error === "ORDER_ALREADY_BILLED") return rep.code(409).send({ message: "Pedido já faturado." });
    if (res.error === "ORDER_EMPTY") return rep.code(409).send({ message: "Pedido sem itens." });

    return rep.code(400).send({ message: "Não foi possível faturar o pedido." });
  }

  // res.data = { sale, items }
  // seu front espera BillOrderResult { saleId }
  const saleId = Number((res as any).data?.sale?.id);
  return rep.send({ orderId, saleId });
}
