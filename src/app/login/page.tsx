"use client";

import { useState } from "react";
import { MailCheck, PiggyBank } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError("Supabase ainda não configurado (faltam as variáveis de ambiente).");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <PiggyBank className="size-6" />
          </span>
          <h1 className="text-lg font-semibold text-foreground">MoneyManager</h1>
          <p className="text-sm text-muted">Entre para organizar suas economias</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {status === "sent" ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-positive-soft text-positive">
                <MailCheck className="size-5" />
              </span>
              <p className="text-sm font-medium text-foreground">
                Link enviado!
              </p>
              <p className="text-sm text-muted">
                Enviamos um link de acesso para <b>{email}</b>. Abra seu e-mail e
                clique para entrar.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-1 text-xs text-primary hover:underline"
              >
                Usar outro e-mail
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              {status === "error" && (
                <p className="text-xs text-negative">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full justify-center"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Enviando…" : "Enviar link de acesso"}
              </Button>
              <p className="text-center text-xs text-muted">
                Sem senha. Você recebe um link seguro por e-mail.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
