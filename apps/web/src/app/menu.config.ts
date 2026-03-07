// apps/web/src/app/menu.config.ts

export type MenuItem = {
  key: string;
  label: string;
  path: string;

  /** Feature gate (módulo/plug-in do SaaS). Ex: "fiscal", "nfe", "wms" */
  module?: string;

  /** RBAC permission code. Ex: "products.read" */
  perm?: string;

  children?: MenuItem[];
};

export const MENU_CONFIG: MenuItem[] = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard" },

  // --- Operações / Comercial ---
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

  // --- Estoque ---
  {
    key: "inventory",
    label: "Estoque",
    path: "/inventory",
    children: [
      { key: "inventory_stock", label: "Saldo atual", path: "/inventory", perm: "inventory.read" },
      { key: "inventory_movs", label: "Movimentações", path: "/inventory/movements", perm: "inventory_movements.read" },
      { key: "inventory_counts", label: "Inventário", path: "/inventory/counts", perm: "inventory_counts.read" },
      { key: "inventory_locations", label: "Locais/Depósitos", path: "/inventory/locations", perm: "inventory_locations.read" },

      // Atalho proposital para o usuário de estoque
      { key: "inventory_products_shortcut", label: "Produtos (atalho)", path: "/cadastros/produtos", perm: "products.read" },
    ],
  },

  // --- Financeiro ---
  {
    key: "finance",
    label: "Financeiro",
    path: "/finance",
    children: [
      { key: "receivables", label: "Contas a receber", path: "/finance/receivables", perm: "receivables.read" },
      { key: "payables", label: "Contas a pagar", path: "/finance/payables", perm: "payables.read" },
      { key: "cashflow", label: "Fluxo de caixa", path: "/finance/cashflow", perm: "cashflow.read" },
      { key: "reconciliation", label: "Conciliação", path: "/finance/reconciliation", perm: "reconciliation.read" },
      { key: "payments", label: "Pagamentos", path: "/finance/payments", perm: "payments.read" },
    ],
  },

  // --- Fiscal ---
  {
    key: "fiscal",
    label: "Fiscal",
    path: "/fiscal",
    children: [
      { key: "fiscal_docs", label: "Documentos", path: "/fiscal/documents", perm: "fiscal_docs.read" },

      // estes dois já têm módulo próprio
      { key: "nfe", label: "NF-e", path: "/fiscal/nfe", module: "nfe", perm: "nfe.read" },
      { key: "nfse", label: "NFS-e", path: "/fiscal/nfse", module: "nfse", perm: "nfse.read" },

      { key: "tax_rules", label: "Regras/Tributos", path: "/fiscal/tax-rules", perm: "tax_rules.read" },
      { key: "tax_profiles", label: "Perfis fiscais", path: "/fiscal/tax-profiles", perm: "tax_profiles.read" },
    ],
  },

  // --- Cadastros ---
  {
    key: "registry",
    label: "Cadastros",
    path: "/cadastros",
    children: [
      { key: "companies", label: "Empresas", path: "/cadastros/empresa", perm: "companies.read" },
      { key: "customers", label: "Clientes", path: "/cadastros/clientes", perm: "customers.read" },
      { key: "suppliers", label: "Fornecedores", path: "/cadastros/fornecedores", perm: "suppliers.read" },
      { key: "products", label: "Produtos", path: "/cadastros/produtos", perm: "products.read" },
      { key: "services", label: "Serviços", path: "/cadastros/servicos", perm: "services.read" },

      // Base fiscal depende do módulo fiscal
      { key: "fiscal_registry", label: "Base Fiscal", path: "/cadastros/fiscal", module: "fiscal", perm: "fiscal_cfop.read" },

      { key: "bank_accounts", label: "Contas Bancárias", path: "/cadastros/contas-bancarias", perm: "bank_accounts.read" },
      { key: "payment_methods", label: "Meios de pagamento", path: "/cadastros/meios-pagamento", perm: "payment_methods.read" },
      { key: "payment_terms", label: "Condições", path: "/cadastros/condicoes", perm: "payment_terms.read" },
    ],
  },

  // --- Relatórios ---
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

  // --- Configurações ---
  {
    key: "settings",
    label: "Configurações",
    path: "/settings",
    children: [
      { key: "company_profile", label: "Empresa", path: "/settings/company", perm: "company.read" },
      { key: "branding", label: "Identidade visual", path: "/settings/branding", perm: "branding.write" },
      { key: "system_params", label: "Parâmetros do sistema", path: "/settings/system", perm: "settings.write" },
      { key: "integrations", label: "Integrações", path: "/settings/integrations", perm: "integrations.read" },
    ],
  },

  // --- Segurança ---
  {
    key: "security",
    label: "Segurança",
    path: "/security",
    children: [
      { key: "admin_company", label: "Empresa", path: "/admin/company", perm: "companies.read" },
      { key: "admin_modules", label: "Módulos", path: "/admin/company/modules", perm: "company_modules.read" },
      { key: "admin_license", label: "Licença", path: "/admin/company/license", perm: "companies.read" },

      { key: "users", label: "Usuários", path: "/security/users", perm: "users.read" },
      { key: "roles", label: "Perfis & Permissões", path: "/security/roles", perm: "roles.read" },
      { key: "audit", label: "Auditoria", path: "/security/audit", perm: "audit.read" },

      { key: "admin_branding", label: "Identidade visual", path: "/admin/system/branding", perm: "branding.read" },
      { key: "admin_integrations", label: "Integrações", path: "/admin/system/integrations", perm: "company_modules.read" },
    ],
  },

  // --- Copilot ---
  {
    key: "copilot",
    label: "Copilot",
    path: "/copilot",
    children: [
      { key: "copilot_fiscal", label: "Fiscal Copilot", path: "/copilot/fiscal", perm: "copilot_fiscal.use" },
      { key: "copilot_products", label: "Sugestões p/ Produtos", path: "/copilot/products", perm: "copilot_products.use" },
      { key: "copilot_alerts", label: "Alertas", path: "/copilot/alerts", perm: "copilot_alerts.read" },
    ],
  },
];