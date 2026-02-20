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

export function SupplierToolbar(props: Props) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <div className="text-xl font-semibold">Fornecedores</div>
        <div className="text-sm text-muted-foreground">
          Cadastro completo para compras, despesas e fiscal (contato + cobrança + retirada).
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <Input
          className="w-[320px]"
          placeholder="Buscar por nome, documento, email..."
          value={props.q}
          onChange={(e) => props.onChangeQ(e.target.value)}
        />

        <div className="flex items-center gap-2 px-2">
          <Switch
            checked={props.showInactive}
            onCheckedChange={props.onToggleInactive}
            id="showInactiveSuppliers"
          />
          <Label htmlFor="showInactiveSuppliers">Mostrar inativos</Label>
        </div>

        <Button variant="outline" onClick={props.onReload} disabled={props.loading}>
          Atualizar
        </Button>

        <Button onClick={props.onCreate}>Novo fornecedor</Button>
      </div>
    </div>
  );
}
