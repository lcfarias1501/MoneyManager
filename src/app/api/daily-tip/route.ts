import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import type { TipSummary } from "@/lib/ai/tip-summary";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Você é um copiloto financeiro pessoal, amigável e direto, que fala português de Portugal (moeda: euro).
A cada dia você escreve UMA dica curta (no máximo 2 frases) para a pessoa, com base no resumo financeiro do mês dela.
Tom: caloroso e humano, como um amigo que entende de dinheiro. Use princípios de economia comportamental (pequenos empurrões que reduzem gastos por impulso e reforçam metas).
Regras:
- Se o dinheiro está apertado (pouco disponível, categorias no limite), aconselhe segurar a mão, com gentileza.
- Se há folga, incentive aproveitar sem culpa, dentro do orçamento.
- Mencione valores em euros de forma natural (ex.: "125,40 €") quando fizer sentido.
- Seja específico usando os números do resumo, mas natural — nada de listas nem markdown.
- Responda APENAS com a frase da dica, sem saudações como "Olá" nem preâmbulos. Pode usar 1 emoji no máximo.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  // Not configured yet → let the client fall back to the local tip.
  if (!apiKey) return NextResponse.json({ tip: null, reason: "not_configured" });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ tip: null, reason: "unauthorized" }, { status: 401 });

  let body: { summary?: TipSummary; date?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ tip: null, reason: "bad_request" }, { status: 400 });
  }

  const summary = body.summary;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "")
    ? body.date!
    : new Date().toISOString().slice(0, 10);

  if (!summary || !summary.hasData) {
    return NextResponse.json({ tip: null, reason: "no_data" });
  }

  // Already generated today? Return the cached one (no API cost).
  const { data: existing } = await supabase
    .from("daily_tips")
    .select("message")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();
  if (existing?.message) {
    return NextResponse.json({ tip: existing.message, cached: true });
  }

  // Generate a fresh tip.
  let message: string;
  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content:
            "Resumo financeiro do mês (JSON). Escreva a dica de hoje:\n" +
            JSON.stringify(summary),
        },
      ],
    });
    message = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();
  } catch (err) {
    console.error("Anthropic error:", err);
    return NextResponse.json({ tip: null, reason: "ai_error" }, { status: 502 });
  }

  if (!message) return NextResponse.json({ tip: null, reason: "empty" });

  // Store it (ignore duplicate if a concurrent request already inserted).
  const { error: insertError } = await supabase
    .from("daily_tips")
    .upsert(
      { user_id: user.id, date, message },
      { onConflict: "user_id,date", ignoreDuplicates: true },
    );
  if (insertError) console.error("daily_tips insert:", insertError.message);

  return NextResponse.json({ tip: message, cached: false });
}
