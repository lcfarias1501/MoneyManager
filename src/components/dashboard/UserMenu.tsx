"use client";

import { LogOut } from "lucide-react";
import { Menu, MenuItem, MenuSeparator } from "@/components/ui/menu";
import type { AccountInfo } from "./Dashboard";

export function UserMenu({ account }: { account: AccountInfo }) {
  const initial = (account.email?.[0] ?? "?").toUpperCase();

  return (
    <Menu
      triggerAriaLabel="Conta"
      triggerContent={initial}
      triggerClassName="flex size-9 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="px-2.5 py-2">
        <p className="text-[11px] text-muted-2">Conectado como</p>
        <p className="truncate text-sm font-medium text-foreground">
          {account.email ?? "—"}
        </p>
      </div>
      <MenuSeparator />
      <MenuItem
        icon={<LogOut className="size-4" />}
        tone="danger"
        onSelect={() => account.onSignOut()}
      >
        Sair da conta
      </MenuItem>
    </Menu>
  );
}
