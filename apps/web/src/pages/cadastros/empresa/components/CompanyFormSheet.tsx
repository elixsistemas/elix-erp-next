import * as React from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { LogoUpload } from "./LogoUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { BankAccountRow, Company, CompanyUpdate } from "../company.types";
import { onlyDigits } from "@/shared/br/digits";
import { maskCNPJ, maskCep, maskPhoneBR } from "@/shared/br/masks";
import { fetchCompanyByCnpj } from "@/shared/br/services/brasilapi";
import { fetchAddressByCep } from "@/shared/br/services/viacep";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  company: Company | null;
  bankAccounts: BankAccountRow[];
  saving: boolean;
  onSave: (patch: CompanyUpdate) => Promise<void>;
};

export function CompanyFormSheet(props: Props) {
  const [tab, setTab] = React.useState("identidade");
  const [form, setForm] = React.useState<CompanyUpdate>({});

  React.useEffect(() => {
    if (!props.open) return;
    setTab("identidade");

    if (props.company) {
      setForm({
        name: props.company.name ?? "",
        cnpj: onlyDigits(props.company.cnpj ?? ""),

        legal_name: props.company.legal_name ?? null,
        trade_name: props.company.trade_name ?? null,
        ie: props.company.ie ?? null,
        im: props.company.im ?? null,

        email: props.company.email ?? null,
        phone: onlyDigits(props.company.phone ?? ""),
        website: props.company.website ?? null,

        zip_code: onlyDigits(props.company.zip_code ?? ""),
        address_line1: props.company.address_line1 ?? null,
        address_line2: props.company.address_line2 ?? null,
        district: props.company.district ?? null,
        city: props.company.city ?? null,
        state: props.company.state ?? null,
        country: props.company.country ?? "BR",

        default_bank_account_id: props.company.default_bank_account_id ?? null,

        allow_negative_stock: props.company.allow_negative_stock ?? false,
        is_active: props.company.is_active ?? true,
        logo_base64: props.company.logo_base64 ?? null,
      });
    }
  }, [props.open, props.company]);

  function set<K extends keyof CompanyUpdate>(key: K, value: CompanyUpdate[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function setDigits<K extends keyof CompanyUpdate>(key: K, raw: string) {
    set(key, onlyDigits(raw) as any);
  }

  async function lookupCnpj() {
    const cnpj = onlyDigits(String(form.cnpj ?? ""));
    if (cnpj.length !== 14) return toast.error("Informe um CNPJ válido.");

    try {
      const j = await fetchCompanyByCnpj(cnpj);

      if (j.razao_social) set("legal_name", j.razao_social);
      if (j.nome_fantasia) set("trade_name", j.nome_fantasia);
      if (j.email) set("email", j.email);
      if (j.telefone) setDigits("phone", j.telefone);

      if (j.logradouro) {
        const n = j.numero ? `, ${j.numero}` : "";
        set("address_line1", `${j.logradouro}${n}`);
      }
      if (j.complemento) set("address_line2", j.complemento);
      if (j.bairro) set("district", j.bairro);
      if (j.municipio) set("city", j.municipio);
      if (j.uf) set("state", j.uf);
      if (j.cep) setDigits("zip_code", j.cep);
      set("country", "BR");

      toast.success("Dados do CNPJ carregados");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao consultar CNPJ");
    }
  }

  async function lookupCep() {
    const cep = onlyDigits(String(form.zip_code ?? ""));
    if (cep.length !== 8) return toast.error("Informe um CEP válido.");

    try {
      const j = await fetchAddressByCep(cep);
      set("address_line1", j.logradouro ?? "");
      set("address_line2", j.complemento ?? "");
      set("district", j.bairro ?? "");
      set("city", j.localidade ?? "");
      set("state", j.uf ?? "");
      set("country", "BR");
      toast.success("Endereço carregado pelo CEP");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao consultar CEP");
    }
  }

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent className="w-full sm:max-w-[860px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Minha Empresa</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="identidade">Identidade</TabsTrigger>
              <TabsTrigger value="contato">Contato</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              <TabsTrigger value="padroes">Padrões</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            <TabsContent value="identidade" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label>Logo da empresa</Label>
                <LogoUpload
                    currentLogo={form.logo_base64 ?? null}
                    onChanged={(url) => setForm(f => ({ ...f, logo_base64: url ?? undefined }))} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Nome interno</Label>
                  <Input value={String(form.name ?? "")} onChange={(e) => set("name", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <div className="flex gap-2">
                    <Input
                      value={maskCNPJ(String(form.cnpj ?? ""))}
                      onChange={(e) => setDigits("cnpj", e.target.value)}
                      onBlur={lookupCnpj}
                      inputMode="numeric"
                      placeholder="00.000.000/0000-00"
                    />
                    <Button type="button" variant="outline" size="icon" title="Buscar CNPJ" onClick={lookupCnpj}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Razão social</Label>
                  <Input value={String(form.legal_name ?? "")} onChange={(e) => set("legal_name", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Nome fantasia</Label>
                  <Input value={String(form.trade_name ?? "")} onChange={(e) => set("trade_name", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>IE</Label>
                  <Input value={String(form.ie ?? "")} onChange={(e) => set("ie", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>IM</Label>
                  <Input value={String(form.im ?? "")} onChange={(e) => set("im", e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contato" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={String(form.email ?? "")} onChange={(e) => set("email", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={maskPhoneBR(String(form.phone ?? ""))}
                    onChange={(e) => setDigits("phone", e.target.value)}
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Website</Label>
                  <Input value={String(form.website ?? "")} onChange={(e) => set("website", e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="endereco" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      value={maskCep(String(form.zip_code ?? ""))}
                      onChange={(e) => setDigits("zip_code", e.target.value)}
                      onBlur={lookupCep}
                      inputMode="numeric"
                      placeholder="00000-000"
                    />
                    <Button type="button" variant="outline" size="icon" title="Buscar CEP" onClick={lookupCep}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>UF</Label>
                  <Input value={String(form.state ?? "")} onChange={(e) => set("state", e.target.value)} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Rua / Número</Label>
                  <Input value={String(form.address_line1 ?? "")} onChange={(e) => set("address_line1", e.target.value)} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Complemento</Label>
                  <Input value={String(form.address_line2 ?? "")} onChange={(e) => set("address_line2", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input value={String(form.district ?? "")} onChange={(e) => set("district", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input value={String(form.city ?? "")} onChange={(e) => set("city", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>País</Label>
                  <Input value={String(form.country ?? "BR")} onChange={(e) => set("country", e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="padroes" className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Conta bancária padrão</Label>
                  <Select
                    value={form.default_bank_account_id ? String(form.default_bank_account_id) : "none"}
                    onValueChange={(v) =>
                      set("default_bank_account_id", v === "none" ? null : Number(v))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {props.bankAccounts
                        .filter((b) => b.is_active ?? true)
                        .map((b) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            #{b.id} {b.name || b.bank_name || "Conta"}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium">Permitir estoque negativo</div>
                    <div className="text-sm text-muted-foreground">
                      Útil para operação rápida; pode ser bloqueado depois.
                    </div>
                  </div>
                  <Switch
                    checked={Boolean(form.allow_negative_stock)}
                    onCheckedChange={(v) => set("allow_negative_stock", v)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="status" className="mt-4 space-y-4">
              <div className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <div className="font-medium">Empresa ativa</div>
                  <div className="text-sm text-muted-foreground">Desative para bloquear uso operacional.</div>
                </div>
                <Switch
                  checked={Boolean(form.is_active ?? true)}
                  onCheckedChange={(v) => set("is_active", v)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={() => props.onOpenChange(false)} disabled={props.saving}>
            Cancelar
          </Button>
          <Button onClick={() => props.onSave(form)} disabled={props.saving}>
            {props.saving ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
