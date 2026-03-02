// apps/web/src/app/menu.config.ts

export type MenuItem = {
  key: string;
  label: string;
  path: string;
  module?: string; 
  perm?: string;    
  children?: MenuItem[];
};

export const MENU_CONFIG: MenuItem[] = [
  { key: "home", label: "Home", path: "/dashboard" },

  {
    key: "commercial",
    label: "Comercial",
    path: "/comercial",
    children: [
      { key: "quotes", label: "Orçamentos", path: "/comercial/orcamentos", perm: "quotes.read" },
      { key: "orders", label: "Pedidos", path: "/comercial/pedidos", perm: "orders.read" },
      { key: "sales", label: "Vendas", path: "/comercial/vendas", perm: "sales.read" },
      { key: "shipments", label: "Expedição", path: "/comercial/expedicao", perm: "shipments.read" },
      { key: "returns", label: "Devoluções", path: "/comercial/devolucoes", perm: "returns.read" },
    ],
  },

  {
    key: "finance",
    label: "Financeiro",
    path: "/finance",
    children: [
      { key: "receivables", label: "Contas a receber", path: "/finance/receivables", perm: "receivables.read" },
      { key: "payables", label: "Contas a pagar", path: "/finance/payables", perm: "payables.read" },
      { key: "cashflow", label: "Fluxo de caixa", path: "/finance/cashflow", perm: "cashflow.read" },
      { key: "conciliacao", label: "Conciliação", path: "/finance/reconciliation", perm: "reconciliation.read" },
      { key: "payments", label: "Pagamentos", path: "/finance/payments", perm: "payments.read" },
    ],
  },

  {
    key: "fiscal",
    label: "Fiscal",
    path: "/fiscal",
    children: [
      { key: "fiscal_docs", label: "Documentos", path: "/fiscal/documents", perm: "fiscal_docs.read" },
      { key: "nfe", label: "NF-e", path: "/fiscal/nfe", perm: "nfe.read" },
      { key: "nfse", label: "NFS-e", path: "/fiscal/nfse", perm: "nfse.read" },
      { key: "tax_rules", label: "Regras/Tributos", path: "/fiscal/tax-rules", perm: "tax_rules.read" },
      { key: "tax_profiles", label: "Perfis fiscais", path: "/fiscal/tax-profiles", perm: "tax_profiles.read" },
    ],
  },

  {
    key: "inventory",
    label: "Estoque",
    path: "/inventory",
    children: [
      { key: "inventory_stock", label: "Saldo atual", path: "/inventory", perm: "inventory.read" },
      { key: "inventory_movs", label: "Movimentações", path: "/inventory/movements", perm: "inventory_movements.read" },
      { key: "inventory_counts", label: "Inventário", path: "/inventory/counts", perm: "inventory_counts.read" },
      { key: "inventory_locations", label: "Locais/Depósitos", path: "/inventory/locations", perm: "inventory_locations.read" },
    ],
  },

  {
    key: "cadastros",
    label: "Cadastros",
    path: "/cadastros",
    children: [
      { key: "companies", label: "Empresas", path: "/cadastros/empresa", perm: "companies.read" },
      { key: "suppliers", label: "Fornecedores", path: "/cadastros/fornecedores", perm: "suppliers.read" },
      { key: "customers", label: "Clientes", path: "/cadastros/clientes", perm: "customers.read" },
      { key: "products", label: "Produtos", path: "/cadastros/produtos", perm: "products.read" },
      { key: "fiscal_registry", label: "CFOP & NCM", path: "/cadastros/fiscal", perm: "fiscal_cfop.read" },
      { key: "services", label: "Serviços", path: "/cadastros/servicos", perm: "services.read" },
      { key: "bank_accounts", label: "Contas Bancárias", path: "/cadastros/contas-bancarias", perm: "bank_accounts.read" },
      { key: "payment_methods", label: "Meios de pagamento", path: "/cadastros/meios-pagamento", perm: "payment_methods.read" },
      { key: "payment_terms", label: "Condições", path: "/cadastros/condicoes", perm: "payment_terms.read" },
    ],
  },

  {
    key: "reports",
    label: "Relatórios",
    path: "/reports",
    children: [
      { key: "reports_sales", label: "Vendas", path: "/reports/sales", perm: "reports_sales.read" },
      { key: "reports_finance", label: "Financeiro", path: "/reports/finance", perm: "reports_finance.read" },
      { key: "reports_inventory", label: "Estoque", path: "/reports/inventory", perm: "reports_inventory.read" },
      { key: "reports_fiscal", label: "Fiscal", path: "/reports/fiscal", perm: "reports_fiscal.read" },
    ],
  },

  {
    key: "admin",
    label: "Administração",
    path: "/admin",
    children: [
      { key: "users", label: "Usuários", path: "/admin/users", perm: "users.read" },
      { key: "roles", label: "Perfis & Permissões", path: "/admin/roles", perm: "roles.read" },
      { key: "settings", label: "Configurações", path: "/admin/settings", perm: "company_modules.read" },
      { key: "audit", label: "Auditoria", path: "/admin/audit", perm: "audit.read" },
    ],
  },
];