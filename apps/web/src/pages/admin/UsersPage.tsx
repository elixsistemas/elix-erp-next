import * as React from "react";
import { Api, type UserLookupResult } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type Role = { id: number; code: string; name: string };
type User = { id: number; name: string; email: string; active: boolean };

type LookupUser = {
  id: number;
  name: string;
  email: string;
  active: boolean;
  created_at?: string;
};

type ImportSource = { companyId: number; name: string };

type LookupResult = {
  exists: boolean;
  linked: boolean;
  user: LookupUser | null;
  importSources: ImportSource[];
};

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [active, setActive] = React.useState(true);
  const [roleIds, setRoleIds] = React.useState<number[]>([]);

  const [editingUserId, setEditingUserId] = React.useState<number | null>(null);
  const [editingRoleIds, setEditingRoleIds] = React.useState<number[]>([]);

  // ✅ lookup estado
  const [lookupLoading, setLookupLoading] = React.useState(false);
  const [lookup, setLookup] = React.useState<UserLookupResult | null>(null);

  // ✅ importar roles
  const [importEnabled, setImportEnabled] = React.useState(false);
  const [importFromCompanyId, setImportFromCompanyId] = React.useState<number | "">("");

  async function refresh() {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([Api.users.list(), Api.roles.list()]);
      setUsers(u as any);
      setRoles(r as any);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { refresh(); }, []);

  function toggleRole(list: number[], id: number) {
    return list.includes(id) ? list.filter(x => x !== id) : [...list, id];
  }

  // ✅ Debounce simples do lookup (evita martelar API digitando)
  const lookupTimer = React.useRef<number | null>(null);

  function resetLookupUI() {
    setLookup(null);
    setLookupLoading(false);
    setImportEnabled(false);
    setImportFromCompanyId("");
  }

  async function doLookup(emailValue: string) {
    const e = emailValue.trim().toLowerCase();
    if (!e) return resetLookupUI();

    // validação básica de email pra não chamar endpoint à toa
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setLookup(null);
      return;
    }

    setLookupLoading(true);
    try {
      const res = await Api.users.lookup(e);
      setLookup(res);

      // se existe usuário, preenche nome automaticamente (sem forçar)
      if (res.exists && res.user?.name && !name.trim()) {
        setName(res.user.name);
      }

      // se já está vinculado na empresa, desliga import
      if (res.linked) {
        setImportEnabled(false);
        setImportFromCompanyId("");
      } else {
        const first = res.importSources?.[0]?.companyId;
        if (first) setImportFromCompanyId(first);
      }
    } catch (err: any) {
      // Se lookup falhar, não bloqueia criação normal.
      setLookup(null);
    } finally {
      setLookupLoading(false);
    }
  }

  function onEmailChange(v: string) {
    setEmail(v);

    // limpa import/lookup enquanto digita
    if (lookupTimer.current) window.clearTimeout(lookupTimer.current);
    lookupTimer.current = window.setTimeout(() => {
      void doLookup(v);
    }, 350);
  }

  const mode = React.useMemo(() => {
    if (!lookup) return "unknown";
    if (!lookup.exists) return "create";
    if (lookup.exists && lookup.linked) return "already_linked";
    return "link";
  }, [lookup]);

  const showPassword = mode === "create"; // só exige senha se for novo usuário global

  async function handleSubmit() {
    try {
      if (!email.trim()) return toast.error("Informe o e-mail");
      const emailNorm = email.trim().toLowerCase();

      // força lookup final antes de enviar (segurança/consistência)
      const finalLookup = await Api.users.lookup(emailNorm) as LookupResult;
      setLookup(finalLookup);

      if (!finalLookup.exists) {
        // ✅ CRIAR (novo usuário global)
        if (!name.trim()) return toast.error("Informe o nome");
        if (password.length < 6) return toast.error("Senha mínima: 6");

        await Api.users.create({ name, email: emailNorm, password, active, roleIds });
        toast.success("Usuário criado");
      } else if (finalLookup.linked) {
        // ✅ já está na empresa
        return toast.info("Este usuário já está vinculado nesta empresa. Use 'Roles' para ajustar.");
      } else {
        // ✅ VINCULAR (usuário já existe em outra empresa)
        // senha NÃO é necessária
        const payload: any = {
          email: emailNorm,
          name: name.trim() || undefined, // opcional
          active,
          roleIds, // usado se NÃO importar
        };

        if (importEnabled && importFromCompanyId) {
          payload.import = {
            enabled: true,
            fromCompanyId: Number(importFromCompanyId),
            mode: "roles",
          };
        }

        await Api.users.link(payload);
        toast.success(importEnabled ? "Usuário vinculado (roles importadas)" : "Usuário vinculado");
      }

      // reset form
      setName("");
      setEmail("");
      setPassword("");
      setActive(true);
      setRoleIds([]);
      resetLookupUI();
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    }
  }

  async function openRoles(u: User) {
    try {
      setEditingUserId(u.id);
      const userRoles = await Api.users.getRoles(u.id) as any[];
      setEditingRoleIds(userRoles.map(r => r.id));
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao carregar roles do usuário");
    }
  }

  async function saveRoles() {
    try {
      if (!editingUserId) return;
      await Api.users.setRoles(editingUserId, editingRoleIds);
      toast.success("Roles atualizadas");
      setEditingUserId(null);
      setEditingRoleIds([]);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar roles");
    }
  }

  async function toggleActive(u: User) {
    try {
      await Api.users.update(u.id, { active: !u.active });
      toast.success("Atualizado");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao atualizar");
    }
  }

  const actionLabel =
    mode === "link" ? "Vincular usuário" :
    mode === "already_linked" ? "Já vinculado" :
    "Criar usuário";

  const actionDisabled = mode === "already_linked" || lookupLoading;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Usuários</h1>

      <div className="border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" />
          </div>

          <div className="space-y-1">
            <Label>E-mail</Label>
            <Input
              value={email}
              onChange={e => onEmailChange(e.target.value)}
              placeholder="email@empresa.com"
            />
            <div className="text-xs text-muted-foreground">
              {lookupLoading ? "Verificando usuário..." : (
                lookup?.exists
                  ? (lookup.linked ? "Usuário já está nesta empresa." : "Usuário já existe. Você pode vincular.")
                  : (lookup ? "Usuário novo. Será criado nesta empresa." : "")
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={!showPassword}
              placeholder={showPassword ? "Defina uma senha" : "Não necessário ao vincular"}
            />
            {!showPassword && (
              <div className="text-xs text-muted-foreground">
                Ao vincular usuário existente, a senha não é alterada.
              </div>
            )}
          </div>
        </div>

        {mode === "link" && lookup?.user && (
          <div className="border rounded-md p-3 bg-muted/20">
            <div className="text-sm font-medium">Usuário encontrado</div>
            <div className="text-sm text-muted-foreground">
              {lookup.user.name} • {lookup.user.email}
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={importEnabled}
                  onCheckedChange={(v) => setImportEnabled(Boolean(v))}
                />
                <span className="text-sm">Importar roles de outra empresa (opcional)</span>
              </div>

              {importEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="space-y-1 md:col-span-2">
                    <Label>Empresa de origem</Label>
                    <select
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={importFromCompanyId}
                      onChange={(e) => setImportFromCompanyId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">Selecione...</option>
                      {(lookup.importSources ?? []).map((c) => (
                        <option key={c.companyId} value={c.companyId}>
                          {c.name} (#{c.companyId})
                        </option>
                      ))}
                    </select>
                    <div className="text-xs text-muted-foreground">
                      Segurança: o servidor só permite importar de empresas que você também acessa.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Checkbox checked={active} onCheckedChange={(v) => setActive(Boolean(v))} />
          <span className="text-sm">Ativo</span>
        </div>

        <div className="space-y-2">
          <Label>Roles</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {roles.map(r => (
              <label key={r.id} className="flex items-center gap-2 border rounded p-2">
                <Checkbox checked={roleIds.includes(r.id)} onCheckedChange={() => setRoleIds(prev => toggleRole(prev, r.id))} />
                <span className="text-sm">
                  {r.name} <span className="text-muted-foreground">({r.code})</span>
                </span>
              </label>
            ))}
          </div>

          {mode === "link" && importEnabled && (
            <div className="text-xs text-muted-foreground">
              Ao importar, as roles acima são ignoradas (o destino recebe as roles mapeadas por <b>code</b>).
            </div>
          )}
        </div>

        <Button onClick={handleSubmit} disabled={actionDisabled}>
          {actionLabel}
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-64">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4}>Carregando...</TableCell></TableRow>
            ) : users.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.active ? "Ativo" : "Inativo"}</TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" onClick={() => openRoles(u)}>Roles</Button>
                  <Button variant="outline" onClick={() => toggleActive(u)}>
                    {u.active ? "Inativar" : "Ativar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingUserId && (
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Editar roles do usuário #{editingUserId}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {roles.map(r => (
              <label key={r.id} className="flex items-center gap-2 border rounded p-2">
                <Checkbox
                  checked={editingRoleIds.includes(r.id)}
                  onCheckedChange={() => setEditingRoleIds(prev => toggleRole(prev, r.id))}
                />
                <span className="text-sm">{r.name} <span className="text-muted-foreground">({r.code})</span></span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={saveRoles}>Salvar</Button>
            <Button variant="ghost" onClick={() => { setEditingUserId(null); setEditingRoleIds([]); }}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  );
}