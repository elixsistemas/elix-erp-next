import { z } from "zod";

export const orderItemSchema = z.object({
  productId:   z.number().int().positive().nullable().optional(),
  description: z.string().min(1, "Descrição obrigatória"),
  quantity:    z.number().positive("Quantidade deve ser maior que 0"),
  unitPrice:   z.number().min(0,  "Preço não pode ser negativo"),
});

export const orderSchema = z.object({
  customerId:           z.number({ error: "Cliente obrigatório" }).min(1, "Cliente obrigatório"),
  sellerId:             z.number().int().positive().nullable().optional(),
  discount:             z.number().min(0).default(0),
  paymentTerms:         z.string().nullable().optional(),
  paymentMethod:        z.string().nullable().optional(),
  transportMode:        z.string().nullable().optional(),
  expectedDelivery:     z.string().nullable().optional(),
  deliveryZipcode:      z.string().nullable().optional(),
  deliveryStreet:       z.string().nullable().optional(),
  deliveryNumber:       z.string().nullable().optional(),
  deliveryComplement:   z.string().nullable().optional(),
  deliveryNeighborhood: z.string().nullable().optional(),
  deliveryCity:         z.string().nullable().optional(),
  deliveryState:        z.string().nullable().optional(),
  notes:                z.string().nullable().optional(),
  items:                z.array(orderItemSchema).min(1, "Informe ao menos 1 item"),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
