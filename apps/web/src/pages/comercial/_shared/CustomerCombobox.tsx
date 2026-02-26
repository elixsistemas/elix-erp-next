import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup,
  CommandItem, CommandList,
} from "@/components/ui/command";
import { cn }  from "@/lib/utils";
import { api } from "@/shared/api/client";
import { maskCPF, maskCNPJ, maskPhoneBR } from "@/shared/br/masks";
import { onlyDigits } from "@/shared/br/digits";

// ── tipo retornado pelo GET /customers ───────────────────────
type CustomerRow = {
  id:          number;
  name:        string;
  document:    string | null;
  person_type: "PF" | "PJ" | null;
  email:       string | null;
  phone:       string | null;
};

// ── helpers de máscara ───────────────────────────────────────
function maskDoc(doc: string | null, type: "PF" | "PJ" | null) {
  if (!doc) return null;
  const d = onlyDigits(doc);
  if (type === "PF" || d.length === 11) return maskCPF(d);
  if (type === "PJ" || d.length === 14) return maskCNPJ(d);
  return doc;
}

// ── props ────────────────────────────────────────────────────
interface Props {
  value:    number | null;
  onChange: (id: number | null, name: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CustomerCombobox({
  value,
  onChange,
  disabled,
  placeholder = "Buscar cliente...",
}: Props) {
  const [open,     setOpen]     = React.useState(false);
  const [search,   setSearch]   = React.useState("");
  const [results,  setResults]  = React.useState<CustomerRow[]>([]);
  const [loading,  setLoading]  = React.useState(false);
  const [selected, setSelected] = React.useState<CustomerRow | null>(null);

  // ── debounce na busca ────────────────────────────────────────
  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ limit: "20", active: "1" });
        if (search.trim()) qs.set("q", search.trim());
        const data = await api<CustomerRow[]>(`/customers?${qs}`);
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search, open]);

  // ── carrega nome quando recebe value sem selected ────────────
  React.useEffect(() => {
    if (!value || selected?.id === value) return;
    api<CustomerRow>(`/customers/${value}`)
      .then(c => setSelected(c))
      .catch(() => {});
  }, [value, selected?.id]);

  function handleSelect(customer: CustomerRow) {
    setSelected(customer);
    onChange(customer.id, customer.name);
    setOpen(false);
    setSearch("");
  }

  function handleClear() {
    setSelected(null);
    onChange(null, null);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.name : placeholder}
          </span>
          {loading
            ? <Loader2 className="ml-2 h-4 w-4 animate-spin shrink-0 opacity-50" />
            : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          {/* input de busca manual */}
          <div className="flex items-center border-b px-3">
            <Input
              className="h-9 border-0 shadow-none focus-visible:ring-0 text-sm"
              placeholder="Nome, CNPJ, CPF ou e-mail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <CommandList>
            {/* loading */}
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* sem resultados */}
            {!loading && !results.length && (
              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            )}

            {/* resultados */}
            {!loading && results.length > 0 && (
              <CommandGroup>
                {/* limpar seleção */}
                {value !== null && (
                  <CommandItem
                    value="__clear__"
                    onSelect={handleClear}
                    className="text-muted-foreground italic text-xs"
                  >
                    Remover cliente selecionado
                  </CommandItem>
                )}

                {results.map(c => {
                  const docMasked   = maskDoc(c.document, c.person_type);
                  const phoneMasked = c.phone ? maskPhoneBR(onlyDigits(c.phone)) : null;
                  return (
                    <CommandItem
                      key={c.id}
                      value={String(c.id)}
                      onSelect={() => handleSelect(c)}
                    >
                      <Check className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === c.id ? "opacity-100" : "opacity-0"
                      )} />
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{c.name}</span>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          {docMasked   && <span>{docMasked}</span>}
                          {phoneMasked && <span>{phoneMasked}</span>}
                          {c.email     && <span className="truncate">{c.email}</span>}
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
