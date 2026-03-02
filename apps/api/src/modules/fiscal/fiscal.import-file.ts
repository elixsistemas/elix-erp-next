import * as XLSX from "xlsx";

/* =========================
   Helpers comuns
========================= */
function onlyDigits(v: any) {
  return String(v ?? "").replace(/\D+/g, "");
}

function normHeader(v: any) {
  return String(v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function isEmptyCell(v: any) {
  const s = String(v ?? "").trim();
  return !s || s === "-" || s === "—";
}

/* =========================
   CFOP
========================= */
function pickCfopColumn(header: string[]) {
  // prioridade: "cfop" EXATO (evita pegar "grupo cfop")
  let idx = header.findIndex((h) => h === "cfop");
  if (idx >= 0) return idx;

  // fallback: contém "cfop" mas NÃO contém "grupo"
  idx = header.findIndex((h) => h.includes("cfop") && !h.includes("grupo"));
  if (idx >= 0) return idx;

  // fallback final: "codigo cfop" etc
  idx = header.findIndex(
    (h) => (h.includes("codigo") || h.includes("código")) && h.includes("cfop")
  );
  return idx;
}

function pickDescColumn(header: string[]) {
  // "descrição_cfop", "descricao", etc
  let idx = header.findIndex((h) => h.includes("descricao") && h.includes("cfop"));
  if (idx >= 0) return idx;

  idx = header.findIndex((h) => h.includes("descr"));
  return idx;
}

export async function parseCfopUploadToItems(buf: Buffer, filename: string) {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const wb = XLSX.read(buf, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });

    // acha header (linha que contém cfop e descr)
    let headerRow = -1;
    for (let i = 0; i < Math.min(rows.length, 80); i++) {
      const line = (rows[i] ?? []).map(normHeader);
      if (line.some((v) => v.includes("cfop")) && line.some((v) => v.includes("descr"))) {
        headerRow = i;
        break;
      }
    }
    if (headerRow < 0) {
      throw new Error("Não foi possível detectar colunas de CFOP (CFOP / Descrição).");
    }

    const header = (rows[headerRow] ?? []).map(normHeader);

    const idxCfop = pickCfopColumn(header);
    const idxDesc = pickDescColumn(header);

    if (idxCfop < 0 || idxDesc < 0) {
      throw new Error(`Colunas esperadas não encontradas. Header detectado: ${header.join(" | ")}`);
    }

    const map = new Map<string, any>();

    for (let i = headerRow + 1; i < rows.length; i++) {
      const r = rows[i] ?? [];

      const code = onlyDigits(r[idxCfop]);
      if (code.length !== 4) continue;

      const description = String(r[idxDesc] ?? "").trim();
      if (description.length < 3) continue;

      // dedupe: mantém o primeiro ou substitui se a descrição nova for maior
      const prev = map.get(code);
      const nature = /^\d$/.test(code[0]) ? Number(code[0]) : null;

      const item = {
        code,
        description: description.slice(0, 500),
        nature,
        active: true,
      };

      if (!prev) map.set(code, item);
      else if ((item.description?.length ?? 0) > (prev.description?.length ?? 0)) map.set(code, item);
    }

    return Array.from(map.values());
  }

  throw new Error("Formato não suportado (use XLSX/XLS para CFOP neste fluxo).");
}

/* =========================
   NCM
========================= */
const extFromName = (name: string) => name.toLowerCase().split(".").pop() ?? "";
const digitsOnly = (v: any) => String(v ?? "").replace(/\D/g, "").trim();

function normalizeDate(s: string) {
  if (!s) return null;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return s;
}

function findHeaderRow(rows: any[][], required: RegExp[]) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].map((c: any) => String(c ?? "").trim().toLowerCase());
    const ok = required.every((rx) => row.some((c: string) => rx.test(c)));
    if (ok) return i;
  }
  return -1;
}

function idxOf(headers: string[], rx: RegExp) {
  return headers.findIndex((h) => rx.test(h));
}

export async function parseNcmUploadToItems(buf: Buffer, filename: string) {
  const ext = extFromName(filename);

  if (ext === "xlsx" || ext === "xls") return parseNcmExcel(buf);
  if (ext === "json") return parseNcmJson(buf);

  // CSV/TXT fallback (se quiser depois)
  throw new Error("Formato não suportado. Envie XLSX/XLS/JSON.");
}

function parseNcmExcel(buf: Buffer) {
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

  const headerRow = findHeaderRow(raw, [/c[oó]digo|ncm/i, /descri[cç][aã]o/i]);
  if (headerRow < 0) throw new Error("Não foi possível detectar colunas de NCM (código/descrição)");

  const headers = raw[headerRow].map((h: any) => String(h ?? "").trim());

  const idxCodigo = idxOf(headers, /c[oó]digo|ncm/i);
  const idxDesc = idxOf(headers, /descri[cç][aã]o/i);
  const idxInicio = idxOf(headers, /data.*in[ií]cio|in[ií]cio/i);
  const idxFim = idxOf(headers, /data.*fim|fim|final/i);
  const idxEx = idxOf(headers, /^ex$/i);

  const items: any[] = [];

  for (let i = headerRow + 1; i < raw.length; i++) {
    const row = raw[i];
    if (!row || row.every((c: any) => String(c ?? "").trim() === "")) continue;

    const code = digitsOnly(row[idxCodigo]);
    if (!code || code.length !== 8) continue; // pega só 8 dígitos

    const description = String(row[idxDesc] ?? "").trim();
    if (description.length < 3) continue;

    const descNcm = description.slice(0, 2000);

    items.push({
      code,
      description: descNcm,
      ex: idxEx >= 0 ? (String(row[idxEx] ?? "").trim() || null) : null,
      start_date: idxInicio >= 0 ? normalizeDate(String(row[idxInicio] ?? "").trim()) : null,
      end_date: idxFim >= 0 ? normalizeDate(String(row[idxFim] ?? "").trim()) : null,
      active: true,
    });
  }

  return items;
}

function parseNcmJson(buf: Buffer) {
  const data = JSON.parse(buf.toString("utf-8"));
  const arr: any[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  if (!arr.length) throw new Error("JSON não contém lista reconhecível");

  return arr
    .map((it) => {
      const code = digitsOnly(it.code ?? it.codigo ?? it.ncm);
      if (!code || code.length !== 8) return null;
      return {
        code,
        description: String(it.description ?? it.descricao ?? "").trim(),
        ex: null,
        start_date: null,
        end_date: null,
        active: true,
      };
    })
    .filter(Boolean);
}

/* =========================
   CEST (robusto p/ planilha com múltiplas abas)
========================= */
function normalizeCestCode(v: any) {
  const d = onlyDigits(v);
  if (!d) return null;

  // Excel às vezes come zero à esquerda (vira 100100 em vez de 0100100)
  // então padStart garante 7 dígitos consistentes
  if (d.length > 7) return null;
  return d.padStart(7, "0");
}

function pickCestColumn(header: string[]) {
  // prioridade: "cest" exato
  let idx = header.findIndex((h) => h === "cest");
  if (idx >= 0) return idx;

  // contém "cest" mas não "grupo"
  idx = header.findIndex((h) => h.includes("cest") && !h.includes("grupo"));
  if (idx >= 0) return idx;

  // "codigo cest" etc
  idx = header.findIndex(
    (h) => (h.includes("codigo") || h.includes("código")) && h.includes("cest")
  );
  return idx;
}

function pickSegmentColumn(header: string[]) {
  // "segmento", "segment"
  let idx = header.findIndex((h) => h.includes("segmento"));
  if (idx >= 0) return idx;

  idx = header.findIndex((h) => h.includes("segment"));
  return idx;
}

function pickActiveColumn(header: string[]) {
  // "ativo", "active", "status"
  let idx = header.findIndex((h) => h === "ativo" || h === "active");
  if (idx >= 0) return idx;

  idx = header.findIndex((h) => h.includes("status"));
  return idx;
}

function pickSpecColumns(header: string[]) {
  // quando descrição vem "-" e o texto real vem em "Especificação..."
  const idxs: number[] = [];
  header.forEach((h, i) => {
    if (h.includes("especific")) idxs.push(i);
  });
  return idxs;
}

function parseActive(v: any) {
  const s = String(v ?? "").trim().toLowerCase();
  if (!s) return null;

  if (["1", "true", "sim", "s", "ativo", "ativado", "yes", "y"].includes(s)) return true;
  if (["0", "false", "nao", "não", "n", "inativo", "desativado", "no"].includes(s)) return false;

  return null;
}

function findCestHeaderRow(rows: any[][]) {
  // acha header (linha que contém cest e descr)
  for (let i = 0; i < Math.min(rows.length, 140); i++) {
    const line = (rows[i] ?? []).map(normHeader);
    if (line.some((v) => v.includes("cest")) && line.some((v) => v.includes("descr"))) {
      return i;
    }
  }
  return -1;
}

export async function parseCestUploadToItems(buf: Buffer, filename: string) {
  const lower = filename.toLowerCase();

  if (!lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
    throw new Error("Formato não suportado (use XLSX/XLS para CEST neste fluxo).");
  }

  const wb = XLSX.read(buf, { type: "buffer" });

  // dedupe global por code (CEST é único nacional)
  const map = new Map<string, any>();

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;

    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });

    const headerRow = findCestHeaderRow(rows);
    if (headerRow < 0) continue;

    const header = (rows[headerRow] ?? []).map(normHeader);

    const idxCest = pickCestColumn(header);
    const idxDesc = pickDescColumn(header); // reaproveita do CFOP (procura "descr")
    const idxSeg = pickSegmentColumn(header);
    const idxAct = pickActiveColumn(header);
    const specIdxs = pickSpecColumns(header);

    if (idxCest < 0 || idxDesc < 0) continue;

    // segmento default: nome da aba (metadado), caso não exista coluna "segmento"
    const sheetSegment = String(sheetName ?? "").trim().slice(0, 400) || null;

    for (let i = headerRow + 1; i < rows.length; i++) {
      const r = rows[i] ?? [];
      if (!r || r.every((c: any) => String(c ?? "").trim() === "")) continue;

      const code = normalizeCestCode(r[idxCest]);
      if (!code || code.length !== 7) continue;

      let description = String(r[idxDesc] ?? "").trim();

      // se descrição vier "-" ou vazia, tenta puxar algo útil das colunas "Especificação..."
      if (isEmptyCell(description) && specIdxs.length) {
        for (const si of specIdxs) {
          const cand = String(r[si] ?? "").trim();
          if (!isEmptyCell(cand)) {
            description = cand;
            break;
          }
        }
      }

      if (isEmptyCell(description) || description.length < 3) continue;

      const segment =
        idxSeg >= 0
          ? (String(r[idxSeg] ?? "").trim().slice(0, 400) || sheetSegment)
          : sheetSegment;

      const parsedActive = idxAct >= 0 ? parseActive(r[idxAct]) : null;

      const item = {
        code,
        description: description.slice(0, 1200),
        segment,
        active: parsedActive ?? true,
      };

      // dedupe: mantém o melhor (descr maior). se quiser, concatena segmento.
      const prev = map.get(code);
      if (!prev) {
        map.set(code, item);
      } else {
        const better = (item.description?.length ?? 0) > (prev.description?.length ?? 0) ? item.description : prev.description;

        // merge de segmentos sem mudar schema (bom p/ “monstro” multi-aba)
        let mergedSegment = prev.segment ?? null;
        if (segment && mergedSegment && segment !== mergedSegment) {
          const set = new Set(
            String(mergedSegment)
              .split(";")
              .map((s) => s.trim())
              .filter(Boolean)
          );
          set.add(segment);
          mergedSegment = Array.from(set).join("; ").slice(0, 400);
        } else if (segment && !mergedSegment) {
          mergedSegment = segment;
        }

        map.set(code, { ...prev, description: better, segment: mergedSegment, active: prev.active ?? true });
      }
    }
  }

  const out = Array.from(map.values());
  if (!out.length) {
    throw new Error("Não foi possível extrair CEST. Verifique se o arquivo contém colunas CEST e Descrição.");
  }

  return out;
}