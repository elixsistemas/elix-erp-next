import * as React from "react";
import { getQuote } from "./quotes.service";
import type { QuoteDetails } from "./quotes.types";

export function useQuoteDetails(quoteId: number) {
  const [data, setData] = React.useState<QuoteDetails | null>(null);
  const [loading, setLoading] = React.useState(false);

  const reload = React.useCallback(async () => {
    if (!Number.isFinite(quoteId) || quoteId <= 0) return;
    setLoading(true);
    try {
      const d = await getQuote(quoteId);
      setData(d);
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, reload };
}
