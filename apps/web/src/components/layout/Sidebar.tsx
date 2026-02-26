import { NavLink } from "react-router-dom";
import { useMenu } from "@/hooks/useMenu";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MenuItem } from "@/app/menu.config";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

function ItemLink({ item, depth = 0 }: { item: MenuItem; depth?: number }) {
  const end = item.path === "/inventory"; // ✅ só o saldo atual precisa ser exato

  return (
    <NavLink
      to={item.path}
      end={end}
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


export function Sidebar() {
  const menu = useMenu();
  const { company } = useAuth();

  const [open, setOpen] = useState<Record<string, boolean>>({
    cadastros: true,
  });

  // ✅ reset quando mudar a empresa (troca de contexto)
  useEffect(() => {
    setOpen({ cadastros: true });
  }, [company?.id]);

  return (
    <nav className="w-full p-4 space-y-2">
      {menu.map((item) => {
        const hasChildren = !!item.children?.length;

        if (!hasChildren) {
          return <ItemLink key={item.key} item={item} />;
        }

        const isOpen = !!open[item.key];

        return (
          <div key={item.key} className="space-y-1">
            <button
              type="button"
              onClick={() => setOpen((p) => ({ ...p, [item.key]: !p[item.key] }))}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="font-medium">{item.label}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="space-y-1">
                {item.children!.map((child) => (
                  <ItemLink key={child.key} item={child} depth={1} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
