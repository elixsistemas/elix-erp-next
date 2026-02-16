import type { FastifyReply, FastifyRequest } from "fastify";
import { dashboardFinanceQuerySchema } from "./dashboard.schemas";
import { getFinanceSummary } from "./dashboard.service";

export async function financeSummary(req: FastifyRequest, reply: FastifyReply) {
  if (!req.auth?.companyId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const parsed = dashboardFinanceQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return reply.status(400).send({
      message: "Parâmetros inválidos",
      issues: parsed.error.flatten(),
    });
  }

  const data = await getFinanceSummary({
    companyId: req.auth.companyId,
    month: parsed.data.month,
  });

  return reply.send(data);
}
