import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { api } from "@/shared/api/client";

type UserRow = { id: number; name: string; email: string; role: string };

interface Props {
  value: number | null;
  onChange: (id: number | null, name: string | null) => void;
  disabled?: boolean;
}

export function SellerCombobox({ value, onChange, disabled }: Props) {
  const [open, setOpen]     = React.useState(false);
  const [users, setUsers]   = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    api<UserRow[]>("/users")
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const selected = users.find(u => u.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {selected ? selected.name : "Selecionar vendedor..."}
          {loading
            ? <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-50" />
            : <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0">
        <Command>
          <CommandInput placeholder="Buscar vendedor..." />
          <CommandList>
            <CommandEmpty>Nenhum vendedor encontrado.</CommandEmpty>
            <CommandGroup>
              {/* Opção "nenhum" */}
              <CommandItem
                value="__none__"
                onSelect={() => { onChange(null, null); setOpen(false); }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === null ? "opacity-100" : "opacity-0")} />
                <span className="text-muted-foreground italic">Sem vendedor</span>
              </CommandItem>
              {users.map(u => (
                <CommandItem
                  key={u.id}
                  value={`${u.id} ${u.name}`}
                  onSelect={() => { onChange(u.id, u.name); setOpen(false); }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === u.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex flex-col">
                    <span className="font-medium">{u.name}</span>
                    <span className="text-xs text-muted-foreground">{u.role}</span>
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
