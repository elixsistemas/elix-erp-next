import { onlyDigits } from "../digits";
import { createSimpleCache } from "../cache/simpleCache";

export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

const cache = createSimpleCache<ViaCepResponse>(1000 * 60 * 60); // 1h

export async function fetchAddressByCep(cepInput: string): Promise<ViaCepResponse> {
  const cep = onlyDigits(cepInput);
  if (cep.length !== 8) throw new Error("CEP inválido");

  const cached = cache.get(cep);
  if (cached) return cached;

  const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  const j = (await r.json()) as ViaCepResponse;

  if (!r.ok || j?.erro) throw new Error("CEP não encontrado");

  cache.set(cep, j);
  return j;
}
