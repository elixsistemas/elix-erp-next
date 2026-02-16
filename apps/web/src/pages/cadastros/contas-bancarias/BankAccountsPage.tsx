// BankAccountsPage.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBankAccounts } from "./useBankAccounts";
import { BankAccountsToolbar } from "./components/BankAccountsToolbar";
import { BankAccountsTable } from "./components/BankAccountsTable";
import { BankAccountDialog } from "./components/BankAccountDialog";

export default function BankAccountsPage() {
  const vm = useBankAccounts();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contas Bancárias</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Cadastros → Contas Bancárias</p>
      </div>

      <Card className="border-none shadow-lg">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Lista</CardTitle>
            <CardDescription>Crie e edite contas bancárias da empresa logada.</CardDescription>
          </div>

          <BankAccountsToolbar
            q={vm.q}
            setQ={vm.setQ}
            loading={vm.loading}
            onRefresh={vm.load}
            onCreate={vm.openCreate}
          />
        </CardHeader>

        <CardContent className="p-6">
          {vm.loading ? (
            <div className="py-10 text-center text-slate-500 dark:text-slate-400">Carregando...</div>
          ) : vm.filtered.length === 0 ? (
            <div className="py-10 text-center text-slate-500 dark:text-slate-400">Nenhuma conta encontrada.</div>
          ) : (
            <BankAccountsTable rows={vm.filtered} onEdit={vm.openEdit} onDeactivate={vm.deactivate} />
          )}
        </CardContent>
      </Card>

      <BankAccountDialog
        open={vm.open}
        onOpenChange={vm.setOpen}
        editing={vm.editing}
        saving={vm.saving}
        form={vm.form}
        setForm={(fn) => vm.setForm(fn)}
        onSave={vm.save}
      />
    </div>
  );
}
