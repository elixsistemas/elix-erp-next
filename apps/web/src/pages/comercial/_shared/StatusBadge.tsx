import { Badge } from "@/components/ui/badge";

type Status = "draft" | "approved" | "confirmed" | "completed" | "cancelled";

const config: Record<Status, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft:     { label: "Rascunho",   variant: "secondary"   },
  approved:  { label: "Aprovado",   variant: "default"     },
  confirmed: { label: "Confirmado", variant: "default"     },
  completed: { label: "Concluído",  variant: "default"     },
  cancelled: { label: "Cancelado",  variant: "destructive" },
};

const colorClass: Record<Status, string> = {
  draft:     "bg-gray-100 text-gray-600 border-gray-200",
  approved:  "bg-blue-100 text-blue-700 border-blue-200",
  confirmed: "bg-violet-100 text-violet-700 border-violet-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-600 border-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  const s = status as Status;
  const cfg = config[s] ?? { label: status, variant: "outline" };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${colorClass[s] ?? ""}`}
    >
      {cfg.label}
    </Badge>
  );
}
