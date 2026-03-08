import { z } from "zod";

export const bankAccountFormSchema = z.object({
  bankCode: z.string().trim().min(1, "Informe o código do banco"),
  name: z.string().trim().min(2, "Informe o nome da conta"),
  agency: z.string().trim().optional(),
  account: z.string().trim().optional(),
  accountDigit: z.string().trim().optional(),
  convenio: z.string().trim().optional(),
  wallet: z.string().trim().optional(),
  settingsJson: z.string().trim().optional(),

  accountType: z.enum(["checking", "savings", "payment", "cash", "other"]),
  bankName: z.string().trim().optional(),
  bankIspb: z.string().trim().optional(),
  branchDigit: z.string().trim().optional(),
  holderName: z.string().trim().optional(),
  holderDocument: z.string().trim().optional(),
  pixKeyType: z.enum(["none", "cpf", "cnpj", "email", "phone", "random", "other"]),
  pixKeyValue: z.string().trim().optional(),
  isDefault: z.boolean(),
  allowReceipts: z.boolean(),
  allowPayments: z.boolean(),
  reconciliationEnabled: z.boolean(),
  externalCode: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  active: z.boolean(),
});

export type BankAccountFormState = z.infer<typeof bankAccountFormSchema>;

function nullable(value?: string) {
  const v = value?.trim();
  return v ? v : null;
}

export function normalizeBankAccountPayload(v: BankAccountFormState) {
  return {
    bankCode: v.bankCode.trim(),
    name: v.name.trim(),
    agency: nullable(v.agency),
    account: nullable(v.account),
    accountDigit: nullable(v.accountDigit),
    convenio: nullable(v.convenio),
    wallet: nullable(v.wallet),
    settingsJson: nullable(v.settingsJson),

    accountType: v.accountType,
    bankName: nullable(v.bankName),
    bankIspb: nullable(v.bankIspb),
    branchDigit: nullable(v.branchDigit),
    holderName: nullable(v.holderName),
    holderDocument: nullable(v.holderDocument),
    pixKeyType: v.pixKeyType === "none" ? null : v.pixKeyType,
    pixKeyValue: nullable(v.pixKeyValue),
    isDefault: v.isDefault,
    allowReceipts: v.allowReceipts,
    allowPayments: v.allowPayments,
    reconciliationEnabled: v.reconciliationEnabled,
    externalCode: nullable(v.externalCode),
    notes: nullable(v.notes),
    active: v.active,
  };
}