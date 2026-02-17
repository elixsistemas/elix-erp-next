import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MovementType, ProductMini } from "../inventory.types";

type Props = {
  products: ProductMini[];
  productId: number | "ALL";
  onChangeProductId: (v: number | "ALL") => void;

  type: MovementType | "ALL";
  onChangeType: (v: MovementType | "ALL") => void;

  onCreate: (preset: MovementType) => void;
  onReload: () => void;
};

export function MovementsToolbar({
  products,
  productId,
  onChangeProductId,
  type,
  onChangeType,
  onCreate,
  onReload,
}: Props) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={String(productId)} onValueChange={(v) => onChangeProductId(v === "ALL" ? "ALL" : Number(v))}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Filtrar por produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os produtos</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={(v) => onChangeType(v as any)}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="IN">Entrada</SelectItem>
            <SelectItem value="OUT">Saída</SelectItem>
            <SelectItem value="ADJUST_POS">Ajuste +</SelectItem>
            <SelectItem value="ADJUST_NEG">Ajuste -</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onReload}>
          Recarregar
        </Button>

        {/* ✅ Ações rápidas */}
        <Button onClick={() => onCreate("IN")}>Entrada</Button>
        <Button onClick={() => onCreate("OUT")}>Saída</Button>
        <Button variant="secondary" onClick={() => onCreate("ADJUST_POS")}>
          Ajuste +
        </Button>
        <Button variant="secondary" onClick={() => onCreate("ADJUST_NEG")}>
          Ajuste -
        </Button>
      </div>
    </div>
  );
}
