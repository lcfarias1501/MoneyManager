"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataProvider } from "@/lib/data/store";
import { localStorageRepository } from "@/lib/data/repository";
import { createClient } from "@/lib/supabase/client";
import { supabaseRepository } from "@/lib/supabase/repository";
import { Dashboard } from "@/components/dashboard/Dashboard";

export function AppShell({
  userId,
  email,
}: {
  userId?: string;
  email?: string;
}) {
  const router = useRouter();

  const { repo, account } = useMemo(() => {
    if (!userId) {
      return { repo: localStorageRepository, account: undefined };
    }
    const supabase = createClient();
    return {
      repo: supabaseRepository(supabase, userId),
      account: {
        email,
        onSignOut: async () => {
          await supabase.auth.signOut();
          router.push("/login");
          router.refresh();
        },
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, email]);

  return (
    <DataProvider repo={repo}>
      <Dashboard account={account} />
    </DataProvider>
  );
}
