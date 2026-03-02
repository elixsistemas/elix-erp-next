import { CfopFormSchema, NcmFormSchema } from "./fiscal.schema";
import * as XLSX from "xlsx";

// remove tudo que não for dígito
function digitsOnly(raw: unknown) {
  return String(raw ?? "").replace(/\D/g, "").trim();
}

function normalizeNcmCode(raw: unknown) {
  // Siscomex pode vir "85.04.40.10" -> "85044010"
  return digitsOnly(raw);
}

function normalizeCfopCode(raw: unknown) {
  // CFOP deve ser 4 dígitos; mantém só dígito
  return digitsOnly(raw);
}

function isJsonFile(file: File) {
  return file.name.toLowerCase().endsWith(".json") || file.type.includes("json");
}

function isExcelFile(file: File) {
  const n = file.name.toLowerCase();
  return n.endsWith(".xlsx") || n.endsWith(".xls");
}

function isCsvFile(file: File) {
  return file.name.toLowerCase().endsWith(".csv") || file.type.includes("csv");
}

function readFileArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    fr.onload = () => resolve(fr.result as ArrayBuffer);
    fr.readAsArrayBuffer(file);
  });
}

async function readJsonFile(file: File) {
  const text = await readFileText(file);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("JSON inválido");
  }
}

async function readExcelRows(file: File): Promise<Record<string, any>[]> {
  const buf = await readFileArrayBuffer(file);
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  const raw: any[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
  });

  if (!raw.length) return [];

  let headerIndex = -1;

  for (let i = 0; i < raw.length; i++) {
    const row = raw[i].map((c: any) =>
      String(c ?? "").trim().toLowerCase()
    );

    const hasCodigo = row.some((c: string) =>
      c.includes("código") ||
      c.includes("codigo") ||
      c.includes("ncm")
    );

    const hasDescricao = row.some((c: string) =>
      c.includes("descrição") ||
      c.includes("descricao")
    );

    if (hasCodigo && hasDescricao) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error("Não foi possível detectar colunas de NCM (código/descrição)");
  }

  const headers = raw[headerIndex].map((h: any) =>
    String(h ?? "").trim()
  );

  const dataRows = raw.slice(headerIndex + 1);

  return dataRows
    .filter((r) => r.some((c: any) => String(c ?? "").trim() !== ""))
    .map((r) => {
      const obj: Record<string, any> = {};
      headers.forEach((h, idx) => {
        obj[h] = r[idx] ?? "";
      });
      return obj;
    });
}

// normaliza chave para facilitar detecção
function normKey(k: string) {
  return (k ?? "")
    .trim()
    .toLowerCase()
    .replace(/\uFEFF/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "_");
}

function pickKey(obj: Record<string, any>, candidates: string[]) {
  const keys = Object.keys(obj);
  const normMap = new Map(keys.map((k) => [normKey(k), k] as const));

  for (const c of candidates) {
    const found = normMap.get(normKey(c));
    if (found) return found;
  }

  // fallback: match por "includes"
  for (const k of keys) {
    const nk = normKey(k);
    for (const c of candidates) {
      if (nk.includes(normKey(c))) return k;
    }
  }
  return null;
}

/**
 * CSV helpers
 */
function detectDelimiter(sample: string) {
  // tenta adivinhar ; ou ,
  const semi = (sample.match(/;/g) ?? []).length;
  const comma = (sample.match(/,/g) ?? []).length;
  return semi > comma ? ";" : ",";
}

function normalizeHeader(h: string) {
  return (h ?? "")
    .trim()
    .toLowerCase()
    .replace(/\uFEFF/g, "") // BOM
    .replace(/\s+/g, "_");
}

function readFileText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    fr.onload = () => resolve(String(fr.result ?? ""));
    fr.readAsText(file, "utf-8");
  });
}

function splitLines(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/**
 * Parse CSV simples (sem aspas complexas).
 * Se você precisar de CSV com aspas e separadores dentro do campo,
 * aí vale trocar por papaparse depois.
 */
function parseCsvSimple(text: string) {
  const lines = splitLines(text);
  if (lines.length < 2) return { headers: [] as string[], rows: [] as string[][] };

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map((h) => normalizeHeader(h));

  const rows = lines.slice(1).map((line) => line.split(delimiter).map((c) => (c ?? "").trim()));
  return { headers, rows };
}

function getCell(headers: string[], row: string[], name: string) {
  const idx = headers.indexOf(name);
  if (idx < 0) return "";
  return (row[idx] ?? "").trim();
}

/**
 * Converte "1/0", "true/false", "sim/não" -> boolean
 */
function parseBool(raw: string, defaultValue = true) {
  const v = (raw ?? "").trim().toLowerCase();
  if (!v) return defaultValue;
  if (["1", "true", "sim", "s", "yes", "y"].includes(v)) return true;
  if (["0", "false", "nao", "não", "n", "no"].includes(v)) return false;
  return defaultValue;
}

/**
 * Nature: aceita vazio -> null, aceita número
 */
function parseNullableInt(raw: string) {
  const v = (raw ?? "").trim();
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

/**
 * Date: aceita vazio -> null (mantém string para backend converter)
 * (YYYY-MM-DD recomendado)
 */
function parseNullableString(raw: string) {
  const v = (raw ?? "").trim();
  return v ? v : null;
}

/**
 * =========================
 * CFOP IMPORT (front -> payload)
 * Colunas aceitas (header):
 * - code / cfop
 * - description / descricao
 * - nature / natureza
 * - active / ativo
 * =========================
 */
export async function buildCfopImportItemsFromCsv(file: File) {
  const text = await readFileText(file);
  const { headers, rows } = parseCsvSimple(text);

  if (!headers.length) throw new Error("CSV vazio ou inválido");

  const items = rows.map((r, i) => {
    const code = getCell(headers, r, "code") || getCell(headers, r, "cfop");
    const description =
      getCell(headers, r, "description") || getCell(headers, r, "descricao") || getCell(headers, r, "descrição");
    const natureRaw = getCell(headers, r, "nature") || getCell(headers, r, "natureza");
    const activeRaw = getCell(headers, r, "active") || getCell(headers, r, "ativo");

    // pré-normalização
    const draft = {
      code: (code ?? "").trim(),
      description: (description ?? "").trim(),
      nature: parseNullableInt(natureRaw),
      active: parseBool(activeRaw, true),
    };

    const parsed = CfopFormSchema.safeParse(draft);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message ?? "Linha inválida";
      throw new Error(`CFOP CSV linha ${i + 2}: ${msg}`);
    }

    return parsed.data;
  });

  return items; // CfopForm[]
}

/**
 * =========================
 * NCM IMPORT
 * Colunas aceitas:
 * - code / ncm
 * - description / descricao
 * - ex
 * - start_date / inicio / start
 * - end_date / fim / end
 * - active / ativo
 * =========================
 */
export async function buildNcmImportItemsFromCsv(file: File) {
  const text = await readFileText(file);
  const { headers, rows } = parseCsvSimple(text);

  if (!headers.length) throw new Error("CSV vazio ou inválido");

  const items = rows.map((r, i) => {
    const code = getCell(headers, r, "code") || getCell(headers, r, "ncm");
    const description =
      getCell(headers, r, "description") || getCell(headers, r, "descricao") || getCell(headers, r, "descrição");

    const ex = getCell(headers, r, "ex");
    const start_date =
      getCell(headers, r, "start_date") || getCell(headers, r, "inicio") || getCell(headers, r, "start");
    const end_date =
      getCell(headers, r, "end_date") || getCell(headers, r, "fim") || getCell(headers, r, "end");

    const activeRaw = getCell(headers, r, "active") || getCell(headers, r, "ativo");

    const draft = {
      code: (code ?? "").trim(),
      description: (description ?? "").trim(),
      ex: parseNullableString(ex),
      start_date: parseNullableString(start_date),
      end_date: parseNullableString(end_date),
      active: parseBool(activeRaw, true),
    };

    const parsed = NcmFormSchema.safeParse(draft);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message ?? "Linha inválida";
      throw new Error(`NCM CSV linha ${i + 2}: ${msg}`);
    }

    return parsed.data;
  });

  return items; // NcmForm[]
}


async function buildCfopImportItemsFromExcel(file: File) {
  const rows = await readExcelRows(file);
  if (!rows.length) throw new Error("Planilha vazia");

  // detecta colunas comuns em tabelas oficiais
  // ajuste fino depois se necessário
  const sample = rows[0];
  const codeKey = pickKey(sample, ["code", "cfop", "código", "codigo", "código_cfop", "codigo_cfop"]);
  const descKey = pickKey(sample, ["description", "descrição", "descricao", "descr"]);

  if (!codeKey || !descKey) {
    throw new Error("Não foi possível detectar colunas de CFOP (código/descrição)");
  }

  const items = rows.map((row, i) => {
    const codeRaw = row[codeKey];
    const descriptionRaw = row[descKey];

    const draft = {
      code: normalizeCfopCode(codeRaw),
      description: String(descriptionRaw ?? "").trim(),
      nature: null,
      active: true,
    };

    if (!draft.code || draft.code.length !== 4) return null;

    const parsed = CfopFormSchema.safeParse(draft);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message ?? "Linha inválida";
      throw new Error(`CFOP XLS linha ${i + 2}: ${msg}`);
    }
    return parsed.data;
  });

  return items;
}

async function buildNcmImportItemsFromExcel(file: File) {
    
  const rows = await readExcelRows(file);
  if (!rows.length) throw new Error("Planilha vazia");

  const sample = rows[0];
  const codeKey = pickKey(sample, ["code", "ncm", "código", "codigo", "codigo_ncm", "código_ncm"]);
  const descKey = pickKey(sample, ["description", "descrição", "descricao", "descr"]);

  console.log("Primeira linha XLSX:", rows[0]);

  // campos opcionais (se existirem)
  const exKey = pickKey(sample, ["ex"]);
  const startKey = pickKey(sample, ["start_date", "inicio", "início", "vigencia_inicio", "data_inicio"]);
  const endKey = pickKey(sample, ["end_date", "fim", "final", "vigencia_fim", "data_fim"]);

  if (!codeKey || !descKey) {
    throw new Error("Não foi possível detectar colunas de NCM (código/descrição)");
  }

  const out: any[] = [];

  rows.forEach((row, i) => {
    const code = normalizeNcmCode(row[codeKey]);

    // se vierem níveis (ex: "01", "01.01"), você pode:
    // - importar tudo (ok)
    // - OU importar só 8 dígitos (mais prático pro produto)
    // Pra UX inicial, eu recomendo importar só 8 dígitos:
    if (!code || code.length !== 8) return;

    const draft = {
      code,
      description: String(row[descKey] ?? "").trim(),
      ex: exKey ? parseNullableString(String(row[exKey] ?? "")) : null,
      start_date: startKey ? parseNullableString(String(row[startKey] ?? "")) : null,
      end_date: endKey ? parseNullableString(String(row[endKey] ?? "")) : null,
      active: true,
    };

    const parsed = NcmFormSchema.safeParse(draft);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message ?? "Linha inválida";
      throw new Error(`NCM XLSX linha ${i + 2}: ${msg}`);
    }
    out.push(parsed.data);
  });

  return out;
}

async function buildNcmImportItemsFromJson(file: File) {
  const data = await readJsonFile(file);

  // tenta detectar array direto
  const arr: any[] =
    Array.isArray(data) ? data :
    Array.isArray((data as any)?.items) ? (data as any).items :
    Array.isArray((data as any)?.nomenclaturas) ? (data as any).nomenclaturas :
    [];

  if (!arr.length) throw new Error("JSON não contém lista de itens reconhecível");

  const out: any[] = [];
  arr.forEach((it, idx) => {
    const code = normalizeNcmCode(it.code ?? it.codigo ?? it.ncm ?? it.classificacao ?? it.classificacaoNcm);
    const desc = String(it.description ?? it.descricao ?? it.descrição ?? it.desc ?? "").trim();

    if (!code || code.length !== 8) return;

    const draft = { code, description: desc, ex: null, start_date: null, end_date: null, active: true };
    const parsed = NcmFormSchema.safeParse(draft);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message ?? "Item inválido";
      throw new Error(`NCM JSON item ${idx + 1}: ${msg}`);
    }
    out.push(parsed.data);
  });

  return out;
}

export async function buildNcmImportItemsFromFile(file: File) {
  if (isExcelFile(file)) return buildNcmImportItemsFromExcel(file);
  if (isJsonFile(file)) return buildNcmImportItemsFromJson(file);
  if (isCsvFile(file)) return buildNcmImportItemsFromCsv(file);
  throw new Error("Formato não suportado. Use CSV, XLSX/XLS ou JSON.");
}

export async function buildCfopImportItemsFromFile(file: File) {
  if (isExcelFile(file)) return buildCfopImportItemsFromExcel(file);
  if (isJsonFile(file)) {
    // opcional: implementar se aparecer fonte JSON pro CFOP
    throw new Error("CFOP via JSON ainda não suportado. Use XLSX/XLS ou CSV.");
  }
  if (isCsvFile(file)) return buildCfopImportItemsFromCsv(file);
  throw new Error("Formato não suportado. Use CSV ou XLSX/XLS.");
}