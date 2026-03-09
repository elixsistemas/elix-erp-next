import type { FastifyReply, FastifyRequest } from "fastify";
import {
  ChartAccountListQuerySchema,
  CreateChartAccountSchema,
  UpdateChartAccountSchema,
  UpdateChartAccountStatusSchema,
} from "./chart-of-accounts.schemas";
import {
  createChartAccountService,
  deleteChartAccountService,
  getChartAccountByIdService,
  getChartAccountsTreeService,
  listChartAccountsService,
  updateChartAccountService,
  updateChartAccountStatusService,
} from "./chart-of-accounts.service";

type IdParams = { Params: { id: string } };
type UpdateStatusRoute = { Params: { id: string }; Body: { active: boolean } };

function handleError(reply: FastifyReply, error: unknown) {
  const message =
    error instanceof Error ? error.message : "Erro interno do servidor";
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as any).statusCode === "number"
      ? (error as any).statusCode
      : 500;

  return reply.status(statusCode).send({ message });
}

export async function listChartAccountsController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const companyId = req.auth!.companyId;
    const query = ChartAccountListQuerySchema.parse(req.query);
    const rows = await listChartAccountsService(companyId, query);
    return reply.send(rows);
  } catch (error) {
    return handleError(reply, error);
  }
}

export async function getChartAccountByIdController(
  req: FastifyRequest<IdParams>,
  reply: FastifyReply,
) {
  try {
    const companyId = req.auth!.companyId;
    const id = Number(req.params.id);
    const row = await getChartAccountByIdService(companyId, id);
    return reply.send(row);
  } catch (error) {
    return handleError(reply, error);
  }
}

export async function getChartAccountsTreeController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const companyId = req.auth!.companyId;
    const tree = await getChartAccountsTreeService(companyId);
    return reply.send(tree);
  } catch (error) {
    return handleError(reply, error);
  }
}

export async function createChartAccountController(
  req: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const companyId = req.auth!.companyId;
    const body = CreateChartAccountSchema.parse(req.body);
    const created = await createChartAccountService(companyId, body);
    return reply.status(201).send(created);
  } catch (error) {
    return handleError(reply, error);
  }
}

export async function updateChartAccountController(
  req: FastifyRequest<IdParams>,
  reply: FastifyReply,
) {
  try {
    const companyId = req.auth!.companyId;
    const id = Number(req.params.id);
    const body = UpdateChartAccountSchema.parse(req.body);
    const updated = await updateChartAccountService(companyId, id, body);
    return reply.send(updated);
  } catch (error) {
    return handleError(reply, error);
  }
}

export async function updateChartAccountStatusController(
  req: FastifyRequest<UpdateStatusRoute>,
  reply: FastifyReply,
) {
  try {
    const companyId = req.auth!.companyId;
    const id = Number(req.params.id);
    const body = UpdateChartAccountStatusSchema.parse(req.body);
    const updated = await updateChartAccountStatusService(
      companyId,
      id,
      body.active,
    );
    return reply.send(updated);
  } catch (error) {
    return handleError(reply, error);
  }
}

export async function deleteChartAccountController(
  req: FastifyRequest<IdParams>,
  reply: FastifyReply,
) {
  try {
    const companyId = req.auth!.companyId;
    const id = Number(req.params.id);
    await deleteChartAccountService(companyId, id);
    return reply.status(204).send();
  } catch (error) {
    return handleError(reply, error);
  }
}