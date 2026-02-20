import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils"; // se não tiver, me diga que eu tiro
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { searchCustomers } from "../quotes.service";
import type { CustomerMini } from "../quotes.types";
import { toast } from "sonner";

export function CustomerCombobox(props: {
  value: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<CustomerMini[]>([]);
  const selected = items.find((c) => c.id === props.value);

  React.useEffect(() => {
    let alive = true;
    async function run() {
      const s = q.trim();
      if (s.length < 2) return setItems([]);
      setLoading(true);
      try {
        const data = await searchCustomers(s);
        if (!alive) return;
        setItems(data);
      } catch (e: any) {
        toast.error(e?.message ?? "Falha ao buscar clientes");
      } finally {
        if (alive) setLoading(false);
      }
    }
    const t = setTimeout(() => void run(), 250);
    return () => { alive = false; clearTimeout(t); };
  }, [q]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={props.disabled}>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {props.value ? (selected ? `${selected.name} • ${selected.document}` : `Cliente #${props.value}`) : "Selecionar cliente..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[520px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Digite nome, documento, email..." value={q} onValueChange={setQ} />
          <CommandList>
            <CommandEmpty>{loading ? "Buscando..." : "Nenhum cliente encontrado."}</CommandEmpty>
            <CommandGroup heading="Resultados">
              {items.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} ${c.document}`}
                  onSelect={() => {
                    props.onChange(c.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", props.value === c.id ? "opacity-100" : "opacity-0")} />
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.document}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
