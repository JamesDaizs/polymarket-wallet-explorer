import { NextRequest, NextResponse } from "next/server";
import type { WalletProfile, WalletTrade } from "@/lib/types";

const XAI_API_KEY = process.env.XAI_API_KEY || "";
const XAI_URL = "https://api.x.ai/v1/chat/completions";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

interface RequestBody {
  walletData: {
    profile: WalletProfile;
    trades: WalletTrade[];
  };
  messages: ChatMessage[];
}

function buildSystemPrompt(profile: WalletProfile, trades: WalletTrade[]): string {
  const tradesSummary = trades
    .slice(0, 15)
    .map(
      (t) =>
        `${t.block_time} | ${t.question} | ${t.outcome_label} | $${t.amount_usd.toFixed(0)} @ ${t.price.toFixed(2)}`
    )
    .join("\n");

  return `You are a Polymarket trading analyst. Analyze the wallet data below.

Wallet: ${profile.address}
PnL: $${profile.total_pnl.toFixed(2)} | Volume: $${profile.total_usd_volume.toFixed(2)} | Trades: ${profile.total_trades}
Win Rate: ${(profile.win_rate * 100).toFixed(1)}% | ROI: ${(profile.roi * 100).toFixed(1)}% | Markets: ${profile.positions_count}
Avg Size: $${profile.avg_trade_size_usd.toFixed(2)} | Last Active: ${profile.last_trade_date}

Recent trades:
${tradesSummary || "None available."}

Respond in EXACTLY this format — no deviations, no extra sections:

VERDICT: [One sentence describing this trader, e.g. "Diversified swing trader with strong risk management"]

KEY TAKEAWAYS:
• [First key insight referencing their actual numbers]
• [Second key insight]
• [Third key insight]

TOP TIPS:
1. [One-sentence actionable improvement]
2. [One-sentence actionable improvement]
3. [One-sentence actionable improvement]

Rules: Keep the ENTIRE response under 150 words. Be punchy, not verbose. No headers beyond the three above. No filler phrases. Reference their actual numbers. Do not use markdown bold/italic.`;
}

export async function POST(req: NextRequest) {
  if (!XAI_API_KEY) {
    return NextResponse.json(
      { error: "XAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { walletData, messages } = body;
  if (!walletData?.profile) {
    return NextResponse.json(
      { error: "Missing wallet data" },
      { status: 400 }
    );
  }

  const systemPrompt = buildSystemPrompt(
    walletData.profile,
    walletData.trades || []
  );

  const grokMessages: { role: string; content: string }[] = [
    { role: "system", content: systemPrompt },
  ];

  if (messages.length === 0) {
    grokMessages.push({
      role: "user",
      content: "Analyze this wallet and provide a comprehensive trading report.",
    });
  } else {
    for (const msg of messages) {
      grokMessages.push({ role: msg.role, content: msg.content });
    }
  }

  try {
    const res = await fetch(XAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${XAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: grokMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`xAI API error ${res.status}: ${errText.slice(0, 500)}`);
      return NextResponse.json(
        { error: `AI service error (${res.status})` },
        { status: 502 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;
              const data = trimmed.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  controller.enqueue(encoder.encode(delta));
                }
              } catch {
                // skip malformed SSE chunks
              }
            }
          }
        } catch (err) {
          console.error("Stream processing error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("xAI fetch error:", err);
    return NextResponse.json(
      { error: "Failed to reach AI service" },
      { status: 502 }
    );
  }
}
