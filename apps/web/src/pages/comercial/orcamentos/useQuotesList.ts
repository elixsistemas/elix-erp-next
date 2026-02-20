import * as React from "react";
import { toast } from "sonner";
import type { QuoteListQuery, QuoteListRow, QuoteStatus } from "./quotes.types";
import { listQuotes } from "./quotes.service";

export function useQuotesList() {
  const [rows, setRows] = React.useState<QuoteListRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<QuoteStatus | "all">("all");
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const query: QuoteListQuery = {
        q: q.trim() ? q.trim() : undefined,
        status: status === "all" ? undefined : status,
        from: from || undefined,
        to: to || undefined,
        limit: 50,
      };
      const data = await listQuotes(query);
      setRows(data);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao listar orçamentos");
    } finally {
      setLoading(false);
    }
  }, [q, status, from, to]);

  React.useEffect(() => {
    const t = setTimeout(() => void reload(), 350);
    return () => clearTimeout(t);
  }, [q, status, from, to, reload]);

  return { rows, loading, q, setQ, status, setStatus, from, setFrom, to, setTo, reload };
}
