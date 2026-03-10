import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type Props = {
  q: string;
  onChangeQ: (v: string) => void;
  showInactive: boolean;
  onToggleInactive: (v: boolean) => void;
  loading: boolean;
  onCreate: () => void;
  onReload: () => void;
};

export function ServicesToolbar(props: Props) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Serviços</h2>
        <p className="text-sm text-muted-foreground">
          Cadastro dedicado de serviços baseado no catálogo unificado de itens.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Input
            placeholder="Buscar por nome ou SKU..."
            value={props.q}
            onChange={(e) => props.onChangeQ(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 lg:col-span-3">
          <Switch
            id="show-inactive-services"
            checked={props.showInactive}
            onCheckedChange={props.onToggleInactive}
          />
          <Label htmlFor="show-inactive-services">Mostrar inativos</Label>
        </div>

        <div className="flex items-center justify-end gap-2 lg:col-span-2">
          <Button
            type="button"
            variant="outline"
            onClick={props.onReload}
            disabled={props.loading}
          >
            Atualizar
          </Button>

          <Button type="button" onClick={props.onCreate}>
            Novo serviço
          </Button>
        </div>
      </div>
    </div>
  );
}