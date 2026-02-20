// apps/web/src/app/menu.config.ts

export type MenuItem = {
  key: string;
  label: string;
  path: string;
  children?: MenuItem[];
};

export const MENU_CONFIG: MenuItem[] = [
  { key: "home", label: "Home", path: "/dashboard" },

  // ✅ Comercial (ciclo completo)
  {
    key: "commercial",
    label: "Comercial",
    path: "/comercial",
    children: [
      { key: "quotes", label: "Orçamentos", path: "/comercial/orcamentos" },
      { key: "orders", label: "Pedidos", path: "/comercial/pedidos" },
      { key: "sales", label: "Vendas", path: "/comercial/vendas" },
      { key: "shipments", label: "Expedição", path: "/comercial/expedicao" },
      { key: "returns", label: "Devoluções", path: "/comercial/devolucoes" },
    ],
  },

  // ✅ Financeiro (controle de caixa e competência)
  {
    key: "finance",
    label: "Financeiro",
    path: "/finance",
    children: [
      { key: "receivables", label: "Contas a receber", path: "/finance/receivables" },
      { key: "payables", label: "Contas a pagar", path: "/finance/payables" },
      { key: "cashflow", label: "Fluxo de caixa", path: "/finance/cashflow" },
      { key: "conciliacao", label: "Conciliação", path: "/finance/reconciliation" },
      { key: "payments", label: "Pagamentos", path: "/finance/payments" },
    ],
  },

  // ✅ Fiscal (NF-e / NFS-e / regras)
  {
    key: "fiscal",
    label: "Fiscal",
    path: "/fiscal",
    children: [
      { key: "fiscal_docs", label: "Documentos", path: "/fiscal/documents" },
      { key: "nfe", label: "NF-e", path: "/fiscal/nfe" },
      { key: "nfse", label: "NFS-e", path: "/fiscal/nfse" },
      { key: "tax_rules", label: "Regras/Tributos", path: "/fiscal/tax-rules" },
      { key: "tax_profiles", label: "Perfis fiscais", path: "/fiscal/tax-profiles" },
    ],
  },

  // ✅ Estoque
  {
    key: "inventory",
    label: "Estoque",
    path: "/inventory",
    children: [
      { key: "inventory_stock", label: "Saldo atual", path: "/inventory" },
      { key: "inventory_movs", label: "Movimentações", path: "/inventory/movements" },
      // futuro
      { key: "inventory_counts", label: "Inventário", path: "/inventory/counts" },
      { key: "inventory_locations", label: "Locais/Depósitos", path: "/inventory/locations" },
    ],
  },

  // ✅ Cadastros
  {
    key: "cadastros",
    label: "Cadastros",
    path: "/cadastros",
    children: [
      { key: "companies", label: "Empresas", path: "/cadastros/empresa" },
      { key: "suppliers", label: "Fornecedores", path: "/cadastros/fornecedores" },
      { key: "customers", label: "Clientes", path: "/cadastros/clientes" },
      { key: "products", label: "Produtos", path: "/cadastros/produtos" },
      { key: "services", label: "Serviços", path: "/cadastros/servicos" }, // (pode ser o mesmo cadastro com kind=service)
      { key: "bank_accounts", label: "Contas Bancárias", path: "/cadastros/contas-bancarias" },
      // futuro
      { key: "payment_methods", label: "Meios de pagamento", path: "/cadastros/meios-pagamento" },
      { key: "payment_terms", label: "Condições", path: "/cadastros/condicoes" },
    ],
  },

  // ✅ Relatórios
  {
    key: "reports",
    label: "Relatórios",
    path: "/reports",
    children: [
      { key: "reports_sales", label: "Vendas", path: "/reports/sales" },
      { key: "reports_finance", label: "Financeiro", path: "/reports/finance" },
      { key: "reports_inventory", label: "Estoque", path: "/reports/inventory" },
      { key: "reports_fiscal", label: "Fiscal", path: "/reports/fiscal" },
    ],
  },

  // ✅ Admin
  {
    key: "admin",
    label: "Administração",
    path: "/admin",
    children: [
      { key: "users", label: "Usuários", path: "/admin/users" },
      { key: "roles", label: "Perfis & Permissões", path: "/admin/roles" },
      { key: "settings", label: "Configurações", path: "/admin/settings" },
      { key: "audit", label: "Auditoria", path: "/admin/audit" },
    ],
  },
];
