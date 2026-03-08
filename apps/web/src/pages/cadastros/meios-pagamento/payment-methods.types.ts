export type PaymentMethodType =
  | "cash"
  | "pix"
  | "boleto"
  | "credit_card"
  | "debit_card"
  | "bank_transfer"
  | "check"
  | "wallet"
  | "other";

export type PaymentMethodIntegrationType =
  | "none"
  | "manual"
  | "gateway"
  | "bank"
  | "acquirer";

export type PaymentMethod = {
  id: number;
  company_id: number;
  code: string | null;
  name: string;
  type: PaymentMethodType;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;

  allows_installments: boolean;
  max_installments: number;
  requires_bank_account: boolean;
  settlement_days: number;
  fee_percent: number;
  fee_fixed: number;
  integration_type: PaymentMethodIntegrationType | null;
  external_code: string | null;
  is_default: boolean;
  sort_order: number;
};

export type PaymentMethodFormState = {
  code: string;
  name: string;
  type: PaymentMethodType;
  description: string;
  active: boolean;

  allowsInstallments: boolean;
  maxInstallments: string;
  requiresBankAccount: boolean;
  settlementDays: string;
  feePercent: string;
  feeFixed: string;
  integrationType: PaymentMethodIntegrationType;
  externalCode: string;
  isDefault: boolean;
  sortOrder: string;
};