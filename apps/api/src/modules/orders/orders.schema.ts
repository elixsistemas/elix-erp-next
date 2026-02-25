import { z } from "zod";

export const OrderStatusSchema = z.enum(["draft", "confirmed", "cancelled"]);

export const OrderListQuerySchema = z.object({
  q:          z.string().trim().min(1).optional(),
  status:     OrderStatusSchema.optional(),
  customerId: z.coerce.number().int().positive().optional(),
  from:       z.string().optional(),
  to:         z.string().optional(),
  limit:      z.coerce.number().int().min(1).max(200).optional(),
});

export const OrderItemSchema = z.object({
  productId:   z.number().int().positive().nullable().optional(),
  description: z.string().min(1).max(255),
  quantity:    z.number().positive(),
  unitPrice:   z.number().min(0),
  unit:        z.string().max(10).nullable().optional(),  // ← novo
});

export const OrderCreateSchema = z.object({
  customerId:           z.number().int().positive(),
  quoteId:              z.number().int().positive().nullable().optional(),
  discount:             z.number().min(0).default(0),
  freightValue:         z.number().min(0).default(0),      // ← novo
  notes:                z.string().nullable().optional(),
  internalNotes:        z.string().nullable().optional(),  // ← novo
  expectedDelivery:     z.string().nullable().optional(),
  paymentTerms:         z.string().nullable().optional(),
  paymentMethod:        z.string().nullable().optional(),
  sellerName:           z.string().nullable().optional(),
  transportMode:        z.string().nullable().optional(),
  deliveryZipcode:      z.string().nullable().optional(),
  deliveryStreet:       z.string().nullable().optional(),
  deliveryNumber:       z.string().nullable().optional(),
  deliveryComplement:   z.string().nullable().optional(),
  deliveryNeighborhood: z.string().nullable().optional(),
  deliveryCity:         z.string().nullable().optional(),
  deliveryState:        z.string().nullable().optional(),
  items: z.array(OrderItemSchema).min(1, "Informe ao menos 1 item"),
});

export const OrderUpdateSchema = OrderCreateSchema
  .omit({ quoteId: true })
  .partial()
  .extend({ items: z.array(OrderItemSchema).min(1).optional() });

export type OrderStatus    = z.infer<typeof OrderStatusSchema>;
export type OrderListQuery = z.infer<typeof OrderListQuerySchema>;
export type OrderCreate    = z.infer<typeof OrderCreateSchema>;
export type OrderUpdate    = z.infer<typeof OrderUpdateSchema>;
export type OrderItem      = z.infer<typeof OrderItemSchema>;
