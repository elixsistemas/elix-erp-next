import { z } from "zod";

export const CreateOrderSchema = z.object({
  customerId: z.number().int().positive(),
  notes: z.string().max(2000).optional().nullable(),
  discount: z.number().min(0).optional().nullable(),

  // ✅ novo:
  quoteId: z.number().int().positive().optional().nullable(),

  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      kind: z.enum(["product", "service"]).default("product"),
      description: z.string().min(1).max(200),
      quantity: z.number().positive(),
      unitPrice: z.number().min(0),
    })
  ).min(1),
});

export const UpdateOrderSchema = z.object({
  status: z.enum(["draft", "billed", "cancelled"]).optional(),
  notes: z.string().max(2000).optional().nullable(),
  discount: z.number().min(0).optional().nullable(),

  // ⚠️ eu recomendo NÃO permitir alterar quoteId depois que criou
  // mas se quiser permitir, habilite:
  // quoteId: z.number().int().positive().optional().nullable(),
});

export const OrderStatusSchema = z.enum(["draft", "open", "billed", "cancelled"]);

export const OrderItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  kind: z.enum(["product", "service"]),
  description: z.string().trim().min(1).max(255),
  quantity: z.coerce.number().positive(), // decimal(18,3)
  unitPrice: z.coerce.number().nonnegative(), // decimal(18,2)
  total: z.coerce.number().nonnegative(), // decimal(18,2)
});

export const ListOrdersQuerySchema = z.object({
  from: z.string().optional(), // YYYY-MM-DD
  to: z.string().optional(),
  customerId: z.coerce.number().int().positive().optional(),
  status: OrderStatusSchema.optional(),
});

export const BillOrderSchema = z.object({
  // deixa pronto pro futuro, hoje não precisa nada
  // no futuro: { finalizeSale?: boolean, issueFiscal?: "NFE"|"NFSE"|"BOTH" }
});
