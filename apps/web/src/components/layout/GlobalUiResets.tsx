import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function GlobalUiResets() {
  const loc = useLocation();

  useEffect(() => {
    // limpa overlays/portals presos (Radix/shadcn)
    document.querySelectorAll("[data-radix-portal]").forEach((el) => el.remove());

    // desfaz locks de scroll/pointer
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    document.documentElement.style.pointerEvents = "";
    document.documentElement.style.overflow = "";
    document.body.removeAttribute("data-scroll-locked");
  }, [loc.pathname]);

  return null;
}