import * as React from "react";
import { Api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Role = { id: number; code: string; name: string; active: boolean };
type Perm = { code: string; description?: string; module?: string };

  const ACTION_LABELS: Record<string, string> = {
    read: "Ver",
    create: "Criar",
    update: "Editar",
    delete: "Excluir",
    grant: "Conceder",
    manage: "Gerenciar",
  };

export default function RolesPage() {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [perms, setPerms] = React.useState<Perm[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [code, setCode] = React.useState("");
  const [name, setName] = React.useState("");

  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  const [granted, setGranted] = React.useState<string[]>([]);

  async function refresh() {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([Api.roles.list(), Api.roles.permsCatalog()]);
      setRoles(r as any);
      setPerms(p as any);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  async function createRole() {
    try {
      if (!code.trim()) return toast.error("Informe o code");
      if (!name.trim()) return toast.error("Informe o nome");
      await Api.roles.create({ code, name });
      toast.success("Role criada");
      setCode("");
      setName("");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao criar role");
    }
  }

  async function openPermissions(r: Role) {
    try {
      setEditingRole(r);
      const g = (await Api.roles.granted(r.id)) as string[];
      setGranted(g);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao carregar permissões");
    }
  }

  const toggle = React.useCallback((code: string) => {
    setGranted((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));
  }, []);

  async function savePermissions() {
    try {
      if (!editingRole) return;
      await Api.roles.grant(editingRole.id, granted);
      toast.success("Permissões atualizadas");
      setEditingRole(null);
      setGranted([]);
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao salvar");
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">Roles & Permissões</h1>

      <div className="border rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Code (ex: seller, finance)</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <Button onClick={createRole}>Criar role</Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-52">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>Carregando...</TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Nenhuma role cadastrada
                </TableCell>
              </TableRow>
            ) : (
              roles.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.code}</TableCell>
                  <TableCell>{r.active ? "Ativa" : "Inativa"}</TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => openPermissions(r)}>
                      Permissões
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingRole && (
        <div className="border rounded-lg overflow-hidden">
          {/* Header sticky (fica fixo enquanto rola as permissões) */}
          <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="font-semibold">
                Permissões da role: {editingRole.name} ({editingRole.code})
              </h2>
              <div className="text-sm text-muted-foreground">{granted.length} marcadas</div>
            </div>

            <div className="flex gap-2">
              <Button onClick={savePermissions}>Salvar</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingRole(null);
                  setGranted([]);
                }}
              >
                Fechar
              </Button>
            </div>
          </div>

          {/* Corpo scrollável */}
          <div className="p-4 max-h-[75vh] overflow-y-auto">
            <PermissionsMatrix perms={perms} granted={granted} onToggle={toggle} onSetGranted={setGranted} />
          </div>
        </div>
      )}
    </div>
  );
}

function PermissionsMatrix({
  perms,
  granted,
  onToggle,
  onSetGranted,
}: {
  perms: Perm[];
  granted: string[];
  onToggle: (code: string) => void;
  onSetGranted: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [q, setQ] = React.useState("");

  const grantedSet = React.useMemo(() => new Set(granted), [granted]);

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return perms;
    return perms.filter((p) =>
      `${p.code} ${p.description ?? ""} ${p.module ?? ""}`.toLowerCase().includes(qq)
    );
  }, [perms, q]);

  // module -> resource -> perms[]
  const tree = React.useMemo(() => {
    const map = new Map<string, Map<string, Perm[]>>();

    for (const p of filtered) {
      const mod = p.module || "outros";
      const resource = getResource(p.code);

      if (!map.has(mod)) map.set(mod, new Map());
      const m = map.get(mod)!;

      if (!m.has(resource)) m.set(resource, []);
      m.get(resource)!.push(p);
    }

    const out = [...map.entries()].map(([mod, resources]) => {
      const resourcesArr = [...resources.entries()].map(([res, list]) => {
        list.sort((a, b) => a.code.localeCompare(b.code));
        return [res, list] as const;
      });
      resourcesArr.sort((a, b) => a[0].localeCompare(b[0]));
      return [mod, resourcesArr] as const;
    });

    out.sort((a, b) => a[0].localeCompare(b[0]));
    return out;
  }, [filtered]);

  function isGranted(code: string) {
    return grantedSet.has(code);
  }

  function toggleMany(codes: string[], next: boolean) {
    onSetGranted((prev) => {
      const set = new Set(prev);
      for (const c of codes) {
        if (next) set.add(c);
        else set.delete(c);
      }
      return [...set];
    });
  }

  function moduleStats(modResources: readonly (readonly [string, Perm[]])[]) {
    const allCodes = modResources.flatMap(([, list]) => list.map((p) => p.code));
    const on = allCodes.reduce((acc, c) => acc + (isGranted(c) ? 1 : 0), 0);
    return { on, total: allCodes.length, allCodes };
  }

  function resourceStats(list: Perm[]) {
    const allCodes = list.map((p) => p.code);
    const on = allCodes.reduce((acc, c) => acc + (isGranted(c) ? 1 : 0), 0);
    return { on, total: allCodes.length, allCodes };
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar permissões (ex: users, delete, finance...)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <Accordion type="multiple" className="w-full">
        {tree.map(([mod, resources]) => {
          const ms = moduleStats(resources);
          const anyOn = ms.on > 0;

          return (
            <AccordionItem key={mod} value={mod} className="border rounded-lg px-3">
              <div className="flex items-center gap-3 py-3">
                <AccordionTrigger className="flex-1 py-0 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="font-medium capitalize">{mod}</div>
                    <Badge variant="secondary">
                      {ms.on}/{ms.total}
                    </Badge>
                  </div>
                </AccordionTrigger>

                <div className="ml-auto flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMany(ms.allCodes, true);
                    }}
                  >
                    Marcar tudo
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMany(ms.allCodes, false);
                    }}
                    disabled={!anyOn}
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              <AccordionContent className="pb-4">
                <div className="space-y-4">
                  {resources.map(([resource, list]) => {
                    const rs = resourceStats(list);
                    const actions = getActions(list);

                    return (
                      <div key={resource} className="border rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="font-medium">{resource}</div>
                          <Badge variant="secondary">
                            {rs.on}/{rs.total}
                          </Badge>

                          <div className="ml-auto flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => toggleMany(rs.allCodes, true)}
                            >
                              Marcar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => toggleMany(rs.allCodes, false)}
                              disabled={rs.on === 0}
                            >
                              Limpar
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 overflow-x-auto">
                          <div className="min-w-[520px] grid gap-2">
                            {actions.map((row) => {
                              const cols = (Object.keys(row.codes) as (keyof typeof row.codes)[])
                                .filter((a) => Boolean(row.codes[a]));

                              return (
                                <React.Fragment key={row.key}>
                                  <div
                                    className="grid gap-2 text-xs text-muted-foreground"
                                    style={{ gridTemplateColumns: `220px repeat(${cols.length}, minmax(0, 1fr))` }}
                                  >
                                    <div>Recurso</div>
                                    {cols.map((a) => (
                                      <div key={String(a)} className="text-center">
                                        {ACTION_LABELS[String(a)] ?? String(a)}
                                      </div>
                                    ))}
                                  </div>

                                  <div
                                    className="grid gap-2 items-center border rounded-md p-2"
                                    style={{ gridTemplateColumns: `220px repeat(${cols.length}, minmax(0, 1fr))` }}
                                  >
                                    <div className="text-sm">
                                      <div className="font-medium">{row.label}</div>
                                      <div className="text-xs text-muted-foreground line-clamp-1">{row.hint}</div>
                                    </div>

                                    {cols.map((a) => {
                                      const code = row.codes[a];
                                      const checked = code ? isGranted(code) : false;

                                      return (
                                        <div key={String(a)} className="flex justify-center">
                                          {code ? (
                                            <Checkbox checked={checked} onCheckedChange={() => onToggle(code)} />
                                          ) : null}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {resources.length === 0 && (
                    <div className="text-sm text-muted-foreground">Nenhuma permissão neste módulo.</div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem> 
          );
        })}
      </Accordion>
    </div>
  );
}

function getResource(code: string) {
  const parts = String(code || "").split(".");
  return parts[0] || "geral";
}

function getAction(code: string) {
  const parts = String(code || "").split(".");
  return parts[1] || "other";
}

function getActions(list: Perm[]) {
  const byRes = new Map<string, Perm[]>();
  for (const p of list) {
    const r = getResource(p.code);
    if (!byRes.has(r)) byRes.set(r, []);
    byRes.get(r)!.push(p);
  }

  const rows = [...byRes.entries()].map(([res, perms]) => {
    const codes: Record<string, string | undefined> = {};
    let hint = "";

    for (const p of perms) {
      const a = getAction(p.code);
      codes[a] = p.code;
      if (!hint || a === "read") hint = p.description || hint;
    }

    return {
      key: res,
      label: res,
      hint,
      codes: {
        read: codes["read"],
        create: codes["create"],
        update: codes["update"],
        delete: codes["delete"],
        grant: codes["grant"],
        manage: codes["manage"],
      } as Record<"read" | "create" | "update" | "delete" | "grant" | "manage", string | undefined>,
    };
  });

  rows.sort((a, b) => a.label.localeCompare(b.label));
  return rows;
}