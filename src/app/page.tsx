import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  // Local-only mode while Supabase isn't configured: no login required.
  if (!isSupabaseConfigured) {
    return <AppShell />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <AppShell userId={user.id} email={user.email ?? undefined} />;
}
