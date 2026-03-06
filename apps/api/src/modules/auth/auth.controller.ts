import { ZodError } from "zod";
import { getPool } from "../../config/db";
import type { FastifyRequest, FastifyReply } from "fastify";
import { LoginSchema, PreLoginSchema, SwitchCompanySchema } from "./auth.schema";
import * as service from "./auth.service";
import {
  getUserRoleCodes,
  getUserPermissions,
  getCompanyModules,
  getCurrentLicense,
} from "./auth.repository";

export async function companies(req: FastifyRequest, rep: FastifyReply) {
  if (!req.auth) return rep.code(401).send({ message: "Unauthorized" });
  const list = await service.listUserCompanies(req.auth.userId);
  return rep.send({ companies: list });
}

export async function switchCompany(req: FastifyRequest, rep: FastifyReply) {
  try {
    if (!req.auth) return rep.code(401).send({ message: "Unauthorized" });

    const payload = SwitchCompanySchema.parse(req.body);
    const result = await service.switchCompany(req.auth.userId, payload.companyId);

    if (!result) return rep.code(403).send({ message: "Forbidden" });
    return rep.send(result); // { token }
  } catch (err) {
    if (err instanceof ZodError) {
      return rep.code(400).send({ message: "Invalid request", issues: err.issues });
    }
    throw err;
  }
}

export async function prelogin(req: FastifyRequest, rep: FastifyReply) {
  const payload = PreLoginSchema.parse(req.body);
  const result = await service.prelogin(payload);

  if (!result) {
    return rep.code(401).send({ message: "Invalid credentials" });
  }

  return rep.send(result);
}

export async function login(req: FastifyRequest, rep: FastifyReply) {
  try {
    const payload = LoginSchema.parse(req.body);
    const result = await service.login(payload);

    if (!result) {
      return rep.code(401).send({ message: "Invalid login ticket or company" });
    }
    return rep.send(result);
  } catch (err) {
    if (err instanceof ZodError) {
      return rep.code(400).send({ message: "Invalid request", issues: err.issues });
    }
    throw err;
  }
}

export async function me(req: FastifyRequest, rep: FastifyReply) {
  if (!req.auth) return rep.code(401).send({ message: "Unauthorized" });

  const { companyId, userId } = req.auth;
  const pool = await getPool();

  const userRes = await pool.request()
    .input("userId", userId)
    .input("companyId", companyId)
    .query(`
      SELECT TOP 1
        u.id,
        u.name,
        u.email,

        c.id   AS company_id,
        c.name AS company_name,
        c.logo_base64,
        c.logo_mime

      FROM dbo.users u
      JOIN dbo.user_companies uc
        ON uc.user_id = u.id
       AND uc.company_id = @companyId
       AND uc.active = 1
      JOIN dbo.companies c
        ON c.id = uc.company_id
      WHERE u.id = @userId
        AND u.active = 1;
    `);

  const row = userRes.recordset?.[0];
  if (!row) return rep.code(401).send({ message: "Invalid session" });

  const [modules, permissions, roles, license] = await Promise.all([
    getCompanyModules(companyId),
    getUserPermissions(companyId, userId),
    getUserRoleCodes(companyId, userId),
    getCurrentLicense(companyId),
  ]);

  const rolesFinal = roles.length ? roles : ["user"];
  const primaryRole = rolesFinal.includes("admin") ? "admin" : rolesFinal[0];

  return rep.send({
    user: {
      id: row.id,
      companyId: row.company_id,
      name: row.name,
      email: row.email,
      role: primaryRole,
      roles: rolesFinal,
    },
    company: {
      id: row.company_id,
      name: row.company_name,
      logo_base64: row.logo_base64 ?? null,
      logo_mime: row.logo_mime ?? null,
    },
    modules,
    permissions,
    license,
  });
}