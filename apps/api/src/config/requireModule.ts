// apps/api/src/config/requireModule.ts
import type { FastifyReply, FastifyRequest } from "fastify";
import { getPool } from "./db";
import type { AuthUser } from "./auth";

type CacheEntry = { at: number; enabled: Set<string> };

const cache = new Map<number, CacheEntry>();
const TTL_MS = 60_000;

async function loadEnabledModules(companyId: number): Promise<Set<string>> {
  const now = Date.now();
  const hit = cache.get(companyId);
  if (hit && now - hit.at < TTL_MS) return hit.enabled;

  const pool = await getPool();
  const res = await pool
    .request()
    .input("company_id", companyId)
    .query(`
      SELECT module_key
      FROM dbo.company_modules
      WHERE company_id = @company_id AND enabled = 1
    `);

  const enabled = new Set<string>(res.recordset.map((r: any) => String(r.module_key)));
  cache.set(companyId, { at: now, enabled });
  return enabled;
}

export function requireModule(moduleKey: string) {
  return async function (req: FastifyRequest, rep: FastifyReply) {
    const auth = req.auth as AuthUser | undefined;
    if (!auth) return rep.code(401).send({ message: "Unauthorized" });

    const enabled = await loadEnabledModules(auth.companyId);
    if (!enabled.has(moduleKey)) {
      return rep.code(403).send({ message: "Module disabled" });
    }
  };
}

// útil quando você altera módulos e quer invalidar cache
export function invalidateModulesCache(companyId: number) {
  cache.delete(companyId);
}