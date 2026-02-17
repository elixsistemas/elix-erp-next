import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  q: string;
  onChangeQ: (v: string) => void;
  onReload: () => void;
};

export function InventoryToolbar({ q, onChangeQ, onReload }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Input
        className="w-full sm:w-80"
        placeholder="Buscar por produto, SKU ou ID..."
        value={q}
        onChange={(e) => onChangeQ(e.target.value)}
      />

      <div className="flex gap-2">
        <Button variant="secondary" onClick={onReload}>
          Recarregar
        </Button>
      </div>
    </div>
  );
}
