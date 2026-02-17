import { NavLink } from "react-router-dom";
import { useMenu } from "@/hooks/useMenu";
import type { MenuItem } from "@/app/menu.config";

function MobileItem({ item, depth = 0, onClose }: { item: MenuItem; depth?: number; onClose: () => void }) {
  const end = item.path === "/inventory"; // ✅ match exato pro saldo atual

  return (
    <NavLink
      to={item.path}
      end={end}
      onClick={onClose}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-sm transition-colors ${
          depth > 0 ? "ml-2" : ""
        } ${
          isActive
            ? "bg-indigo-600 text-white"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const menu = useMenu();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="w-64 bg-white dark:bg-slate-900 p-4 space-y-2">
        {menu.map((item) => {
          const hasChildren = !!item.children?.length;

          if (!hasChildren) {
            return <MobileItem key={item.key} item={item} onClose={onClose} />;
          }

          // grupo: mostra label e filhos
          return (
            <div key={item.key} className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {item.label}
              </div>

              <div className="space-y-1">
                {item.children!.map((child) => (
                  <MobileItem key={child.key} item={child} depth={1} onClose={onClose} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex-1 bg-black/40" onClick={onClose} />
    </div>
  );
}
