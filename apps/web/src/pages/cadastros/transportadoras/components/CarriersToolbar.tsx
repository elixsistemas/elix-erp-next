import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type Props = {
  q: string;
  onChangeQ: (value: string) => void;
  showInactive: boolean;
  onToggleInactive: (value: boolean) => void;
  loading: boolean;
  onReload: () => void;
  onCreate: () => void;
};

export function CarriersToolbar(props: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-semibold">Transportadoras</h1>
        <p className="text-sm text-muted-foreground">
          Cadastro completo para logística, frete e documentos fiscais.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder="Buscar por nome, documento, e-mail..."
          value={props.q}
          onChange={(e) => props.onChangeQ(e.target.value)}
          className="md:max-w-sm"
        />

        <div className="flex items-center gap-2">
          <Switch
            checked={props.showInactive}
            onCheckedChange={props.onToggleInactive}
          />
          <span className="text-sm">Mostrar inativos</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={props.onReload} disabled={props.loading}>
            Atualizar
          </Button>

          <Button onClick={props.onCreate}>
            Nova transportadora
          </Button>
        </div>
      </div>
    </div>
  );
}