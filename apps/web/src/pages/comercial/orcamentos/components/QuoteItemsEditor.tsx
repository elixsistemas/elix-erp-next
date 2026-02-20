import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCombobox } from "./ProductCombobox";
import type { ProductMini, QuoteItemUpsert } from "../quotes.types";
import { sanitizePtBrDecimalInput, parsePtBrDecimal, formatPtBrFixed } from "./ptbrDecimal";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type RowText = { qty: string; price: string };

export function QuoteItemsEditor(props: {
  locked: boolean;
  items: QuoteItemUpsert[];
  onChange: (items: QuoteItemUpsert[]) => void;
}) {
  const [texts, setTexts] = React.useState<Record<number, RowText>>({});

  React.useEffect(() => {
    // garante texto inicial para cada linha
    setTexts((prev) => {
      const next = { ...prev };
      props.items.forEach((it, idx) => {
        if (!next[idx]) {
          next[idx] = {
            qty: formatPtBrFixed(Number(it.quantity ?? 1), 3),
            price: formatPtBrFixed(Number(it.unitPrice ?? 0), 2),
          };
        }
      });
      return next;
    });
  }, [props.items.length]);

  function setItem(idx: number, patch: Partial<QuoteItemUpsert>) {
    const next = props.items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    props.onChange(next);
  }

  function addRow() {
    props.onChange([
      ...props.items,
      { productId: 0, description: "", quantity: 1, unitPrice: 0 },
    ]);
  }

  function removeRow(idx: number) {
    props.onChange(props.items.filter((_, i) => i !== idx));
  }

  function pickProduct(idx: number, p: ProductMini) {
    setItem(idx, {
      productId: p.id,
      description: (p.description?.trim() ? p.description : p.name).slice(0, 255),
      unitPrice: Number(p.price ?? 0),
    });

    setTexts((prev) => ({
      ...prev,
      [idx]: {
        qty: prev[idx]?.qty ?? "1,000",
        price: formatPtBrFixed(Number(p.price ?? 0), 2),
      },
    }));
  }

  return (
    <div className="space-y-3">
      {props.items.map((it, idx) => {
        const t = texts[idx] ?? { qty: "1,000", price: "0,00" };

        const qty = parsePtBrDecimal(t.qty) ?? Number(it.quantity ?? 0);
        const unit = parsePtBrDecimal(t.price) ?? Number(it.unitPrice ?? 0);
        const lineTotal = Math.max(0, qty * unit);

        return (
          <div key={idx} className="border rounded-lg p-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-end">
              <div className="lg:col-span-4">
                <div className="text-xs text-muted-foreground mb-1">Produto</div>
                <ProductCombobox
                  value={it.productId || null}
                  disabled={props.locked}
                  onPick={(p) => pickProduct(idx, p)}
                />
              </div>

              <div className="lg:col-span-4">
                <div className="text-xs text-muted-foreground mb-1">Descrição</div>
                <Input
                  value={it.description}
                  disabled={props.locked}
                  onChange={(e) => setItem(idx, { description: e.target.value })}
                />
              </div>

              <div className="lg:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Qtd</div>
                <Input
                  value={t.qty}
                  disabled={props.locked}
                  inputMode="decimal"
                  onChange={(e) =>
                    setTexts((p) => ({
                      ...p,
                      [idx]: { ...t, qty: sanitizePtBrDecimalInput(e.target.value) },
                    }))
                  }
                  onBlur={() => {
                    const n = parsePtBrDecimal(t.qty);
                    if (n === null || n <= 0) return;
                    setItem(idx, { quantity: n });
                    setTexts((p) => ({ ...p, [idx]: { ...t, qty: formatPtBrFixed(n, 3) } }));
                  }}
                />
              </div>

              <div className="lg:col-span-2">
                <div className="text-xs text-muted-foreground mb-1">Preço</div>
                <Input
                  value={t.price}
                  disabled={props.locked}
                  inputMode="decimal"
                  onChange={(e) =>
                    setTexts((p) => ({
                      ...p,
                      [idx]: { ...t, price: sanitizePtBrDecimalInput(e.target.value) },
                    }))
                  }
                  onBlur={() => {
                    const n = parsePtBrDecimal(t.price);
                    if (n === null || n < 0) return;
                    setItem(idx, { unitPrice: n });
                    setTexts((p) => ({ ...p, [idx]: { ...t, price: formatPtBrFixed(n, 2) } }));
                  }}
                />
              </div>

              <div className="lg:col-span-12 flex items-center justify-between mt-2">
                <div className="text-sm">
                  Total linha: <span className="font-mono tabular-nums">{brl.format(lineTotal)}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={props.locked}
                    onClick={() => removeRow(idx)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <Button variant="outline" onClick={addRow} disabled={props.locked}>
        + Adicionar item
      </Button>
    </div>
  );
}
