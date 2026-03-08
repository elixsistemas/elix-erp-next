import * as React from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { BrDocumentInput } from "@/shared/br/ui/BrDocumentInput";
import { onlyDigits } from "@/shared/br/digits";
import { maskCep, maskPhoneBR, maskCPF, maskCNPJ } from "@/shared/br/masks";
import { fetchAddressByCep } from "@/shared/br/services/viacep";
import { fetchCompanyByCnpj } from "@/shared/br/services/brasilapi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import type { Carrier } from "../carriers.types";
import type { CarrierFormValues } from "../carriers.types";
import { EMPTY_CARRIER_FORM } from "../carriers.schema";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  saving: boolean;
  initialData: Carrier | null;
  onSubmit: (data: CarrierFormValues) => Promise<void> | void;
};

export function CarrierSheet({
  open,
  onOpenChange,
  mode,
  saving,
  initialData,
  onSubmit,
}: Props) {
  const [tab, setTab] = React.useState("geral");
  const [form, setForm] = React.useState<CarrierFormValues>(EMPTY_CARRIER_FORM);

  React.useEffect(() => {
    if (!open) return;
    setTab("geral");

    if (mode === "edit" && initialData) {
      setForm({
        code: initialData.code ?? "",
        name: initialData.name ?? "",
        legal_name: initialData.legal_name ?? "",
        document: initialData.document ?? "",
        state_registration: initialData.state_registration ?? "",
        rntrc: initialData.rntrc ?? "",

        email: initialData.email ?? "",
        phone: initialData.phone ?? "",
        contact_name: initialData.contact_name ?? "",

        zip_code: initialData.zip_code ?? "",
        street: initialData.street ?? "",
        street_number: initialData.street_number ?? "",
        complement: initialData.complement ?? "",
        neighborhood: initialData.neighborhood ?? "",
        city: initialData.city ?? "",
        state: initialData.state ?? "",

        vehicle_type: initialData.vehicle_type ?? "",
        plate: initialData.plate ?? "",

        notes: initialData.notes ?? "",
        active: !!initialData.active,
      });
      return;
    }

    setForm(EMPTY_CARRIER_FORM);
  }, [open, mode, initialData]);

  function set<K extends keyof CarrierFormValues>(key: K, value: CarrierFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setDigits<K extends keyof CarrierFormValues>(key: K, raw: string) {
    set(key, onlyDigits(raw) as CarrierFormValues[K]);
  }

  const docDigits = onlyDigits(form.document ?? "");
  const personType = docDigits.length > 11 ? "PJ" : "PF";
  const maskedDoc = personType === "PF" ? maskCPF(form.document ?? "") : maskCNPJ(form.document ?? "");

  async function lookupCep() {
    const cep = onlyDigits(form.zip_code ?? "");
    if (cep.length !== 8) {
      toast.error("Informe um CEP válido.");
      return;
    }

    try {
      const j = await fetchAddressByCep(cep);
      set("street", j.logradouro ?? "");
      set("complement", j.complemento ?? "");
      set("neighborhood", j.bairro ?? "");
      set("city", j.localidade ?? "");
      set("state", j.uf ?? "");
      toast.success("Endereço carregado pelo CEP");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao consultar CEP");
    }
  }

  async function lookupCnpj() {
    if (personType !== "PJ") return;

    const cnpj = onlyDigits(form.document ?? "");
    if (cnpj.length !== 14) {
      toast.error("Informe um CNPJ válido.");
      return;
    }

    try {
      const j = await fetchCompanyByCnpj(cnpj);

      if (j?.razao_social) set("name", j.razao_social);
      if (j?.email) set("email", j.email);
      if (j?.telefone) setDigits("phone", j.telefone);

      if (j?.logradouro) {
        const n = j.numero ? `, ${j.numero}` : "";
        set("street", `${j.logradouro}${n}`);
      }

      if (j?.complemento) set("complement", j.complemento);
      if (j?.bairro) set("neighborhood", j.bairro);
      if (j?.municipio) set("city", j.municipio);
      if (j?.uf) set("state", j.uf);
      if (j?.cep) setDigits("zip_code", j.cep);

      toast.success("Dados do CNPJ carregados");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao consultar CNPJ");
    }
  }

  async function handleSubmit() {
    await onSubmit(form);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-[760px]">
        <SheetHeader>
          <SheetTitle>
            {mode === "create"
              ? "Nova transportadora"
              : `Editar transportadora #${initialData?.id ?? ""}`}
          </SheetTitle>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="contato">Contato</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
            <TabsTrigger value="operacao">Operação</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Código</Label>
                <Input
                  value={form.code}
                  onChange={(e) => set("code", e.target.value)}
                />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label>Nome / Razão</Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label>Razão social</Label>
                <Input
                  value={form.legal_name}
                  onChange={(e) => set("legal_name", e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label>Ativa</Label>
                <Switch
                  checked={form.active}
                  onCheckedChange={(checked) => set("active", checked)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Documento (CPF/CNPJ)</Label>
                <div className="flex gap-2">
                  <BrDocumentInput
                    value={maskedDoc}
                    onChange={(value) => setDigits("document", value)}
                    personType={personType}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={lookupCnpj}
                    title="Buscar CNPJ"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>IE</Label>
                <Input
                  value={form.state_registration}
                  onChange={(e) => set("state_registration", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>RNTRC</Label>
                <Input
                  value={form.rntrc}
                  onChange={(e) => set("rntrc", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contato" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Contato (nome)</Label>
                <Input
                  value={form.contact_name}
                  onChange={(e) => set("contact_name", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Telefone</Label>
                <Input
                  value={maskPhoneBR(form.phone ?? "")}
                  onChange={(e) => setDigits("phone", e.target.value)}
                  inputMode="numeric"
                />
              </div>

              <div className="grid gap-2">
                <Label>E-mail</Label>
                <Input
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="endereco" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="grid gap-2">
                <Label>CEP</Label>
                <div className="flex gap-2">
                  <Input
                    value={maskCep(form.zip_code ?? "")}
                    onChange={(e) => setDigits("zip_code", e.target.value)}
                    inputMode="numeric"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={lookupCep}
                    title="Buscar CEP"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label>Rua</Label>
                <Input
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Número</Label>
                <Input
                  value={form.street_number}
                  onChange={(e) => set("street_number", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Complemento</Label>
                <Input
                  value={form.complement}
                  onChange={(e) => set("complement", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Bairro</Label>
                <Input
                  value={form.neighborhood}
                  onChange={(e) => set("neighborhood", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Cidade</Label>
                <Input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>UF</Label>
                <Input
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="operacao" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Tipo de veículo</Label>
                <Input
                  value={form.vehicle_type}
                  onChange={(e) => set("vehicle_type", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label>Placa</Label>
                <Input
                  value={form.plate}
                  onChange={(e) => set("plate", e.target.value)}
                />
              </div>

              <div className="grid gap-2 md:col-span-2">
                <Label>Observações</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Dados úteis para logística, frete e fiscal."
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6">
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