import * as React from "react";
import { Api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type Role = { id: number; code: string; name: string };
type User = { id: number; name: string; email: string; active: boolean };

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

  async function handleCreate() {
    try {
      if (!name.trim()) return toast.error("Informe o nome");
      if (!email.trim()) return toast.error("Informe o e-mail");
      if (password.length < 6) return toast.error("Senha mínima: 6");

      await Api.users.create({ name, email, password, active, roleIds });
      toast.success("Usuário criado");
      setName(""); setEmail(""); setPassword(""); setActive(true); setRoleIds([]);
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao criar");
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

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Usuários</h1>

      <div className="border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>E-mail</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Senha</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </div>

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
                <span className="text-sm">{r.name} <span className="text-muted-foreground">({r.code})</span></span>
              </label>
            ))}
          </div>
        </div>

        <Button onClick={handleCreate}>Criar usuário</Button>
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