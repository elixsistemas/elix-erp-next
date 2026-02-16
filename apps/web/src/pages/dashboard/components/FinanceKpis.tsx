// components/FinanceKpis.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowDownCircle, ArrowUpCircle, TrendingUp } from "lucide-react";
import { formatBRL } from "../dashboard.utils";

export function FinanceKpis(props: {
  totalBalance: number;
  inflowMonth: number;
  outflowMonth: number;
  netMonth: number;
}) {
  const { totalBalance, inflowMonth, outflowMonth, netMonth } = props;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Saldo Total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatBRL(totalBalance)}</div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
            Entradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-700">
            {formatBRL(inflowMonth)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5 text-rose-600" />
            Saídas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-rose-700">
            {formatBRL(outflowMonth)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resultado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${netMonth >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {formatBRL(netMonth)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
