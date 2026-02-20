import * as React from "react";
import { toast } from "sonner";
import { getQuote } from "./quotes.service";
import type { QuoteDetails } from "./quotes.types";

export function useQuoteDetails(id: number) {
  const [data, setData] = React.useState<QuoteDetails | null>(null);
  const [loading, setLoading] = React.useState(false);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const d = await getQuote(id);
      setData(d);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao carregar orçamento");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, reload };
}
