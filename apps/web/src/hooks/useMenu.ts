// apps/web/src/hooks/useMenu.ts
import { MENU_CONFIG, type MenuItem } from "@/app/menu.config";
import { useAuth } from "@/contexts/AuthContext";

function filterMenuByModules(items: MenuItem[], modules: string[]): MenuItem[] {
  return items
    .map((item) => {
      if (item.children?.length) {
        const children = filterMenuByModules(item.children, modules);
        if (children.length === 0) return null;

        // pai pode ou não estar em modules; ele aparece se tiver filho
        return { ...item, children };
      }

      // item simples: só aparece se módulo está liberado
      return modules.includes(item.key) ? item : null;
    })
    .filter(Boolean) as MenuItem[];
}

export function useMenu() {
  const { modules } = useAuth();
  return filterMenuByModules(MENU_CONFIG, modules ?? []);
}
