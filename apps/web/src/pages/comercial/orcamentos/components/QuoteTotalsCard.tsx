import type { QuoteItemUpsert } from "../quotes.types";
import { parsePtBrDecimal} from "./ptbrDecimal";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function QuoteTotalsCard(props: { items: QuoteItemUpsert[]; discountText: string }) {
  const subtotal = props.items.reduce((acc, it) => acc + (Number(it.quantity) * Number(it.unitPrice)), 0);
  const discount = parsePtBrDecimal(props.discountText) ?? 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="font-medium">Totais (prévia)</div>
      <div className="text-sm text-muted-foreground">
        O backend recalcula e garante consistência.
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="font-mono tabular-nums">{brl.format(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Desconto</span>
          <span className="font-mono tabular-nums">{brl.format(discount)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 mt-2">
          <span className="font-medium">Total</span>
          <span className="font-mono tabular-nums">{brl.format(total)}</span>
        </div>
      </div>
    </div>
  );
}
