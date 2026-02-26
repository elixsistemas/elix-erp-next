import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup,
  CommandItem, CommandList,
} from "@/components/ui/command";
import { cn }  from "@/lib/utils";
import { api } from "@/shared/api/client";

// ── tipo retornado pelo GET /products ────────────────────────
type ProductRow = {
  id:    number;
  name:  string;
  sku:   string | null;
  price: number | null;
  uom:   string | null;
  kind:  string | null;
};

// ── props ────────────────────────────────────────────────────
interface Props {
  value:    number | null;
  /** id, nome, preço unitário */
  onChange: (id: number | null, name: string | null, price: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ProductCombobox({
  value,
  onChange,
  disabled,
  placeholder = "Buscar produto...",
}: Props) {
  const [open,    setOpen]    = React.useState(false);
  const [search,  setSearch]  = React.useState("");
  const [results, setResults] = React.useState<ProductRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<ProductRow | null>(null);

  // ── debounce na busca ────────────────────────────────────────
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ limit: "20", active: "1" });
        if (search.trim()) qs.set("q", search.trim());
        const data = await api<ProductRow[]>(`/products?${qs}`);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search, open]);

  // ── carrega nome quando tem value mas sem selected ───────────
  React.useEffect(() => {
    if (!value || selected?.id === value) return;
    api<ProductRow>(`/products/${value}`)
      .then(p => setSelected(p))
      .catch(() => {});
  }, [value, selected?.id]);

  function handleSelect(product: ProductRow) {
    setSelected(product);
    onChange(product.id, product.name, product.price ?? null);
    setOpen(false);
    setSearch("");
  }

  function handleClear() {
    setSelected(null);
    onChange(null, null, null);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between font-normal text-sm h-8"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected
              ? `${selected.name}${selected.sku ? ` (${selected.sku})` : ""}`
              : placeholder}
          </span>
          {loading
            ? <Loader2 className="ml-1 h-3 w-3 animate-spin shrink-0 opacity-50" />
            : <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[380px] p-0" align="start">
        <Command shouldFilter={false}>
          {/* input de busca manual (não usa o filtro interno do Command) */}
          <div className="flex items-center border-b px-3">
            <Input
              className="h-9 border-0 shadow-none focus-visible:ring-0 text-sm"
              placeholder="Nome ou SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <CommandList>
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && !results.length && (
              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
            )}
            {!loading && results.length > 0 && (
              <CommandGroup>
                {/* limpar seleção */}
                {value !== null && (
                  <CommandItem
                    value="__clear__"
                    onSelect={handleClear}
                    className="text-muted-foreground italic text-xs"
                  >
                    <span>Remover produto selecionado</span>
                  </CommandItem>
                )}
                {results.map(p => (
                  <CommandItem
                    key={p.id}
                    value={String(p.id)}
                    onSelect={() => handleSelect(p)}
                  >
                    <Check className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === p.id ? "opacity-100" : "opacity-0"
                    )} />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{p.name}</span>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {p.sku   && <span>SKU: {p.sku}</span>}
                        {p.uom   && <span>{p.uom}</span>}
                        {p.price != null && (
                          <span className="text-green-600 font-medium">
                            {p.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
