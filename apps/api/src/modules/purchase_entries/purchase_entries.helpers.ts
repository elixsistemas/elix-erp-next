import { createHash } from "node:crypto";

export function onlyDigits(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

export function clean(value: string | null | undefined, maxChars: number) {
  const v = (value ?? "").trim();
  if (!v) return null;
  return v.slice(0, maxChars);
}

export function normalizeCountry(value: string | null | undefined) {
  const raw = (value ?? "").trim().toUpperCase();
  if (!raw) return "BR";
  if (raw === "BR" || raw === "BRA" || raw === "BRASIL" || raw === "BRAZIL") {
    return "BR";
  }
  return raw.slice(0, 2);
}

export function hashXml(xmlContent: string) {
  return createHash("sha256").update(xmlContent, "utf8").digest("hex");
}

export function round2(value: number) {
  return Number((value ?? 0).toFixed(2));
}

export function round6(value: number) {
  return Number((value ?? 0).toFixed(6));
}

export function calcSuggestedPrice(params: {
  landedUnitCost: number;
  pricePolicy: "NONE" | "MARKUP" | "MARGIN" | "SUGGESTED_ONLY";
  markupPercent: number | null;
  marginPercent: number | null;
  currentPrice: number;
}) {
  const { landedUnitCost, pricePolicy, markupPercent, marginPercent, currentPrice } = params;

  if (pricePolicy === "NONE") {
    return {
      suggestedPrice: currentPrice,
      appliedPrice: currentPrice,
      changed: false,
    };
  }

  if (pricePolicy === "MARKUP") {
    const pct = Number(markupPercent ?? 0);
    const suggested = round2(landedUnitCost * (1 + pct / 100));
    return {
      suggestedPrice: suggested,
      appliedPrice: suggested,
      changed: true,
    };
  }

  if (pricePolicy === "MARGIN") {
    const pct = Number(marginPercent ?? 0);
    const divisor = 1 - pct / 100;
    const suggested = divisor > 0 ? round2(landedUnitCost / divisor) : currentPrice;
    return {
      suggestedPrice: suggested,
      appliedPrice: suggested,
      changed: divisor > 0,
    };
  }

  return {
    suggestedPrice: round2(landedUnitCost),
    appliedPrice: currentPrice,
    changed: false,
  };
}