
-- =========================================================
-- Elix ERP Next
-- Module Catalog (Official ERP Modules)
-- =========================================================

-- 1) CREATE TABLE modules_catalog
IF OBJECT_ID('dbo.modules_catalog', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.modules_catalog (
    id            INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    module_key    VARCHAR(80) NOT NULL,
    domain        VARCHAR(40) NOT NULL,
    label         NVARCHAR(120) NOT NULL,
    description   NVARCHAR(400) NULL,
    sort_order    INT NOT NULL DEFAULT(1000),
    active        BIT NOT NULL DEFAULT(1),
    created_at    DATETIME2 NOT NULL DEFAULT(SYSUTCDATETIME()),
    updated_at    DATETIME2 NOT NULL DEFAULT(SYSUTCDATETIME())
  );

  CREATE UNIQUE INDEX UX_modules_catalog_module_key 
  ON dbo.modules_catalog(module_key);

  CREATE INDEX IX_modules_catalog_domain_sort 
  ON dbo.modules_catalog(domain, sort_order);
END
GO


-- =========================================================
-- 2) SEED MODULE CATALOG
-- =========================================================

MERGE dbo.modules_catalog AS t
USING (VALUES

('core.dashboard','core','Dashboard','Visão geral do negócio',10,1),

('commercial.quotes','commercial','Orçamentos','Gestão de orçamentos',100,1),
('commercial.orders','commercial','Pedidos','Gestão de pedidos',110,1),
('commercial.sales','commercial','Vendas','Gestão de vendas',120,1),
('commercial.shipments','commercial','Expedição','Separação e expedição',130,1),
('commercial.returns','commercial','Devoluções','Devoluções e estornos',140,1),

('finance.receivables','finance','Contas a Receber','Títulos e recebimentos',200,1),
('finance.payables','finance','Contas a Pagar','Despesas e pagamentos',210,1),
('finance.cashflow','finance','Fluxo de Caixa','Projeção e realizado',220,1),
('finance.reconciliation','finance','Conciliação','Conciliação bancária',230,1),
('finance.payments','finance','Pagamentos','Execução de pagamentos',240,1),

('fiscal.documents','fiscal','Documentos Fiscais','Documentos fiscais',300,1),
('fiscal.nfe','fiscal','NF-e','Emissão e gestão de NF-e',310,1),
('fiscal.nfse','fiscal','NFS-e','Emissão e gestão de NFS-e',320,1),
('fiscal.rules','fiscal','Regras Tributárias','Regras tributárias',330,1),
('fiscal.tax_profiles','fiscal','Perfis Fiscais','Perfis fiscais',340,1),

('inventory.stock','inventory','Saldo de Estoque','Consulta de saldos',400,1),
('inventory.movements','inventory','Movimentações','Entradas e saídas',410,1),
('inventory.counts','inventory','Inventário','Contagens e divergências',420,1),
('inventory.locations','inventory','Locais','Depósitos e endereços',430,1),

('cadastros.companies','cadastros','Empresas','Cadastro de empresas',500,1),
('cadastros.suppliers','cadastros','Fornecedores','Cadastro de fornecedores',510,1),
('cadastros.customers','cadastros','Clientes','Cadastro de clientes',520,1),
('cadastros.products','cadastros','Produtos','Cadastro de produtos',530,1),
('cadastros.fiscal_registry','cadastros','Base Fiscal','CFOP, NCM, CEST etc.',540,1),
('cadastros.services','cadastros','Serviços','Cadastro de serviços',550,1),
('cadastros.bank_accounts','cadastros','Contas Bancárias','Contas da empresa',560,1),
('cadastros.payment_methods','cadastros','Meios de Pagamento','Formas de pagamento',570,1),
('cadastros.payment_terms','cadastros','Condições de Pagamento','Condições comerciais',580,1),

('reports.sales','reports','Relatórios de Vendas','Relatórios comerciais',600,1),
('reports.finance','reports','Relatórios Financeiros','Relatórios financeiros',610,1),
('reports.inventory','reports','Relatórios de Estoque','Relatórios de estoque',620,1),
('reports.fiscal','reports','Relatórios Fiscais','Relatórios fiscais',630,1),

('admin.users','admin','Usuários','Gestão de usuários',700,1),
('admin.roles','admin','Perfis e Permissões','RBAC',710,1),
('admin.settings','admin','Configurações','Configurações da empresa',720,1),
('admin.audit','admin','Auditoria','Eventos e logs',730,1)

) AS s(module_key, domain, label, description, sort_order, active)

ON t.module_key = s.module_key

WHEN MATCHED THEN
  UPDATE SET
    t.domain = s.domain,
    t.label = s.label,
    t.description = s.description,
    t.sort_order = s.sort_order,
    t.active = s.active,
    t.updated_at = SYSUTCDATETIME()

WHEN NOT MATCHED THEN
  INSERT (module_key, domain, label, description, sort_order, active)
  VALUES (s.module_key, s.domain, s.label, s.description, s.sort_order, s.active);

GO
