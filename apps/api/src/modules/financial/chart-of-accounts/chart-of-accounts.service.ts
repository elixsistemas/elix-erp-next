import {
  countChildren,
  createChartAccount,
  deleteChartAccount,
  existsInSubtree,
  getChartAccountByCode,
  getChartAccountById,
  listChartAccounts,
  listChartAccountsTree,
  updateChartAccount,
  updateChartAccountStatus,
  type ChartAccountRow,
} from "./chart-of-accounts.repository";
import type {
  ChartAccountListQuery,
  CreateChartAccountInput,
  UpdateChartAccountInput,
} from "./chart-of-accounts.schemas";

function badRequest(message: string) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 400;
  return error;
}

function notFound(message = "Conta contábil não encontrada") {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 404;
  return error;
}

function buildTree(rows: ChartAccountRow[]) {
  const map = new Map<number, ChartAccountRow & { children: any[] }>();
  const roots: Array<ChartAccountRow & { children: any[] }> = [];

  for (const row of rows) {
    map.set(row.id, { ...row, children: [] });
  }

  for (const row of rows) {
    const node = map.get(row.id)!;
    if (row.parent_id && map.has(row.parent_id)) {
      map.get(row.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function validateDreFields(input: {
  nature?: string;
  isResultAccount?: boolean;
  dreGroup?: string | null;
}) {
  const nature = input.nature;
  const isResult = input.isResultAccount;
  const dreGroup = input.dreGroup;

  if (dreGroup && nature && !["revenue", "expense"].includes(nature)) {
    throw badRequest("dreGroup só pode ser usado em contas de receita ou despesa");
  }

  if (dreGroup && isResult === false) {
    throw badRequest("Conta com dreGroup deve ser conta de resultado");
  }
}

export async function listChartAccountsService(
  companyId: number,
  query?: ChartAccountListQuery,
) {
  return listChartAccounts(companyId, query);
}

export async function getChartAccountByIdService(companyId: number, id: number) {
  const row = await getChartAccountById(companyId, id);
  if (!row) throw notFound();
  return row;
}

export async function getChartAccountsTreeService(companyId: number) {
  const rows = await listChartAccountsTree(companyId);
  return buildTree(rows);
}

export async function createChartAccountService(
  companyId: number,
  input: CreateChartAccountInput,
) {
  validateDreFields(input);

  if (input.parentId) {
    const parent = await getChartAccountById(companyId, input.parentId);
    if (!parent) {
      throw badRequest("Conta pai inválida");
    }
  }

  const existingCode = await getChartAccountByCode(companyId, input.code);
  if (existingCode) {
    throw badRequest("Já existe uma conta com este código");
  }

  if (input.accountKind === "synthetic" && input.allowPosting === true) {
    throw badRequest("Conta sintética não deve permitir lançamento");
  }

  const id = await createChartAccount(companyId, {
    ...input,
    allowPosting:
      input.accountKind === "synthetic"
        ? false
        : (input.allowPosting ?? true),
  });

  if (!id) {
    throw badRequest("Falha ao criar conta contábil");
  }

  return getChartAccountByIdService(companyId, id);
}

export async function updateChartAccountService(
  companyId: number,
  id: number,
  input: UpdateChartAccountInput,
) {
  const current = await getChartAccountById(companyId, id);
  if (!current) throw notFound();

  const nextNature = input.nature ?? current.nature;
  const nextIsResult = input.isResultAccount ?? current.is_result_account;
  const nextDreGroup =
    input.dreGroup === undefined ? current.dre_group : input.dreGroup;

  validateDreFields({
    nature: nextNature,
    isResultAccount: nextIsResult,
    dreGroup: nextDreGroup,
  });

  if (input.parentId !== undefined && input.parentId !== null) {
    if (input.parentId === id) {
      throw badRequest("Uma conta não pode ser pai dela mesma");
    }

    const parent = await getChartAccountById(companyId, input.parentId);
    if (!parent) {
      throw badRequest("Conta pai inválida");
    }

    const circular = await existsInSubtree(companyId, id, input.parentId);
    if (circular) {
      throw badRequest("Movimento inválido: geraria ciclo na hierarquia");
    }
  }

  if (input.code && input.code !== current.code) {
    const existingCode = await getChartAccountByCode(companyId, input.code);
    if (existingCode && existingCode.id !== id) {
      throw badRequest("Já existe uma conta com este código");
    }
  }

  const childrenCount = await countChildren(companyId, id);
  const nextKind = input.accountKind ?? current.account_kind;
  const nextAllowPosting = input.allowPosting ?? current.allow_posting;

  if (childrenCount > 0 && nextKind === "analytic") {
    throw badRequest("Conta com filhos não pode ser analítica");
  }

  if (nextKind === "synthetic" && nextAllowPosting) {
    throw badRequest("Conta sintética não deve permitir lançamento");
  }

  const updated = await updateChartAccount(companyId, id, {
    ...input,
    allowPosting: nextKind === "synthetic" ? false : nextAllowPosting,
  });

  if (!updated) throw notFound();
  return updated;
}

export async function updateChartAccountStatusService(
  companyId: number,
  id: number,
  active: boolean,
) {
  const current = await getChartAccountById(companyId, id);
  if (!current) throw notFound();

  if (!active) {
    const childrenCount = await countChildren(companyId, id);
    if (childrenCount > 0) {
      throw badRequest("Não é permitido inativar conta que possui filhos");
    }
  }

  const updated = await updateChartAccountStatus(companyId, id, active);
  if (!updated) throw notFound();
  return updated;
}

export async function deleteChartAccountService(companyId: number, id: number) {
  const current = await getChartAccountById(companyId, id);
  if (!current) throw notFound();

  const childrenCount = await countChildren(companyId, id);
  if (childrenCount > 0) {
    throw badRequest("Não é permitido excluir conta que possui filhos");
  }

  const deleted = await deleteChartAccount(companyId, id);
  if (!deleted) throw badRequest("Falha ao excluir conta");
}