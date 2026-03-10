import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  createAccountsPayable,
  getAccountsPayableById,
  listBankAccountsMini,
  listChartAccountsMini,
  listCostCentersMini,
  listPaymentTermsMini,
  listPaymentMethodsMini,
  listSuppliersMini,
  updateAccountsPayable,
} from "./accounts-payable.service";
import type {
  BankAccountMini,
  ChartAccountMini,
  CostCenterMini,
  PaymentConditionMini,
  PaymentMethodMini,
  SupplierMini,
} from "./accounts-payable.types";

type FormState = {
  supplierId: string;
  documentNumber: string;
  issueDate: string;
  dueDate: string;
  competenceDate: string;
  description: string;
  amount: string;
  paymentConditionId: string;
  paymentMethodId: string;
  bankAccountId: string;
  chartAccountId: string;
  costCenterId: string;
  installmentNo: string;
  installmentCount: string;
  notes: string;
};

const initialState: FormState = {
  supplierId: "",
  documentNumber: "",
  issueDate: "",
  dueDate: "",
  competenceDate: "",
  description: "",
  amount: "",
  paymentConditionId: "",
  paymentMethodId: "",
  bankAccountId: "",
  chartAccountId: "",
  costCenterId: "",
  installmentNo: "",
  installmentCount: "",
  notes: "",
};

export default function AccountsPayableFormPage() {
  const navigate = useNavigate();
  const params = useParams();
  const editing = Boolean(params.id);

  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);

  const [suppliers, setSuppliers] = useState<SupplierMini[]>([]);
  const [paymentConditions, setPaymentConditions] = useState<PaymentConditionMini[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodMini[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountMini[]>([]);
  const [chartAccounts, setChartAccounts] = useState<ChartAccountMini[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterMini[]>([]);

  useEffect(() => {
    void Promise.all([
      listSuppliersMini(),
      listPaymentTermsMini(),
      listPaymentMethodsMini(),
      listBankAccountsMini(),
      listChartAccountsMini(),
      listCostCentersMini(),
    ]).then(([a, b, c, d, e, f]) => {
      setSuppliers(a);
      setPaymentConditions(b);
      setPaymentMethods(c);
      setBankAccounts(d);
      setChartAccounts(e);
      setCostCenters(f);
    });
  }, []);

  useEffect(() => {
    if (!editing || !params.id) return;

    void getAccountsPayableById(Number(params.id)).then((row) => {
      setForm({
        supplierId: String(row.supplier_id),
        documentNumber: row.document_number ?? "",
        issueDate: row.issue_date,
        dueDate: row.due_date,
        competenceDate: row.competence_date ?? "",
        description: row.description,
        amount: String(row.amount),
        paymentConditionId: row.payment_term_id ? String(row.payment_term_id) : "",
        paymentMethodId: row.payment_method_id ? String(row.payment_method_id) : "",
        bankAccountId: row.bank_account_id ? String(row.bank_account_id) : "",
        chartAccountId: row.chart_account_id ? String(row.chart_account_id) : "",
        costCenterId: row.cost_center_id ? String(row.cost_center_id) : "",
        installmentNo: row.installment_no ? String(row.installment_no) : "",
        installmentCount: row.installment_count ? String(row.installment_count) : "",
        notes: row.notes ?? "",
      });
    });
  }, [editing, params.id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        supplierId: Number(form.supplierId),
        documentNumber: form.documentNumber || null,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        competenceDate: form.competenceDate || null,
        description: form.description,
        amount: Number(form.amount),
        paymentConditionId: form.paymentConditionId ? Number(form.paymentConditionId) : null,
        paymentMethodId: form.paymentMethodId ? Number(form.paymentMethodId) : null,
        bankAccountId: form.bankAccountId ? Number(form.bankAccountId) : null,
        chartAccountId: form.chartAccountId ? Number(form.chartAccountId) : null,
        costCenterId: form.costCenterId ? Number(form.costCenterId) : null,
        installmentNo: form.installmentNo ? Number(form.installmentNo) : null,
        installmentCount: form.installmentCount ? Number(form.installmentCount) : null,
        notes: form.notes || null,
      };

      if (editing && params.id) {
        await updateAccountsPayable(Number(params.id), payload);
      } else {
        await createAccountsPayable(payload);
      }

      navigate("/financeiro/contas-pagar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {editing ? "Editar conta a pagar" : "Nova conta a pagar"}
        </h1>
      </div>

      <form className="grid gap-4 rounded-xl border p-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <select
            className="h-10 rounded-md border px-3"
            value={form.supplierId}
            onChange={(e) => setForm((s) => ({ ...s, supplierId: e.target.value }))}
            required
          >
            <option value="">Selecione o fornecedor</option>
            {suppliers.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>

          <input
            className="h-10 rounded-md border px-3"
            placeholder="Número do documento"
            value={form.documentNumber}
            onChange={(e) => setForm((s) => ({ ...s, documentNumber: e.target.value }))}
          />

          <input
            className="h-10 rounded-md border px-3"
            type="number"
            step="0.01"
            placeholder="Valor"
            value={form.amount}
            onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
            required
          />

          <input
            className="h-10 rounded-md border px-3"
            type="date"
            value={form.issueDate}
            onChange={(e) => setForm((s) => ({ ...s, issueDate: e.target.value }))}
            required
          />

          <input
            className="h-10 rounded-md border px-3"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((s) => ({ ...s, dueDate: e.target.value }))}
            required
          />

          <input
            className="h-10 rounded-md border px-3"
            type="date"
            value={form.competenceDate}
            onChange={(e) => setForm((s) => ({ ...s, competenceDate: e.target.value }))}
          />

          <input
            className="h-10 rounded-md border px-3 md:col-span-2 lg:col-span-3"
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            required
          />

          <select
            className="h-10 rounded-md border px-3"
            value={form.paymentConditionId}
            onChange={(e) => setForm((s) => ({ ...s, paymentConditionId: e.target.value }))}
          >
            <option value="">Condição de pagamento</option>
            {paymentConditions.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-md border px-3"
            value={form.paymentMethodId}
            onChange={(e) => setForm((s) => ({ ...s, paymentMethodId: e.target.value }))}
          >
            <option value="">Meio de pagamento</option>
            {paymentMethods.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-md border px-3"
            value={form.bankAccountId}
            onChange={(e) => setForm((s) => ({ ...s, bankAccountId: e.target.value }))}
          >
            <option value="">Conta bancária</option>
            {bankAccounts.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-md border px-3"
            value={form.chartAccountId}
            onChange={(e) => setForm((s) => ({ ...s, chartAccountId: e.target.value }))}
          >
            <option value="">Plano de contas</option>
            {chartAccounts.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-md border px-3"
            value={form.costCenterId}
            onChange={(e) => setForm((s) => ({ ...s, costCenterId: e.target.value }))}
          >
            <option value="">Centro de custo</option>
            {costCenters.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>

          <input
            className="h-10 rounded-md border px-3"
            type="number"
            placeholder="Parcela nº"
            value={form.installmentNo}
            onChange={(e) => setForm((s) => ({ ...s, installmentNo: e.target.value }))}
          />

          <input
            className="h-10 rounded-md border px-3"
            type="number"
            placeholder="Total parcelas"
            value={form.installmentCount}
            onChange={(e) => setForm((s) => ({ ...s, installmentCount: e.target.value }))}
          />
        </div>

        <textarea
          className="min-h-[120px] rounded-md border px-3 py-2"
          placeholder="Observações"
          value={form.notes}
          onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
        />

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>

          <Button type="button" variant="outline" onClick={() => navigate("/financeiro/contas-pagar")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}