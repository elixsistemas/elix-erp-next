import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  q: string;
  setQ: (v: string) => void;
  statusFilter: "1" | "0" | "all";
  setStatusFilter: (v: "1" | "0" | "all") => void;
  loading: boolean;
  onRefresh: () => void;
  onCreate: () => void;
};

export function CarriersToolbar(props: Props) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <Input
        placeholder="Buscar por nome, documento, cidade, RNTRC..."
        value={props.q}
        onChange={(e) => props.setQ(e.target.value)}
        className="md:max-w-sm"
      />

      <Select
        value={props.statusFilter}
        onValueChange={(v: "1" | "0" | "all") => props.setStatusFilter(v)}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Ativas</SelectItem>
          <SelectItem value="0">Inativas</SelectItem>
          <SelectItem value="all">Todas</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2 md:ml-auto">
        <Button variant="outline" onClick={props.onRefresh} disabled={props.loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>

        <Button onClick={props.onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova transportadora
        </Button>
      </div>
    </div>
  );
}