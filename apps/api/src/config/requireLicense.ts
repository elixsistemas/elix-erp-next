// apps/api/src/config/requireLicense.ts
import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from "fastify";
import { getPool } from "./db";

export type LicenseInfo = {
  status: "active" | "past_due" | "suspended" | "canceled";
  dueAt: string; // ISO
  graceDays: number;
  planCode: string;
  planName: string;
  userLimit: number;
  readOnly: boolean; // computed
};

declare module "fastify" {
  interface FastifyRequest {
    license?: LicenseInfo;
  }
}

function isWriteMethod(method: string) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

export const requireLicense: preHandlerHookHandler = async (req: FastifyRequest, rep: FastifyReply) => {
  if (!req.auth) return rep.code(401).send({ message: "Unauthorized" });

  const companyId = req.auth.companyId;
  const pool = await getPool();

  const res = await pool.request()
    .input("company_id", companyId)
    .query(`
      SELECT TOP 1
        status,
        due_at,
        ISNULL(user_limit_override, plan_user_limit) AS user_limit,
        plan_grace_days AS grace_days,
        plan_code,
        plan_name
      FROM dbo.v_company_current_license
      WHERE company_id = @company_id
      ORDER BY due_at DESC, id DESC
    `);

  // Se não existir licença, por padrão: bloqueia escrita (modo seguro)
  if (res.recordset.length === 0) {
    req.license = {
      status: "suspended",
      dueAt: new Date(0).toISOString(),
      graceDays: 0,
      planCode: "none",
      planName: "Sem licença",
      userLimit: 0,
      readOnly: true,
    };

    if (isWriteMethod(req.method)) {
      return rep.code(402).send({ message: "Licença não encontrada. Acesso somente leitura." });
    }
    return;
  }

  const row = res.recordset[0] as any;
  const dueAt = new Date(row.due_at);
  const graceDays = Number(row.grace_days ?? 0);
  const now = new Date();

  // status efetivo
  let status = String(row.status) as LicenseInfo["status"];
  let readOnly = false;

  // Se passou do vencimento, entra em past_due; após grace_days, suspende.
  if (status === "active" && now > dueAt) status = "past_due";
  if (status === "past_due") {
    const graceUntil = new Date(dueAt.getTime() + graceDays * 24 * 60 * 60 * 1000);
    if (now > graceUntil) status = "suspended";
  }

  // Política: suspended/canceled = somente leitura (bloqueia escrita)
  if (status === "suspended" || status === "canceled") readOnly = true;

  req.license = {
    status,
    dueAt: dueAt.toISOString(),
    graceDays,
    planCode: String(row.plan_code),
    planName: String(row.plan_name),
    userLimit: Number(row.user_limit),
    readOnly,
  };

  if (readOnly && isWriteMethod(req.method)) {
    return rep.code(402).send({
      message: "Licença suspensa. Acesso somente leitura.",
      license: { status, dueAt: req.license.dueAt, planCode: req.license.planCode },
    });
  }
};
