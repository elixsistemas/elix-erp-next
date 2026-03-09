// apps/web/src/app/menu.config.ts
export type MenuItem = {
  key: string;
  label: string;
  path: string;
  module?: string;
  perm?: string;
  end?: boolean;
  children?: MenuItem[];
};

export const MENU_CONFIG: MenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    module: "core.dashboard",
  },

  {
    key: "commercial",
    label: "Comercial",
    path: "/comercial",
    children: [
      {
        key: "quotes",
        label: "Orçamentos",
        path: "/comercial/orcamentos",
        module: "commercial.quotes",
        perm: "quotes.read",
      },
      {
        key: "orders",
        label: "Pedidos",
        path: "/comercial/pedidos",
        module: "commercial.orders",
        perm: "orders.read",
      },
      {
        key: "sales",
        label: "Vendas",
        path: "/comercial/vendas",
        module: "commercial.sales",
        perm: "sales.read",
      },
      {
        key: "shipments",
        label: "Expedição",
        path: "/comercial/expedicao",
        module: "commercial.shipments",
        perm: "shipments.read",
      },
      {
        key: "returns",
        label: "Devoluções",
        path: "/comercial/devolucoes",
        module: "commercial.returns",
        perm: "returns.read",
      },
    ],
  },

  {
    key: "inventory",
    label: "Estoque",
    path: "/inventory",
    children: [
      {
        key: "inventory_stock",
        label: "Saldo atual",
        path: "/inventory",
        module: "inventory.stock",
        perm: "inventory.read",
      },
      {
        key: "inventory_movs",
        label: "Movimentações",
        path: "/inventory/movements",
        module: "inventory.movements",
        perm: "inventory_movements.read",
      },
      {
        key: "inventory_counts",
        label: "Inventário",
        path: "/inventory/counts",
        module: "inventory.counts",
        perm: "inventory_counts.read",
      },
      {
        key: "inventory_locations",
        label: "Locais/Depósitos",
        path: "/inventory/locations",
        module: "inventory.locations",
        perm: "inventory_locations.read",
      },
      {
        key: "inventory_products_shortcut",
        label: "Produtos (atalho)",
        path: "/cadastros/produtos",
        module: "cadastros.products",
        perm: "products.read",
      },
    ],
  },

  {
    key: "finance",
    label: "Financeiro",
    path: "/finance",
    children: [
      {
        key: "chart_of_accounts",
        label: "Plano de Contas",
        path: "/financeiro/plano-contas",
        module: "finance.chart_of_accounts",
        perm: "chart_of_accounts.read",
      },
      {
        key: "receivables",
        label: "Contas a receber",
        path: "/finance/receivables",
        module: "finance.receivables",
        perm: "receivables.read",
      },
      {
        key: "payables",
        label: "Contas a pagar",
        path: "/finance/payables",
        module: "finance.payables",
        perm: "payables.read",
      },
      {
        key: "cashflow",
        label: "Fluxo de caixa",
        path: "/finance/cashflow",
        module: "finance.cashflow",
        perm: "cashflow.read",
      },
      {
        key: "reconciliation",
        label: "Conciliação",
        path: "/finance/reconciliation",
        module: "finance.reconciliation",
        perm: "reconciliation.read",
      },
      {
        key: "payments",
        label: "Pagamentos",
        path: "/finance/payments",
        module: "finance.payments",
        perm: "payments.read",
      },
    ],
  },

  {
    key: "fiscal",
    label: "Fiscal",
    path: "/fiscal",
    children: [
      {
        key: "fiscal_docs",
        label: "Documentos",
        path: "/fiscal/documents",
        module: "fiscal.documents",
        perm: "fiscal_docs.read",
      },
      {
        key: "nfe",
        label: "NF-e",
        path: "/fiscal/nfe",
        module: "fiscal.nfe",
        perm: "nfe.read",
      },
      {
        key: "nfse",
        label: "NFS-e",
        path: "/fiscal/nfse",
        module: "fiscal.nfse",
        perm: "nfse.read",
      },
      {
        key: "tax_rules",
        label: "Regras/Tributos",
        path: "/fiscal/tax-rules",
        module: "fiscal.rules",
        perm: "tax_rules.read",
      },
      {
        key: "tax_profiles",
        label: "Perfis fiscais",
        path: "/fiscal/tax-profiles",
        module: "fiscal.tax_profiles",
        perm: "tax_profiles.read",
      },
    ],
  },

  {
    key: "registry",
    label: "Cadastros",
    path: "/cadastros",
    children: [
      {
        key: "companies",
        label: "Empresas",
        path: "/cadastros/empresa",
        module: "cadastros.companies",
        perm: "companies.read",
      },
      {
        key: "customers",
        label: "Clientes",
        path: "/cadastros/clientes",
        module: "cadastros.customers",
        perm: "customers.read",
      },
      {
        key: "suppliers",
        label: "Fornecedores",
        path: "/cadastros/fornecedores",
        module: "cadastros.suppliers",
        perm: "suppliers.read",
      },
      {
        key: "carriers",
        label: "Transportadoras",
        path: "/cadastros/transportadoras",
        module: "cadastros.carriers",
        perm: "carriers.read",
        end: true,
      },  
      {
        key: "carrier_vehicles",
        label: "Veículos de transportadoras",
        path: "/cadastros/transportadoras/veiculos",
        module: "cadastros.carriers",
        perm: "carrier_vehicles.read",
        end: true,
      },
      {
        key: "products",
        label: "Produtos",
        path: "/cadastros/produtos",
        module: "cadastros.products",
        perm: "products.read",
      },
      {
        key: "services",
        label: "Serviços",
        path: "/cadastros/servicos",
        module: "cadastros.services",
        perm: "services.read",
      },
      {
        key: "fiscal_registry",
        label: "Base Fiscal",
        path: "/cadastros/fiscal",
        module: "cadastros.fiscal_registry",
        perm: "fiscal_cfop.read",
      },
      {
        key: "bank_accounts",
        label: "Contas Bancárias",
        path: "/cadastros/contas-bancarias",
        module: "cadastros.bank_accounts",
        perm: "bank_accounts.read",
      },
      {
        key: "payment_methods",
        label: "Meios de pagamento",
        path: "/cadastros/meios-pagamento",
        module: "cadastros.payment_methods",
        perm: "payment_methods.read",
      },
      {
        key: "payment_terms",
        label: "Condições",
        path: "/cadastros/condicoes",
        module: "cadastros.payment_terms",
        perm: "payment_terms.read",
      },
    ],
  },

  {
    key: "reports",
    label: "Relatórios",
    path: "/reports",
    children: [
      {
        key: "reports_sales",
        label: "Vendas",
        path: "/reports/sales",
        module: "reports.sales",
        perm: "reports_sales.read",
      },
      {
        key: "reports_finance",
        label: "Financeiro",
        path: "/reports/finance",
        module: "reports.finance",
        perm: "reports_finance.read",
      },
      {
        key: "reports_inventory",
        label: "Estoque",
        path: "/reports/inventory",
        module: "reports.inventory",
        perm: "reports_inventory.read",
      },
      {
        key: "reports_fiscal",
        label: "Fiscal",
        path: "/reports/fiscal",
        module: "reports.fiscal",
        perm: "reports_fiscal.read",
      },
    ],
  },

  {
    key: "security",
    label: "Segurança",
    path: "/security",
    children: [
      {
        key: "admin_company",
        label: "Empresa",
        path: "/settings/company",
        module: "cadastros.companies",
        perm: "companies.read",
      },
      {
        key: "admin_modules",
        label: "Módulos",
        path: "/settings/modules",
        module: "admin.settings",
        perm: "company_modules.read",
      },
      {
        key: "admin_license",
        label: "Licença",
        path: "/settings/license",
        module: "admin.settings",
        perm: "companies.read",
      },
      {
        key: "users",
        label: "Usuários",
        path: "/security/users",
        module: "admin.users",
        perm: "users.read",
      },
      {
        key: "roles",
        label: "Perfis & Permissões",
        path: "/security/roles",
        module: "admin.roles",
        perm: "roles.read",
      },
      {
        key: "audit",
        label: "Auditoria",
        path: "/security/audit",
        module: "admin.audit",
        perm: "audit.read",
      },
      {
        key: "admin_branding",
        label: "Identidade visual",
        path: "/settings/branding",
        module: "admin.settings",
        perm: "branding.read",
      },
      {
        key: "admin_integrations",
        label: "Integrações",
        path: "/settings/integrations",
        module: "admin.settings",
        perm: "companies.read",
      },
    ],
  },
];