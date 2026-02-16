// bank-accounts.schemas.ts
import { z } from "zod";

export const bankAccountFormSchema = z.object({
  bankCode: z.string().min(1, "Informe o código do banco"),
  name: z.string().min(2, "Informe o nome da conta"),
  agency: z.string().optional(),
  account: z.string().optional(),
  accountDigit: z.string().optional(),
  convenio: z.string().optional(),
  wallet: z.string().optional(),
  settingsJson: z.string().optional(),
});

export type BankAccountFormState = z.infer<typeof bankAccountFormSchema>;

export function normalizeBankAccountPayload(v: BankAccountFormState) {
  return {
    bankCode: v.bankCode.trim(),
    name: v.name.trim(),
    agency: v.agency?.trim() || null,
    account: v.account?.trim() || null,
    accountDigit: v.accountDigit?.trim() || null,
    convenio: v.convenio?.trim() || null,
    wallet: v.wallet?.trim() || null,
    settingsJson: v.settingsJson?.trim() || null,
  };
}
