// DashboardPage.tsx
import { useDashboardFinance } from "./useDashboardFinance";
import { currentYYYYMM, monthLabel } from "./dashboard.utils";
import { DashboardHeader } from "./components/DashboardHeader";
import { MonthPicker } from "./components/MonthPicker";
import { FinanceKpis } from "./components/FinanceKpis";
import { AccountsTable } from "./components/AccountsTable";

export default function DashboardPage() {
  const vm = useDashboardFinance();

  return (
    <div className="space-y-8">
      <DashboardHeader
        firstName={vm.firstName}
        subtitle={`Visão financeira consolidada — ${monthLabel(vm.month)}`}
      />

      <MonthPicker
        month={vm.month}
        onChange={vm.setMonth}
        onNow={() => vm.setMonth(currentYYYYMM())}
        disabled={vm.loading || !vm.canViewFinance}
      />

      {vm.canViewFinance ? (
        <>
          <FinanceKpis
            totalBalance={vm.totalBalance}
            inflowMonth={vm.inflowMonth}
            outflowMonth={vm.outflowMonth}
            netMonth={vm.netMonth}
          />
          <AccountsTable accounts={vm.accounts} totalBalance={vm.totalBalance} />
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Você não tem permissão para visualizar o painel financeiro nesta empresa.
        </div>
      )}
    </div>
  );
}