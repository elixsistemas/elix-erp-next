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

export function CustomerToolbar(props: Props) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <div className="text-xl font-semibold">Clientes</div>
        <div className="text-sm text-muted-foreground">
          Cadastro completo para Orçamentos virarem Vendas concretas (contato + cobrança + entrega).
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Input
            className="w-[320px]"
            placeholder="Buscar por nome, documento, email..."
            value={props.q}
            onChange={(e) => props.onChangeQ(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 px-2">
          <Switch
            checked={props.showInactive}
            onCheckedChange={props.onToggleInactive}
            id="showInactive"
          />
          <Label htmlFor="showInactive">Mostrar inativos</Label>
        </div>

        <Button variant="outline" onClick={props.onReload} disabled={props.loading}>
          Atualizar
        </Button>

        <Button onClick={props.onCreate}>Novo cliente</Button>
      </div>
    </div>
  );
}
