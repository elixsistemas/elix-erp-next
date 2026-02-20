import type { FastifyReply, FastifyRequest } from "fastify";
import { IdParamSchema } from "../../config/params";
import * as service from "./sales.service";
import { issueFiscalTx, listFiscalBySale } from "./sales.fiscal.repository";
import { CloseSaleBodySchema } from "./sales.schema";
import { z } from "zod";

const ListQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  customerId: z.coerce.number().int().positive().optional()
});

const IssueFiscalSchema = z.object({
  type: z.enum(["NFE", "NFSE", "BOTH"])
});

export async function issueFiscal(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const body = IssueFiscalSchema.parse(req.body);

  try {
    const docs = await issueFiscalTx({
      companyId,
      saleId: id,
      type: body.type
    });

    return rep.code(201).send(docs);

  } catch (err: any) {
    const msg = String(err?.message ?? "");

    // ✅ venda não encontrada (multi-empresa protegido)
    if (msg === "SALE_NOT_FOUND") {
      return rep.code(404).send({ message: "Sale not found" });
    }

    // ✅ regra B (já existe documento ativo)
    if (msg.startsWith("FISCAL_ALREADY_EXISTS")) {
      const type = msg.split(":")[1] ?? "";
      return rep.code(409).send({
        message: `Fiscal document already exists for ${type}`
      });
    }

    // fallback seguro
    return rep.code(500).send({
      message: "Unexpected fiscal error"
    });
  }
}

const UpdateBodySchema = z.object({
  notes: z.string().max(500).nullable().optional(),
  paymentMethodId: z.number().int().positive().nullable().optional(),
  paymentTermId: z.number().int().positive().nullable().optional()
});

export async function list(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const q = ListQuerySchema.parse((req.query ?? {}) as any);

  const data = await service.list({
    companyId,
    from: q.from,
    to: q.to,
    customerId: q.customerId
  });

  return rep.send(data);
}

export async function get(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const data = await service.get(companyId, id);
  if (!data) return rep.code(404).send({ message: "Sale not found" });

  return rep.send(data);
}

export async function fromQuote(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params); // quoteId

  try {
    const result = await service.convertFromQuote(companyId, id);

    if ("error" in result) {
      const map: Record<string, [number, string]> = {
        QUOTE_NOT_FOUND: [404, "Quote not found"],
        QUOTE_CANCELLED: [400, "Quote is cancelled"],
        QUOTE_ALREADY_APPROVED: [409, "Quote already processed"],
        QUOTE_EMPTY: [400, "Quote has no items"]
      };

      const [code, msg] = map[(result as any).error] ?? [400, "Cannot convert quote"];
      return rep.code(code).send({ message: msg });
    }

    return rep.code(201).send((result as any).data);
  } catch (err: any) {
    const msg = String(err?.message ?? "");

    if (msg.includes("Insufficient stock")) {
      return rep.code(409).send({ message: "Insufficient stock" });
    }

    if (msg.includes("Quote already processed")) {
      return rep.code(409).send({ message: "Quote already processed" });
    }

    throw err;
  }
}

export async function listFiscal(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const data = await listFiscalBySale({ companyId, saleId: id });
  if (!data) return rep.code(404).send({ message: "Sale not found" });

  return rep.send(data);
}

export async function cancel(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params); // saleId

  const result = await service.cancel(companyId, id);

  if ("error" in result) {
    const map: Record<string, [number, string]> = {
      SALE_NOT_FOUND: [404, "Sale not found"],
      SALE_ALREADY_CANCELLED: [409, "Sale already cancelled"],
      SALE_NOT_OPEN: [409, "Only open sales can be cancelled"]
    };

    const [code, msg] = map[(result as any).error] ?? [400, "Cannot cancel sale"];
    return rep.code(code).send({ message: msg });
  }

  return rep.send((result as any).data);
}

export async function update(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);
  const body = UpdateBodySchema.parse(req.body);

  const updated = await service.update({
    companyId,
    saleId: id,
    notes: body.notes,
    paymentMethodId: body.paymentMethodId,
    paymentTermId: body.paymentTermId
  });

  if (!updated) return rep.code(404).send({ message: "Sale not found" });
  return rep.send(updated);
}


export async function close(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const body = CloseSaleBodySchema.parse(req.body);

  const result = await service.close(companyId, id, body);

  if ("error" in result) {
    const map: Record<string, [number, string]> = {
      SALE_NOT_FOUND: [404, "Sale not found"],
      SALE_ALREADY_CLOSED: [409, "Sale already closed"],
      SALE_CANCELLED: [409, "Sale is cancelled"],
      SALE_NOT_OPEN: [409, "Only open sales can be closed"],

      PAYMENT_METHOD_REQUIRED: [409, "Payment method is required"],
      PAYMENT_TERM_REQUIRED: [409, "Payment term is required"],

      BANK_ACCOUNT_INVALID: [409, "Invalid bank account"],
      INSTALLMENTS_INVALID: [400, "Invalid installments"],
      RECEIVABLE_ALREADY_EXISTS: [409, "Receivable already exists for this sale"]
    };

    const [code, msg] = map[(result as any).error] ?? [400, "Cannot close sale"];
    return rep.code(code).send({ message: msg });
  }

  return rep.send(result.data);
}


  export async function previewInstallments(req: FastifyRequest, rep: FastifyReply) {
  const companyId = req.auth!.companyId;
  const { id } = IdParamSchema.parse(req.params);

  const result = await service.previewInstallments(companyId, id);

  if ("error" in result) {
    const map: Record<string, [number, string]> = {
      SALE_NOT_FOUND: [404, "Sale not found"],
      SALE_NOT_OPEN: [409, "Only open sales can generate installments preview"],
      PAYMENT_METHOD_REQUIRED: [409, "Payment method is required"],
      PAYMENT_TERM_REQUIRED: [409, "Payment term is required"],
      PAYMENT_TERM_INVALID: [409, "Invalid payment term offsets"]
    };
    const [code, msg] = map[(result as any).error] ?? [400, "Cannot preview installments"];
    return rep.code(code).send({ message: msg });
  }

  return rep.send(result.data);
}

