import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { searchProducts } from "../quotes.service";
import type { ProductMini } from "../quotes.types";
import { toast } from "sonner";

export function ProductCombobox(props: {
  value: number | null;
  onPick: (p: ProductMini) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<ProductMini[]>([]);
  const selected = items.find((p) => p.id === props.value);

  React.useEffect(() => {
    let alive = true;
    async function run() {
      const s = q.trim();
      if (s.length < 2) return setItems([]);
      setLoading(true);
      try {
        const data = await searchProducts(s);
        if (!alive) return;
        setItems(data);
      } catch (e: any) {
        toast.error(e?.message ?? "Falha ao buscar produtos");
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
          {props.value ? (selected ? `${selected.name}${selected.sku ? ` • ${selected.sku}` : ""}` : `Produto #${props.value}`) : "Selecionar produto..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[640px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Digite nome, SKU, EAN..." value={q} onValueChange={setQ} />
          <CommandList>
            <CommandEmpty>{loading ? "Buscando..." : "Nenhum produto encontrado."}</CommandEmpty>
            <CommandGroup heading="Resultados">
              {items.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${p.sku ?? ""} ${p.ean ?? ""}`}
                  onSelect={() => {
                    props.onPick(p);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", props.value === p.id ? "opacity-100" : "opacity-0")} />
                  <div className="w-full">
                    <div className="font-medium flex items-center justify-between">
                      <span>{p.name}</span>
                      <span className="text-xs text-muted-foreground">{p.kind === "service" ? "Serviço" : "Produto"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.sku ? `SKU: ${p.sku}` : "—"} {p.uom ? ` • UOM: ${p.uom}` : ""} • Preço: {Number(p.price ?? 0).toFixed(2).replace(".", ",")}
                    </div>
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
