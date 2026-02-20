export function sanitizePtBrDecimalInput(raw: string) {
  let s = (raw ?? "").replace(/[^\d,]/g, "");
  const parts = s.split(",");
  if (parts.length > 2) s = `${parts[0]},${parts.slice(1).join("")}`;
  return s;
}

export function parsePtBrDecimal(raw: string): number | null {
  const s0 = (raw ?? "").trim();
  if (!s0) return null;
  const normalized = s0.replace(/\./g, "").replace(",", ".");
  const normalized2 = normalized.endsWith(".") ? normalized.slice(0, -1) : normalized;
  const n = Number(normalized2);
  return Number.isFinite(n) ? n : null;
}

export function formatPtBrFixed(n: number, decimals = 2) {
  return Number(n).toFixed(decimals).replace(".", ",");
}
