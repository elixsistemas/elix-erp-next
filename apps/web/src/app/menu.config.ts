// apps/web/src/app/menu.config.ts

export type MenuItem = {
  key: string;       // chave do módulo/feature
  label: string;
  path: string;
  children?: MenuItem[];
};

export const MENU_CONFIG: MenuItem[] = [
  { key: "home", label: "Home", path: "/dashboard" }, // recomendo padronizar /dashboard

  { key: "finance", label: "Financeiro", path: "/finance" },
  { key: "sales", label: "Vendas", path: "/sales" },
  //{ key: "inventory", label: "Estoque", path: "/inventory" },
  // ✅ Estoque (grupo)
  {
    key: "inventory",
    label: "Estoque",
    path: "/inventory",
    children: [
      { key: "inventory_stock", label: "Saldo atual", path: "/inventory" },
      { key: "inventory_movs", label: "Movimentações", path: "/inventory/movements" },
    ],
  },
  // ✅ Cadastros (grupo)
  {
    key: "cadastros",
    label: "Cadastros",
    path: "/cadastros",
    children: [
      { key: "companies", label: "Empresas", path: "/cadastros/empresas" },
      { key: "customers", label: "Clientes", path: "/cadastros/clientes" },
      { key: "products", label: "Produtos", path: "/cadastros/produtos" },
      { key: "bank_accounts", label: "Contas Bancárias", path: "/cadastros/contas-bancarias" },
    ],
  },

  // futuro
  { key: "fiscal", label: "Fiscal", path: "/fiscal" },
  { key: "reports", label: "Relatórios", path: "/reports" },
  { key: "admin", label: "Administração", path: "/admin" },
];
