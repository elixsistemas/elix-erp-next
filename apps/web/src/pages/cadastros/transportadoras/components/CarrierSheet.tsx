import * as React from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { BrDocumentInput } from "@/shared/br/ui/BrDocumentInput";
import { onlyDigits } from "@/shared/br/digits";
import { maskCep, maskPhoneBR } from "@/shared/br/masks";
import { fetchCompanyByCnpj } from "@/shared/br/services/brasilapi";
import { useCepLookup } from "@/shared/br/hooks/useCepLookup";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [lookingUpCnpj, setLookingUpCnpj] = React.useState(false);

  const cepLookup = useCepLookup(form.zipCode);

  React.useEffect(() => {
    if (!open) return;

    setTab("geral");

    if (mode === "edit" && initialData) {
      setForm({
        code: initialData.code ?? "",

        legalName: initialData.legal_name ?? "",
        tradeName: initialData.trade_name ?? "",

        documentType: initialData.document_type ?? "CNPJ",
        documentNumber: initialData.document_number ?? "",

        stateRegistration: initialData.state_registration ?? "",
        municipalRegistration: initialData.municipal_registration ?? "",
        rntrc: initialData.rntrc ?? "",

        email: initialData.email ?? "",
        phone: initialData.phone ?? "",
        contactName: initialData.contact_name ?? "",

        zipCode: initialData.zip_code ?? "",
        street: initialData.street ?? "",
        number: initialData.number ?? "",
        complement: initialData.complement ?? "",
        district: initialData.district ?? "",
        city: initialData.city ?? "",
        state: initialData.state ?? "",

        notes: initialData.notes ?? "",
        active: !!initialData.active,
      });
      return;
    }

    setForm(EMPTY_CARRIER_FORM);
  }, [open, mode, initialData]);

  React.useEffect(() => {
    if (!open || !cepLookup.data) return;

    setForm((prev) => ({
      ...prev,
      street: cepLookup.data.logradouro ?? prev.street,
      complement: cepLookup.data.complemento ?? prev.complement,
      district: cepLookup.data.bairro ?? prev.district,
      city: cepLookup.data.localidade ?? prev.city,
      state: cepLookup.data.uf ?? prev.state,
    }));
  }, [open, cepLookup.data]);

  React.useEffect(() => {
    if (!open || !cepLookup.error) return;
    toast.error(cepLookup.error);
  }, [open, cepLookup.error]);

  function set<K extends keyof CarrierFormValues>(
    key: K,
    value: CarrierFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setDigits<K extends keyof CarrierFormValues>(key: K, raw: string) {
    set(key, onlyDigits(raw) as CarrierFormValues[K]);
  }

  async function lookupCnpj() {
    if (form.documentType !== "CNPJ") {
      toast.error("A consulta automática está disponível para CNPJ.");
      return;
    }

    const cnpj = onlyDigits(form.documentNumber);
    if (cnpj.length !== 14) {
      toast.error("Informe um CNPJ válido.");
      return;
    }

    try {
      setLookingUpCnpj(true);

      const j = await fetchCompanyByCnpj(cnpj);

      setForm((prev) => ({
        ...prev,
        legalName: j.razao_social ?? prev.legalName,
        tradeName: j.nome_fantasia ?? prev.tradeName,
        email: j.email ?? prev.email,
        phone: j.telefone ? onlyDigits(j.telefone) : prev.phone,
        zipCode: j.cep ? onlyDigits(j.cep) : prev.zipCode,
        street: j.logradouro ?? prev.street,
        number: j.numero ?? prev.number,
        complement: j.complemento ?? prev.complement,
        district: j.bairro ?? prev.district,
        city: j.municipio ?? prev.city,
        state: j.uf ?? prev.state,
      }));

      toast.success("Dados do CNPJ carregados");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao consultar CNPJ");
    } finally {
      setLookingUpCnpj(false);
    }
  }

  async function handleSubmit() {
    await onSubmit(form);
  }

  const personType = form.documentType === "CNPJ" ? "PJ" : "PF";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>
            {mode === "create"
              ? "Nova transportadora"
              : `Editar transportadora #${initialData?.id ?? ""}`}
          </SheetTitle>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="contato">Contato</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="carrier-code">Código</Label>
                <Input
                  id="carrier-code"
                  value={form.code}
                  onChange={(e) => set("code", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="md:col-span-3">
                <Label htmlFor="carrier-legal-name">Razão social</Label>
                <Input
                  id="carrier-legal-name"
                  value={form.legalName}
                  onChange={(e) => set("legalName", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="carrier-trade-name">Nome fantasia</Label>
                <Input
                  id="carrier-trade-name"
                  value={form.tradeName}
                  onChange={(e) => set("tradeName", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label>Tipo documento</Label>
                <Select
                  value={form.documentType}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      documentType: value as "CPF" | "CNPJ",
                      documentNumber: "",
                    }))
                  }
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CPF">CPF</SelectItem>
                    <SelectItem value="CNPJ">CNPJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>CPF/CNPJ</Label>
                <BrDocumentInput
                  value={form.documentNumber}
                  onChange={(rawDigits) => set("documentNumber", rawDigits)}
                  personType={personType}
                  placeholder={
                    form.documentType === "CNPJ"
                      ? "00.000.000/0000-00"
                      : "000.000.000-00"
                  }
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={lookupCnpj}
                  disabled={saving || lookingUpCnpj || form.documentType !== "CNPJ"}
                >
                  {lookingUpCnpj ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Buscar CNPJ
                </Button>
              </div>

              <div>
                <Label htmlFor="carrier-ie">Inscrição estadual</Label>
                <Input
                  id="carrier-ie"
                  value={form.stateRegistration}
                  onChange={(e) => set("stateRegistration", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="carrier-im">Inscrição municipal</Label>
                <Input
                  id="carrier-im"
                  value={form.municipalRegistration}
                  onChange={(e) => set("municipalRegistration", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="carrier-rntrc">RNTRC</Label>
                <Input
                  id="carrier-rntrc"
                  value={form.rntrc}
                  onChange={(e) => set("rntrc", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="md:col-span-4 rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.active}
                    onCheckedChange={(checked) => set("active", checked)}
                    disabled={saving}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Transportadora ativa</span>
                    <span className="text-xs text-muted-foreground">
                      Disponível para uso nos processos do ERP.
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4">
                <Label htmlFor="carrier-notes">Observações</Label>
                <Textarea
                  id="carrier-notes"
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  disabled={saving}
                  placeholder="Dados úteis para frete, fiscal e operação."
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contato" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="carrier-contact-name">Contato</Label>
                <Input
                  id="carrier-contact-name"
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="carrier-phone">Telefone</Label>
                <Input
                  id="carrier-phone"
                  value={maskPhoneBR(form.phone)}
                  onChange={(e) => setDigits("phone", e.target.value)}
                  inputMode="numeric"
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="carrier-email">E-mail</Label>
                <Input
                  id="carrier-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="endereco" className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="carrier-zip">CEP</Label>
                <div className="relative">
                  <Input
                    id="carrier-zip"
                    value={maskCep(form.zipCode)}
                    onChange={(e) => setDigits("zipCode", e.target.value)}
                    inputMode="numeric"
                    disabled={saving}
                  />
                  {cepLookup.loading && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="carrier-street">Logradouro</Label>
                <Input
                  id="carrier-street"
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="carrier-number">Número</Label>
                <Input
                  id="carrier-number"
                  value={form.number}
                  onChange={(e) => set("number", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="carrier-complement">Complemento</Label>
                <Input
                  id="carrier-complement"
                  value={form.complement}
                  onChange={(e) => set("complement", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="carrier-district">Bairro</Label>
                <Input
                  id="carrier-district"
                  value={form.district}
                  onChange={(e) => set("district", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="carrier-city">Cidade</Label>
                <Input
                  id="carrier-city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="carrier-state">UF</Label>
                <Input
                  id="carrier-state"
                  maxLength={2}
                  value={form.state}
                  onChange={(e) => set("state", e.target.value.toUpperCase())}
                  disabled={saving}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
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