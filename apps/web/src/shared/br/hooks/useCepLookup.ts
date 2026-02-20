import * as React from "react";
import { onlyDigits } from "../digits";
import { fetchAddressByCep } from "../services/viacep";
import { useDebouncedValue } from "./useDebouncedValue";

export function useCepLookup(cepValue: string) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<any>(null);

  const cepDigits = onlyDigits(cepValue);
  const debounced = useDebouncedValue(cepDigits, 350);

  React.useEffect(() => {
    let alive = true;
    async function run() {
      setError(null);
      setData(null);

      if (debounced.length !== 8) return;

      setLoading(true);
      try {
        const res = await fetchAddressByCep(debounced);
        if (!alive) return;
        setData(res);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Falha ao consultar CEP");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [debounced]);

  return { loading, error, data };
}
