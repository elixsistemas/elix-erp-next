import { z } from "zod";
import type { CarrierVehicleFormValues } from "./carrierVehicles.types";

export const carrierVehicleFormSchema = z.object({
  carrierId: z.string().trim().min(1, "Selecione a transportadora"),

  plate: z.string().trim().min(7, "Informe a placa").max(10),
  secondaryPlate: z.string().trim().max(10).optional().or(z.literal("")),

  renavam: z.string().trim().max(20).optional().or(z.literal("")),
  state: z.string().trim().max(2).optional().or(z.literal("")),

  vehicleType: z.string().trim().max(30).optional().or(z.literal("")),
  bodyType: z.string().trim().max(30).optional().or(z.literal("")),
  brandModel: z.string().trim().max(120).optional().or(z.literal("")),

  capacityKg: z.string().trim().optional().or(z.literal("")),
  capacityM3: z.string().trim().optional().or(z.literal("")),
  taraKg: z.string().trim().optional().or(z.literal("")),

  rntrc: z.string().trim().max(30).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),

  active: z.boolean(),
});

function nullable(value?: string) {
  const v = value?.trim();
  return v ? v : null;
}

function normalizePlate(value?: string) {
  const v = value?.trim().toUpperCase().replace(/\s+/g, "");
  return v || null;
}

function normalizeDecimal(value?: string) {
  const raw = value?.trim().replace(",", ".");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function normalizeCarrierVehiclePayload(values: CarrierVehicleFormValues) {
  return {
    carrierId: Number(values.carrierId),

    plate: normalizePlate(values.plate),
    secondaryPlate: normalizePlate(values.secondaryPlate),

    renavam: nullable(values.renavam),
    state: nullable(values.state)?.toUpperCase() ?? null,

    vehicleType: nullable(values.vehicleType),
    bodyType: nullable(values.bodyType),
    brandModel: nullable(values.brandModel),

    capacityKg: normalizeDecimal(values.capacityKg),
    capacityM3: normalizeDecimal(values.capacityM3),
    taraKg: normalizeDecimal(values.taraKg),

    rntrc: nullable(values.rntrc),
    notes: nullable(values.notes),

    active: values.active,
  };
}

export const EMPTY_CARRIER_VEHICLE_FORM: CarrierVehicleFormValues = {
  carrierId: "",

  plate: "",
  secondaryPlate: "",

  renavam: "",
  state: "",

  vehicleType: "",
  bodyType: "",
  brandModel: "",

  capacityKg: "",
  capacityM3: "",
  taraKg: "",

  rntrc: "",
  notes: "",

  active: true,
};