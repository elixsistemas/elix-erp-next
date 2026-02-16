import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  q: string;
  onChangeQ: (v: string) => void;
  onCreate: () => void;
};

export function CustomerToolbar({ q, onChangeQ, onCreate }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => onChangeQ(e.target.value)} placeholder="Buscar empresa..." />
        <Button type="button" variant="secondary" onClick={() => onChangeQ("")}>Limpar</Button>
      </div>
      <Button onClick={onCreate}>+ Nova empresa</Button>
    </div>
  );
}
