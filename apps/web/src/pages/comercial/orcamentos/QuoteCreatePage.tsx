import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { QuoteDetailsEditor } from "./QuoteDetailsPage";
import { createQuote } from "./quotes.service";

export default function QuoteCreatePage() {
  const nav = useNavigate();

  return (
    <QuoteDetailsEditor
      mode="create"
      initial={null}
      onSave={async (payload) => {
        const created = await createQuote(payload);
        toast.success("Orçamento criado");
        nav(`/comercial/orcamentos/${created.quote.id}`);
      }}
    />
  );
}
