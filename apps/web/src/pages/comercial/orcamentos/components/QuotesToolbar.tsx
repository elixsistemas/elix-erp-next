import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { useQuotesList } from "../useQuotesList";

export function QuotesToolbar({ vm }: { vm: ReturnType<typeof useQuotesList> }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <Input
        className="w-[320px]"
        placeholder="Buscar por nº, cliente, documento, observação..."
        value={vm.q}
        onChange={(e) => vm.setQ(e.target.value)}
      />

      <Select value={vm.status} onValueChange={(v) => vm.setStatus(v as any)}>
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="draft">Rascunho</SelectItem>
          <SelectItem value="approved">Aprovado</SelectItem>
          <SelectItem value="cancelled">Cancelado</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input type="date" value={vm.from} onChange={(e) => vm.setFrom(e.target.value)} />
        <Input type="date" value={vm.to} onChange={(e) => vm.setTo(e.target.value)} />
      </div>
    </div>
  );
}
