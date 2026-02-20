import { onlyDigits } from "../digits";
import { createSimpleCache } from "../cache/simpleCache";

export type BrasilApiCnpjResponse = {
  cnpj: string;
  razao_social?: string;
  nome_fantasia?: string;
  email?: string;
  telefone?: string;

  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
};

const cache = createSimpleCache<BrasilApiCnpjResponse>(1000 * 60 * 60 * 6); // 6h

export async function fetchCompanyByCnpj(cnpjInput: string): Promise<BrasilApiCnpjResponse> {
  const cnpj = onlyDigits(cnpjInput);
  if (cnpj.length !== 14) throw new Error("CNPJ inválido");

  const cached = cache.get(cnpj);
  if (cached) return cached;

  const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
  const j = (await r.json()) as any;

  if (!r.ok) throw new Error(j?.message ?? "Falha ao consultar CNPJ");

  cache.set(cnpj, j);
  return j as BrasilApiCnpjResponse;
}
