export type Service = {
  id: number;
  company_id: number;

  name: string;
  sku?: string | null;
  kind: "service";

  description?: string | null;

  uom?: string | null;
  uom_id?: number | null;

  price: number;
  cost: number;

  track_inventory?: boolean | null;
  active: boolean;

  image_url?: string | null;

  created_at: string;
  updated_at?: string | null;
};

export type ServiceCreate = {
  name: string;
  sku?: string | null;
  description?: string | null;
  uom?: string | null;
  uom_id?: number | null;
  price?: number;
  cost?: number;
  active?: boolean | null;
  image_url?: string | null;
};

export type ServiceUpdate = Partial<ServiceCreate>;

export type ListServicesQuery = {
  q?: string;
  limit?: number;
  active?: 0 | 1;
};