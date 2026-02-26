import { Separator } from "@/components/ui/separator";

interface Props {
  subtotal:  number;
  discount:  number;
  freight?:  number;   // ← melhoria 7 (opcional)
  total:     number;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function TotalsCard({ subtotal, discount, freight = 0, total }: Props) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-2 min-w-[220px]">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{fmt(subtotal)}</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Desconto</span>
          <span className="text-red-500">− {fmt(discount)}</span>
        </div>
      )}

      {freight > 0 && (                            // ← melhoria 7
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Frete</span>
          <span className="text-blue-600">+ {fmt(freight)}</span>
        </div>
      )}

      <Separator />

      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span className="text-lg">{fmt(total)}</span>
      </div>
    </div>
  );
}
