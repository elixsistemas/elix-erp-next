import * as React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Customer } from "../customers.types";
import { type CustomerUpsertForm } from "../customers.schema";

import { onlyDigits } from "@/shared/br/digits";
import { maskCNPJ, maskCPF, maskCep, maskPhoneBR } from "@/shared/br/masks";
import { fetchAddressByCep } from "@/shared/br/services/viacep";
import { fetchCompanyByCnpj } from "@/shared/br/services/brasilapi";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  mode: "create" | "edit";
  saving: boolean;

  initialData: Customer | null;
  onSubmit: (data: CustomerUpsertForm) => Promise<void> | void;
};

const empty: CustomerUpsertForm = {
  name: "",
  document: "",

  person_type: "PJ",
  ie: null,

  email: null,
  phone: null,
  mobile: null,
  contact_name: null,

  notes: null,

  billing_address_line1: null,
  billing_address_line2: null,
  billing_district: null,
  billing_city: null,
  billing_state: null,
  billing_zip_code: null,
  billing_country: "BR",

  shipping_address_line1: null,
  shipping_address_line2: null,
  shipping_district: null,
  shipping_city: null,
  shipping_state: null,
  shipping_zip_code: null,
  shipping_country: "BR",
};

export function CustomerSheet({ open, onOpenChange, mode, saving, initialData, onSubmit }: Props) {
  const [tab, setTab] = React.useState("geral");
  const [sameAsBilling, setSameAsBilling] = React.useState(true);
  const [form, setForm] = React.useState<CustomerUpsertForm>(empty);

  const personType = (form.person_type ?? "PJ") as "PF" | "PJ";

  React.useEffect(() => {
    if (!open) return;

    setTab("geral");

    if (mode === "edit" && initialData) {
      const next: CustomerUpsertForm = {
        ...empty,
        ...pickCustomerToForm(initialData),
      };

      setForm(next);

      const shippingLooksEmpty =
        !next.shipping_address_line1 &&
        !next.shipping_city &&
        !next.shipping_state &&
        !next.shipping_zip_code;

      setSameAsBilling(shippingLooksEmpty);
      if (shippingLooksEmpty) syncShippingFromBilling(next, setForm);
      return;
    }

    setSameAsBilling(true);
    setForm(empty);
    syncShippingFromBilling(empty, setForm);
  }, [open, mode, initialData]);

  function set<K extends keyof CustomerUpsertForm>(key: K, value: CustomerUpsertForm[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (sameAsBilling && String(key).startsWith("billing_")) {
        return {
          ...next,
          shipping_address_line1: next.billing_address_line1 ?? null,
          shipping_address_line2: next.billing_address_line2 ?? null,
          shipping_district: next.billing_district ?? null,
          shipping_city: next.billing_city ?? null,
          shipping_state: next.billing_state ?? null,
          shipping_zip_code: next.billing_zip_code ?? null,
          shipping_country: next.billing_country ?? "BR",
        };
      }

      return next;
    });
  }

  function setDigits<K extends keyof CustomerUpsertForm>(key: K, raw: string) {
    set(key, onlyDigits(raw) as any);
  }

  async function handleSubmit() {
    const payload = { ...form };

    if (sameAsBilling) {
      payload.shipping_address_line1 = payload.billing_address_line1 ?? null;
      payload.shipping_address_line2 = payload.billing_address_line2 ?? null;
      payload.shipping_district = payload.billing_district ?? null;
      payload.shipping_city = payload.billing_city ?? null;
      payload.shipping_state = payload.billing_state ?? null;
      payload.shipping_zip_code = payload.billing_zip_code ?? null;
      payload.shipping_country = payload.billing_country ?? "BR";
    }

    await onSubmit(payload);
  }

  async function onLookupBillingCep() {
    const cep = onlyDigits(form.billing_zip_code ?? "");
    if (cep.length !== 8) return;

    const j = await fetchAddressByCep(cep);

    set("billing_address_line1", j.logradouro ?? "");
    set("billing_address_line2", j.complemento ?? "");
    set("billing_district", j.bairro ?? "");
    set("billing_city", j.localidade ?? "");
    set("billing_state", j.uf ?? "");
    set("billing_country", "BR");
  }

  async function onLookupShippingCep() {
    const cep = onlyDigits(form.shipping_zip_code ?? "");
    if (cep.length !== 8) return;

    const j = await fetchAddressByCep(cep);

    set("shipping_address_line1", j.logradouro ?? "");
    set("shipping_address_line2", j.complemento ?? "");
    set("shipping_district", j.bairro ?? "");
    set("shipping_city", j.localidade ?? "");
    set("shipping_state", j.uf ?? "");
    set("shipping_country", "BR");
  }

  async function onLookupCnpj() {
    if (personType !== "PJ") return;
    const cnpj = onlyDigits(form.document ?? "");
    if (cnpj.length !== 14) return;

    const j = await fetchCompanyByCnpj(cnpj);

    if (j.razao_social) set("name", j.razao_social);
    if (j.email) set("email", j.email);
    if (j.telefone) setDigits("phone", j.telefone);

    if (j.logradouro) {
      const n = j.numero ? `, ${j.numero}` : "";
      set("billing_address_line1", `${j.logradouro}${n}`);
    }
    if (j.complemento) set("billing_address_line2", j.complemento);
    if (j.bairro) set("billing_district", j.bairro);
    if (j.municipio) set("billing_city", j.municipio);
    if (j.uf) set("billing_state", j.uf);
    if (j.cep) setDigits("billing_zip_code", j.cep);
    set("billing_country", "BR");
  }

  const maskedDoc = personType === "PF" ? maskCPF(form.document ?? "") : maskCNPJ(form.document ?? "");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[760px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Novo cliente" : `Editar cliente #${initialData?.id ?? ""}`}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="contato">Contato</TabsTrigger>
              <TabsTrigger value="cobranca">Cobrança</TabsTrigger>
              <TabsTrigger value="entrega">Entrega</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-2">
                  <Label>Nome / Razão</Label>
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={(form.person_type ?? "PJ") as any}
                    onValueChange={(v) => set("person_type", v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PJ">PJ</SelectItem>
                      <SelectItem value="PF">PF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Documento + botão buscar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Documento (CPF/CNPJ)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={maskedDoc}
                      onChange={(e) => setDigits("document", e.target.value)}
                      inputMode="numeric"
                      placeholder={personType === "PF" ? "CPF" : "CNPJ"}
                      onBlur={async () => {
                        // “modo futuro”: ao sair do campo, tenta buscar PJ
                        if (personType === "PJ") {
                          try { await onLookupCnpj(); } catch {}
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Buscar no CNPJ"
                      onClick={async () => {
                        try { await onLookupCnpj(); } catch {}
                      }}
                      disabled={personType !== "PJ"}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>IE</Label>
                  <Input value={form.ie ?? ""} onChange={(e) => set("ie", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Contato (nome)</Label>
                  <Input
                    value={form.contact_name ?? ""}
                    onChange={(e) => set("contact_name", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contato" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={maskPhoneBR(form.phone ?? "")}
                    onChange={(e) => setDigits("phone", e.target.value)}
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Celular</Label>
                  <Input
                    value={maskPhoneBR(form.mobile ?? "")}
                    onChange={(e) => setDigits("mobile", e.target.value)}
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    rows={5}
                    value={form.notes ?? ""}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Detalhes úteis para comercial, financeiro, etc."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cobranca" className="mt-4 space-y-4">
              <AddressFormV2
                title="Endereço de cobrança"
                prefix="billing"
                get={form}
                set={set}
                setDigits={setDigits}
                onLookupCep={onLookupBillingCep}
              />
            </TabsContent>

            <TabsContent value="entrega" className="mt-4 space-y-4">
              <div className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <div className="font-medium">Entrega igual cobrança</div>
                  <div className="text-sm text-muted-foreground">
                    Ative para manter sincronizado (menos retrabalho).
                  </div>
                </div>

                <Button
                  type="button"
                  variant={sameAsBilling ? "default" : "outline"}
                  onClick={() => {
                    setSameAsBilling((v) => {
                      const next = !v;
                      if (next) syncShippingFromBilling(form, setForm);
                      return next;
                    });
                  }}
                >
                  {sameAsBilling ? "Ativo" : "Inativo"}
                </Button>
              </div>

              <div className={sameAsBilling ? "opacity-60 pointer-events-none" : ""}>
                <AddressFormV2
                  title="Endereço de entrega"
                  prefix="shipping"
                  get={form}
                  set={set}
                  setDigits={setDigits}
                  onLookupCep={onLookupShippingCep}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function AddressFormV2(props: {
  prefix: "billing" | "shipping";
  title: string;
  get: CustomerUpsertForm;
  set: <K extends keyof CustomerUpsertForm>(key: K, value: CustomerUpsertForm[K]) => void;
  setDigits: <K extends keyof CustomerUpsertForm>(key: K, raw: string) => void;
  onLookupCep: () => Promise<void>;
}) {
  const p = props.prefix;
  const key = (name: string) => `${p}_${name}` as keyof CustomerUpsertForm;
  const v = (name: string) => (props.get[key(name)] as any) ?? "";

  return (
    <div>
      <div className="font-medium">{props.title}</div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* CEP PRIMEIRO + BOTÃO DE BUSCA */}
        <div className="space-y-2">
          <Label>CEP</Label>
          <div className="flex gap-2">
            <Input
              value={maskCep(v("zip_code"))}
              onChange={(e) => props.setDigits(key("zip_code"), e.target.value)}
              onBlur={async () => {
                try { await props.onLookupCep(); } catch {}
              }}
              inputMode="numeric"
              placeholder="00000-000"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Buscar CEP"
              onClick={async () => {
                try { await props.onLookupCep(); } catch {}
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>UF</Label>
          <Input value={v("state")} onChange={(e) => props.set(key("state"), e.target.value as any)} />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Rua / Número</Label>
          <Input value={v("address_line1")} onChange={(e) => props.set(key("address_line1"), e.target.value as any)} />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label>Complemento</Label>
          <Input value={v("address_line2")} onChange={(e) => props.set(key("address_line2"), e.target.value as any)} />
        </div>

        <div className="space-y-2">
          <Label>Bairro</Label>
          <Input value={v("district")} onChange={(e) => props.set(key("district"), e.target.value as any)} />
        </div>

        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input value={v("city")} onChange={(e) => props.set(key("city"), e.target.value as any)} />
        </div>

        <div className="space-y-2">
          <Label>País</Label>
          <Input value={v("country") || "BR"} onChange={(e) => props.set(key("country"), e.target.value as any)} />
        </div>
      </div>
    </div>
  );
}

function pickCustomerToForm(c: Customer): CustomerUpsertForm {
  return {
    name: c.name ?? "",
    document: onlyDigits(c.document ?? ""),

    person_type: (c.person_type as any) ?? null,
    ie: c.ie ?? null,

    email: c.email ?? null,
    phone: onlyDigits(c.phone ?? ""),
    mobile: onlyDigits(c.mobile ?? ""),
    contact_name: c.contact_name ?? null,

    notes: c.notes ?? null,

    billing_address_line1: c.billing_address_line1 ?? null,
    billing_address_line2: c.billing_address_line2 ?? null,
    billing_district: c.billing_district ?? null,
    billing_city: c.billing_city ?? null,
    billing_state: c.billing_state ?? null,
    billing_zip_code: onlyDigits(c.billing_zip_code ?? ""),
    billing_country: c.billing_country ?? "BR",

    shipping_address_line1: c.shipping_address_line1 ?? null,
    shipping_address_line2: c.shipping_address_line2 ?? null,
    shipping_district: c.shipping_district ?? null,
    shipping_city: c.shipping_city ?? null,
    shipping_state: c.shipping_state ?? null,
    shipping_zip_code: onlyDigits(c.shipping_zip_code ?? ""),
    shipping_country: c.shipping_country ?? "BR",
  };
}

function syncShippingFromBilling(
  current: CustomerUpsertForm,
  setForm: React.Dispatch<React.SetStateAction<CustomerUpsertForm>>
) {
  setForm((prev) => ({
    ...prev,
    shipping_address_line1: current.billing_address_line1 ?? prev.billing_address_line1 ?? null,
    shipping_address_line2: current.billing_address_line2 ?? prev.billing_address_line2 ?? null,
    shipping_district: current.billing_district ?? prev.billing_district ?? null,
    shipping_city: current.billing_city ?? prev.billing_city ?? null,
    shipping_state: current.billing_state ?? prev.billing_state ?? null,
    shipping_zip_code: current.billing_zip_code ?? prev.billing_zip_code ?? null,
    shipping_country: current.billing_country ?? prev.billing_country ?? "BR",
  }));
}
