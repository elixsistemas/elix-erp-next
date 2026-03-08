import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaymentTerms } from "./usePaymentTerms";
import { PaymentTermsToolbar } from "./components/PaymentTermsToolbar";
import { PaymentTermsTable } from "./components/PaymentTermsTable";
import { PaymentTermDialog } from "./components/PaymentTermDialog";

export default function PaymentTermsPage() {
  const vm = usePaymentTerms();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Condições de pagamento</CardTitle>
        <CardDescription>
          Cadastros → Condições de pagamento
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <PaymentTermsToolbar
          q={vm.q}
          setQ={vm.setQ}
          statusFilter={vm.statusFilter}
          setStatusFilter={vm.setStatusFilter}
          loading={vm.loading}
          onRefresh={vm.load}
          onCreate={vm.openCreate}
        />

        {vm.loading ? (
          <div className="text-sm text-muted-foreground">Carregando...</div>
        ) : vm.filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Nenhuma condição de pagamento encontrada.
          </div>
        ) : (
          <PaymentTermsTable rows={vm.filtered} onEdit={vm.openEdit} />
        )}

        <PaymentTermDialog
          open={vm.open}
          onOpenChange={vm.setOpen}
          editing={vm.editing}
          saving={vm.saving}
          form={vm.form}
          setForm={vm.setForm}
          onSave={vm.save}
        />
      </CardContent>
    </Card>
  );
}