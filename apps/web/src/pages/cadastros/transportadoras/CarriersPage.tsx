import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCarriers } from "./useCarriers";
import { CarriersToolbar } from "./components/CarriersToolbar";
import { CarriersTable } from "./components/CarriersTable";
import { CarriersDialog } from "./components/CarriersDialog";

export default function CarriersPage() {
  const vm = useCarriers();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transportadoras</CardTitle>
        <CardDescription>
          Cadastros → Transportadoras
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <CarriersToolbar
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
            Nenhuma transportadora encontrada.
          </div>
        ) : (
          <CarriersTable
            rows={vm.filtered}
            onEdit={vm.openEdit}
            onDelete={vm.remove}
          />
        )}

        <CarriersDialog
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