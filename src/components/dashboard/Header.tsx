"use client";

import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { MonthContext } from "@/lib/finance";
import { MonthPicker } from "./MonthPicker";
import { CreateMenu } from "./CreateMenu";
import { UserMenu } from "./UserMenu";
import type { AccountInfo } from "./Dashboard";

export function Header({
  ctx,
  onPrev,
  onNext,
  onToday,
  onPick,
  isCurrent,
  account,
}: {
  ctx: MonthContext;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onPick: (year: number, month: number) => void;
  isCurrent: boolean;
  account?: AccountInfo;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="relative size-9 overflow-hidden rounded-xl">
            <Image
              src="/logo.png"
              alt="MoneyManager"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-foreground">MoneyManager</p>
            <p className="text-xs text-muted">Suas economias, organizadas</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <MonthPicker
            ctx={ctx}
            onPrev={onPrev}
            onNext={onNext}
            onToday={onToday}
            onPick={onPick}
            isCurrent={isCurrent}
          />
          <ThemeToggle />
          <CreateMenu />
          {account && <UserMenu account={account} />}
        </div>
      </div>
    </header>
  );
}
