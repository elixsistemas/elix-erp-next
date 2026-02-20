import * as React from "react";
import { listQuotes } from "./quotes.service";
import type { QuoteRow, QuoteStatus } from "./quotes.types";

export function useQuotesList() {
  const [rows, setRows] = React.useState<QuoteRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [status, setStatus] = React.useState<QuoteStatus | "ALL">("ALL");
  const [customerId, setCustomerId] = React.useState<number | "">("");

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listQuotes({
        from: from || undefined,
        to: to || undefined,
        status: status === "ALL" ? undefined : status,
        customerId: customerId === "" ? undefined : Number(customerId),
      });
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [from, to, status, customerId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return { rows, loading, reload, from, setFrom, to, setTo, status, setStatus, customerId, setCustomerId };
}
