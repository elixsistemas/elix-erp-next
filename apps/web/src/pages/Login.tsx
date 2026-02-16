// src/pages/Login.tsx
"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/contexts/AuthContext";
import { useBranding } from "@/contexts/BrandingContext";

import {
  prelogin,
  finalizeLogin,
  type CompanyLite,
} from "@/shared/api/auth.service";
import { getBrandingByCompany } from "@/shared/api/branding.service";

export default function Login() {
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [companies, setCompanies] = useState<CompanyLite[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [loginTicket, setLoginTicket] = useState("");

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { brand, setBranding, companySlug } = useBranding();
  const navigate = useNavigate();

  const brandName = useMemo(() => brand?.display_name || "Elix Sistemas", [brand]);
  const brandLogo = useMemo(() => brand?.logo_url || "/assets/elix-logo.png", [brand]);

  async function applyCompanyBranding(companyId: number) {
    try {
        const data = await getBrandingByCompany(companyId);
        setBranding(data);
    } catch {
      // mantém o branding atual (fallback/tenant)
    }
  }

  async function runFinalizeLogin(ticket: string, companyId: number) {
    // identidade viva primeiro
    await applyCompanyBranding(companyId);

    const { token } = await finalizeLogin(ticket, companyId);

    // ⚠️ login é async: evita corrida com navigate
    await login(token);

    toast.success("Login realizado com sucesso!");
    navigate("/dashboard", { replace: true });
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await prelogin(email, password);

      if (!data.loginTicket) throw new Error("Servidor não retornou loginTicket");
      if (!Array.isArray(data.companies) || data.companies.length === 0) {
        throw new Error("Usuário não possui empresas vinculadas");
      }

      setLoginTicket(data.loginTicket);
      setCompanies(data.companies);

      if (data.companies.length === 1) {
        const only = data.companies[0];
        setSelectedCompanyId(only.id);
        await runFinalizeLogin(data.loginTicket, only.id);
        return;
      }

      setSelectedCompanyId(data.companies[0].id);
      setStep(2);
      toast.info("Selecione a empresa para continuar");
    } catch (err: any) {
      toast.error("Não foi possível autenticar", {
        description: err?.message || "Verifique email/senha ou conexão",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      toast.error("Selecione uma empresa");
      return;
    }

    setLoading(true);
    try {
      await runFinalizeLogin(loginTicket, selectedCompanyId);
    } catch (err: any) {
      toast.error("Falha ao concluir login", {
        description: err?.message || "Tente novamente",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setLoginTicket("");
    setCompanies([]);
    setSelectedCompanyId(null);
    // opcional: limpar senha por segurança
    setPassword("");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-50">
      {/* Painel visual */}
      <div className="hidden lg:block relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #0b1220 0%, #0b1220 100%)" }}
        />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: `
              radial-gradient(1000px circle at 15% 15%, var(--brand-primary), transparent 55%),
              radial-gradient(900px circle at 85% 45%, var(--brand-secondary), transparent 55%)
            `,
          }}
        />
        <div className="relative z-10 p-12 h-full flex flex-col justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
              <img src={brandLogo} alt={brandName} className="h-8 w-8 object-contain" />
            </div>
            <div>
              <div className="text-xs text-white/60">Ambiente</div>
              <div className="text-lg font-semibold">{brandName}</div>
              <div className="text-xs text-white/55 font-mono">tenant: {companySlug}</div>
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-semibold leading-tight">
              ERP modular, multiempresa,
              <br />
              com identidade viva.
            </h1>
            <p className="mt-4 text-white/70 max-w-md">
              Entre com suas credenciais, selecione a empresa e o sistema assume
              a marca automaticamente — como um produto de verdade.
            </p>

            {brand.show_powered_by && (
              <p className="mt-6 text-xs text-white/55">
                Powered by{" "}
                <span className="font-medium text-white/80">Elix Sistemas Stack</span>{" "}
                — React • Node • SQL Server
              </p>
            )}
          </div>

          <div className="text-xs text-white/45">
            Dica: use <span className="font-mono">/login?company=elix</span> em dev
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md border border-gray-200 shadow-sm rounded-2xl">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                <img src={brandLogo} alt={brandName} className="h-10 w-10 object-contain" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold leading-tight">
                  {step === 1 ? "Acessar" : "Escolher empresa"}
                </CardTitle>
                <CardDescription className="text-sm">
                  {step === 1
                    ? `Entrar no ambiente: ${brandName}`
                    : "Selecione qual empresa deseja acessar"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full text-white"
                  style={{ background: "var(--brand-primary)" }}
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Selecione a empresa</Label>
                  <select
                    id="company"
                    className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background
                      file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                      disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCompanyId ?? ""}
                    onChange={async (e) => {
                      const id = Number(e.target.value);
                      setSelectedCompanyId(id);
                      if (id) await applyCompanyBranding(id);
                    }}
                    disabled={loading}
                    required
                  >
                    <option value="" disabled>
                      Escolha uma empresa
                    </option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full text-white"
                  style={{ background: "var(--brand-primary)" }}
                  disabled={loading || companies.length === 0}
                >
                  {loading ? "Finalizando..." : "Entrar na empresa"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={loading}
                  onClick={handleBackToStep1}
                >
                  Voltar
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
            <p>Não tem conta? Entre em contato com o administrador.</p>
            {brand.show_powered_by && (
              <p className="opacity-70">
                Powered by <span className="font-medium">Elix Sistemas Stack</span>
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
