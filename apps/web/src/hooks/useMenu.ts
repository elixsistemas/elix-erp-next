import { MENU_CONFIG, type MenuItem } from "@/app/menu.config";
import { useAuth } from "@/contexts/AuthContext";

function hasPerm(item: MenuItem, perms: string[]) {
  if (!item.perm) return true;
  return perms.includes(item.perm);
}

function isModuleEnabled(moduleKey: string | undefined, enabled: string[]) {
  if (!moduleKey) return true;
  return enabled.includes(moduleKey);
}

function filterMenu(
  items: MenuItem[],
  enabledModules: string[],
  perms: string[],
  inheritedModule?: string
): MenuItem[] {
  return items
    .map((item) => {
      const effectiveModule = item.module ?? inheritedModule;

      if (item.children?.length) {
        if (!isModuleEnabled(item.module, enabledModules)) {
          console.warn("[MENU] grupo bloqueado por module:", item.key, item.module, enabledModules);
          return null;
        }

        const children = filterMenu(item.children, enabledModules, perms, effectiveModule);

        if (children.length === 0) {
          console.warn("[MENU] grupo sem filhos visíveis:", item.key, item.label);
          return null;
        }

        return { ...item, children };
      }

      if (!isModuleEnabled(effectiveModule, enabledModules)) {
        console.warn("[MENU] item bloqueado por module:", item.key, effectiveModule, enabledModules);
        return null;
      }

      if (!hasPerm(item, perms)) {
        console.warn("[MENU] item bloqueado por perm:", item.key, item.perm);
        return null;
      }

      console.log("[MENU] item liberado:", item.key, item.label);
      return item;
    })
    .filter(Boolean) as MenuItem[];
}

export function useMenu() {
  const { modules, permissions } = useAuth();

  console.log("[AUTH CONTEXT] modules:", modules);
  console.log("[AUTH CONTEXT] permissions:", permissions);
  console.log("[MENU CONFIG]", MENU_CONFIG);

  return filterMenu(MENU_CONFIG, modules ?? [], permissions ?? []);
}