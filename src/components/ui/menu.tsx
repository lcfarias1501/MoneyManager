"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const MenuCloseCtx = createContext<() => void>(() => {});
export const useMenuClose = () => useContext(MenuCloseCtx);

export function Menu({
  triggerContent,
  triggerClassName,
  triggerAriaLabel,
  align = "end",
  panelClassName,
  children,
}: {
  triggerContent: React.ReactNode;
  triggerClassName?: string;
  triggerAriaLabel: string;
  align?: "start" | "end";
  panelClassName?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        aria-label={triggerAriaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
      >
        {triggerContent}
      </button>
      {open && (
        <MenuCloseCtx.Provider value={close}>
          <div
            role="menu"
            className={cn(
              "absolute top-full z-40 mt-2 min-w-52 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg",
              "animate-[menuIn_.12s_ease-out]",
              align === "end" ? "right-0" : "left-0",
              panelClassName,
            )}
          >
            {children}
          </div>
        </MenuCloseCtx.Provider>
      )}
      <style>{`@keyframes menuIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}

export function MenuItem({
  icon,
  children,
  onSelect,
  disabled,
  tone = "default",
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}) {
  const close = useMenuClose();
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        onSelect?.();
        close();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-40",
        tone === "danger"
          ? "text-negative hover:bg-negative-soft"
          : "text-foreground hover:bg-surface-2",
      )}
    >
      {icon && <span className="shrink-0 text-muted-2">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-2">
      {children}
    </p>
  );
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-border" />;
}
