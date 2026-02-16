import { NavLink } from "react-router-dom";
import { useMenu } from "@/hooks/useMenu";

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const menu = useMenu();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="w-64 bg-white dark:bg-slate-900 p-4"
      >
        {menu.map(item => (
          <NavLink
            key={item.key}
            to={item.path}
            onClick={onClose}
            className="block px-3 py-2 rounded-md text-sm text-slate-700 dark:text-slate-300"
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <div
        className="flex-1 bg-black/40"
        onClick={onClose}
      />
    </div>
  );
}
