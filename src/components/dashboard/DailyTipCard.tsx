"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { formatCurrency, toISODate } from "@/lib/format";
import type { TipSummary } from "@/lib/ai/tip-summary";

/**
 * The "co-piloto" daily tip. When Supabase auth is active and the Anthropic key
 * is configured server-side, it fetches a tip generated once per day by Claude
 * (Haiku). Otherwise it falls back to a local rule-based message.
 */
export function DailyTipCard({
  summary,
  enabled,
}: {
  summary: TipSummary;
  enabled: boolean;
}) {
  const [aiTip, setAiTip] = useState<string | null>(null);
  const summaryRef = useRef(summary);
  summaryRef.current = summary;

  useEffect(() => {
    if (!enabled || !summary.hasData) return;
    let alive = true;
    fetch("/api/daily-tip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: summaryRef.current,
        date: toISODate(new Date()),
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.tip) setAiTip(d.tip as string);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [enabled, summary.hasData]);

  const tip = aiTip ?? buildLocalTip(summary);
  const byAI = Boolean(aiTip);

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-gradient-to-br from-primary-soft to-surface p-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Dica do dia</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted">
              {byAI ? "por Claude" : "automática"}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">{tip}</p>
          {byAI && (
            <p className="mt-2 text-xs text-muted">
              Gerada por IA — atualiza uma vez por dia.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function buildLocalTip(s: TipSummary): string {
  if (!s.hasData) {
    return "Comece registrando suas entradas e custos fixos para eu calcular sua base do mês.";
  }
  if (s.available <= 0) {
    return "Melhor segurar a mão hoje — o disponível do mês já está no limite. 🛑";
  }
  const perDay = formatCurrency(Math.max(0, s.dailyAllowance), s.currency);
  return `Você tem ${formatCurrency(
    s.available,
    s.currency,
  )} livres para o resto do mês — cerca de ${perDay} por dia. Dá pra aproveitar sem culpa. ✨`;
}
