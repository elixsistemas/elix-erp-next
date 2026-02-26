// apps/web/src/hooks/useMenu.ts
import { MENU_CONFIG, type MenuItem } from "@/app/menu.config";
import { useAuth } from "@/contexts/AuthContext";

function hasPerm(item: MenuItem, perms: string[]) {
  if (!item.perm) return true;
  return perms.includes(item.perm);
}

function moduleKeyOf(item: MenuItem): string {
  return (item.module ?? item.key).trim();
}

function hasModule(item: MenuItem, modules: string[]) {
  if (item.key === "home") return true;
  return modules.includes(moduleKeyOf(item));
}

function filterMenu(items: MenuItem[], modules: string[], perms: string[]): MenuItem[] {
  return items
    .map((item) => {
      if (item.children?.length) {
        const children = filterMenu(item.children, modules, perms);
        if (children.length === 0) return null;
        return { ...item, children };
      }

      if (!hasModule(item, modules)) return null;
      if (!hasPerm(item, perms)) return null;

      return item;
    })
    .filter(Boolean) as MenuItem[];
}

export function useMenu() {
  const { modules, permissions } = useAuth();
  return filterMenu(MENU_CONFIG, modules ?? [], permissions ?? []);
}