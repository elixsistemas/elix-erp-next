// components/MonthPicker.tsx
import { Button } from "@/components/ui/button";

export function MonthPicker(props: {
  month: string;
  onChange: (v: string) => void;
  onNow: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-slate-600 dark:text-slate-400">Mês:</label>
      <input
        type="month"
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={props.month}
        onChange={(e) => props.onChange(e.target.value)}
        disabled={props.disabled}
      />
      <Button variant="outline" onClick={props.onNow} disabled={props.disabled}>
        Atual
      </Button>
    </div>
  );
}
