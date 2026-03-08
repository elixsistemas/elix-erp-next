export type PaymentTerm = {
  id: number;
  company_id: number;
  code: string | null;
  name: string;
  description: string | null;
  offsets_json: string;
  offsets: number[];
  active: boolean;
  created_at: string;
  updated_at: string;

  term_type: "cash" | "installment";
  installment_count: number;
  grace_days: number;
  interest_mode: "none" | "fixed" | "percent";
  interest_value: number;
  penalty_value: number;
  discount_mode: "none" | "fixed" | "percent";
  discount_value: number;
  allows_early_payment_discount: boolean;
  is_default: boolean;
  sort_order: number;
};

export type PaymentTermFormState = {
  code: string;
  name: string;
  description: string;
  offsets: string;
  active: boolean;

  termType: "cash" | "installment";
  graceDays: string;
  interestMode: "none" | "fixed" | "percent";
  interestValue: string;
  penaltyValue: string;
  discountMode: "none" | "fixed" | "percent";
  discountValue: string;
  allowsEarlyPaymentDiscount: boolean;
  isDefault: boolean;
  sortOrder: string;
};