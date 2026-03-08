import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePaymentMethods } from "./usePaymentMethods";
import { PaymentMethodsToolbar } from "./components/PaymentMethodsToolbar";
import { PaymentMethodsTable } from "./components/PaymentMethodsTable";
import { PaymentMethodDialog } from "./components/PaymentMethodDialog";

export default function PaymentMethodsPage() {
  const vm = usePaymentMethods();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meios de pagamento</CardTitle>
        <CardDescription>
          Cadastros → Meios de pagamento
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <PaymentMethodsToolbar
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
            Nenhum meio de pagamento encontrado.
          </div>
        ) : (
          <PaymentMethodsTable
            rows={vm.filtered}
            onEdit={vm.openEdit}
            onDeactivate={vm.deactivate}
            onActivate={vm.activate}
          />
        )}

        <PaymentMethodDialog
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