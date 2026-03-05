-- =========================================================
-- Elix ERP Next — Licensing (SaaS)
-- SQL Server migration/seed
-- =========================================================

-- 1) PLANS
IF OBJECT_ID('dbo.licensing_plans', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.licensing_plans (
    id           INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    code         VARCHAR(40) NOT NULL,           -- starter, pro, enterprise
    name         NVARCHAR(80) NOT NULL,
    description  NVARCHAR(240) NULL,
    user_limit   INT NOT NULL,                   -- hard limit for active users
    grace_days   INT NOT NULL DEFAULT(7),        -- after due date before suspension
    active       BIT NOT NULL DEFAULT(1),
    created_at   DATETIME2 NOT NULL DEFAULT(SYSUTCDATETIME()),
    updated_at   DATETIME2 NOT NULL DEFAULT(SYSUTCDATETIME())
  );

  CREATE UNIQUE INDEX UX_licensing_plans_code ON dbo.licensing_plans(code);
END
GO

-- 2) COMPANY LICENSE
IF OBJECT_ID('dbo.company_license', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.company_license (
    id              INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    company_id      INT NOT NULL,
    plan_id         INT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT('active'), -- active | past_due | suspended | canceled
    due_at          DATETIME2 NOT NULL,                     -- next payment due date
    paid_through_at DATETIME2 NULL,                         -- optional
    user_limit_override INT NULL,                           -- optional override per company
    read_only       BIT NOT NULL DEFAULT(0),                -- can be computed by app
    notes           NVARCHAR(240) NULL,
    created_at      DATETIME2 NOT NULL DEFAULT(SYSUTCDATETIME()),
    updated_at      DATETIME2 NOT NULL DEFAULT(SYSUTCDATETIME()),

    CONSTRAINT FK_company_license_plan FOREIGN KEY(plan_id) REFERENCES dbo.licensing_plans(id)
  );

  CREATE INDEX IX_company_license_company ON dbo.company_license(company_id, due_at DESC);
END
GO

-- 3) SEED DEFAULT PLANS (idempotent)
MERGE dbo.licensing_plans AS t
USING (VALUES
  ('starter',    N'Starter',    N'Cadastros + Comercial básico',  3,  7, 1),
  ('pro',        N'Pro',        N'+ Estoque + Financeiro + Fiscal', 10, 7, 1),
  ('enterprise', N'Enterprise', N'+ Auditoria + Relatórios avançados + Integrações', 9999, 14, 1)
) AS s(code, name, description, user_limit, grace_days, active)
ON t.code = s.code
WHEN MATCHED THEN
  UPDATE SET
    t.name = s.name,
    t.description = s.description,
    t.user_limit = s.user_limit,
    t.grace_days = s.grace_days,
    t.active = s.active,
    t.updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (code, name, description, user_limit, grace_days, active)
  VALUES (s.code, s.name, s.description, s.user_limit, s.grace_days, s.active);
GO

-- 4) Helper view: current license per company (latest by due_at)
IF OBJECT_ID('dbo.v_company_current_license', 'V') IS NULL
EXEC('
CREATE VIEW dbo.v_company_current_license AS
SELECT cl.*,
       p.code AS plan_code,
       p.name AS plan_name,
       p.user_limit AS plan_user_limit,
       p.grace_days AS plan_grace_days
FROM dbo.company_license cl
JOIN dbo.licensing_plans p ON p.id = cl.plan_id
WHERE cl.id IN (
  SELECT TOP 1 cl2.id
  FROM dbo.company_license cl2
  WHERE cl2.company_id = cl.company_id
  ORDER BY cl2.due_at DESC, cl2.id DESC
);
');
GO
