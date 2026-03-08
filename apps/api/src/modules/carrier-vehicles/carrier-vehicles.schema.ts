import { z } from "zod";

export const CarrierVehicleListQuerySchema = z.object({
  q: z.string().trim().optional(),
  active: z.union([z.literal("1"), z.literal("0")]).optional(),
  carrierId: z.coerce.number().int().positive().optional(),
});

const CarrierVehicleBaseSchema = z.object({
  carrierId: z.coerce.number().int().positive("Informe a transportadora"),

  plate: z.string().trim().min(7, "Informe a placa").max(10),
  secondaryPlate: z.string().trim().max(10).optional().nullable(),

  renavam: z.string().trim().max(20).optional().nullable(),
  state: z.string().trim().length(2, "UF inválida").optional().nullable(),

  vehicleType: z.string().trim().max(30).optional().nullable(),
  bodyType: z.string().trim().max(30).optional().nullable(),
  brandModel: z.string().trim().max(120).optional().nullable(),

  capacityKg: z.coerce.number().nonnegative().optional().nullable(),
  capacityM3: z.coerce.number().nonnegative().optional().nullable(),
  taraKg: z.coerce.number().nonnegative().optional().nullable(),

  rntrc: z.string().trim().max(30).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),

  active: z.boolean().optional(),
});

export const CarrierVehicleCreateSchema = CarrierVehicleBaseSchema;
export const CarrierVehicleUpdateSchema = CarrierVehicleBaseSchema.partial();