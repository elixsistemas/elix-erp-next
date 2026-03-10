import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  q: string;
  onChangeQ: (v: string) => void;
  onReload: () => void;
};

export function ProductKitsToolbar(props: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Composição de Kits</h2>
        <p className="text-sm text-muted-foreground">
          Defina os componentes de cada kit comercializável.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-10">
          <Input
            placeholder="Buscar kit por nome ou SKU..."
            value={props.q}
            onChange={(e) => props.onChangeQ(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end lg:col-span-2">
          <Button variant="outline" onClick={props.onReload}>
            Atualizar
          </Button>
        </div>
      </div>
    </div>
  );
}