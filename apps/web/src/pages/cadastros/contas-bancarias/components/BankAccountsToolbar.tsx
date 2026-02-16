// components/BankAccountsToolbar.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw } from "lucide-react";

export function BankAccountsToolbar(props: {
  q: string;
  setQ: (v: string) => void;
  loading: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
      <div className="sm:w-72">
        <Input
          placeholder="Buscar por nome, banco, agência..."
          value={props.q}
          onChange={(e) => props.setQ(e.target.value)}
        />
      </div>

      <Button variant="outline" onClick={props.onRefresh} disabled={props.loading}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Atualizar
      </Button>

      <Button onClick={props.onCreate}>
        <Plus className="h-4 w-4 mr-2" />
        Nova conta
      </Button>
    </div>
  );
}
