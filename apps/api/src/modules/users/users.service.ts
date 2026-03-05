// apps/api/src/modules/users/users.service.ts
import * as repo from "./users.repository";

export class LicenseLimitError extends Error {
  code = "LICENSE_USER_LIMIT";
  constructor(message: string) {
    super(message);
  }
}

export async function assertUserSeatAvailable(companyId: number, userLimit: number) {
  const limit = Number(userLimit);

  if (!Number.isFinite(limit) || limit <= 0) {
    throw new LicenseLimitError("Limite de usuários inválido para esta licença.");
  }

  const current = await repo.countActiveUsersInCompany(companyId);
  if (current >= limit) {
    throw new LicenseLimitError(`Limite de usuários atingido (${current}/${limit}).`);
  }
}