export type CarrierVehicle = {
  id: number;
  company_id: number;
  carrier_id: number;

  carrier_legal_name: string;
  carrier_trade_name: string | null;

  plate: string;
  secondary_plate: string | null;

  renavam: string | null;
  state: string | null;

  vehicle_type: string | null;
  body_type: string | null;
  brand_model: string | null;

  capacity_kg: number | null;
  capacity_m3: number | null;
  tara_kg: number | null;

  rntrc: string | null;
  notes: string | null;

  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CarrierOption = {
  id: number;
  legal_name: string;
  trade_name: string | null;
};

export type CarrierVehicleFormValues = {
  carrierId: string;

  plate: string;
  secondaryPlate: string;

  renavam: string;
  state: string;

  vehicleType: string;
  bodyType: string;
  brandModel: string;

  capacityKg: string;
  capacityM3: string;
  taraKg: string;

  rntrc: string;
  notes: string;

  active: boolean;
};