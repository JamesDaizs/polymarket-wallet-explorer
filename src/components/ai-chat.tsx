"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import type { WalletProfile, WalletTrade } from "@/lib/types";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const SUGGESTION_CHIPS = [
  "What markets should I focus on?",
  "How can I improve my win rate?",
  "Compare me to top traders",
  "What's my biggest risk?",
];

interface Props {
  profile: WalletProfile;
  trades: WalletTrade[];
}

export function AIChat({ profile, trades }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const [hasAskedFollowUp, setHasAskedFollowUp] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const streamResponse = useCallback(
    async (allMessages: Message[]) => {
      setStreaming(true);
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletData: { profile, trades },
            messages: allMessages,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          const errText = await res.text().catch(() => "Request failed");
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `Error: ${errText}` },
          ]);
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const current = buffer;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: current,
            };
            return updated;
          });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Failed to get response. Try again." },
        ]);
      } finally {
        setStreaming(false);
      }
    },
    [profile, trades]
  );

  // Auto-fire initial analysis on mount
  useEffect(() => {
    if (!autoStarted) {
      setAutoStarted(true);
      streamResponse([]);
    }
  }, [autoStarted, streamResponse]);

  function submitMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setHasAskedFollowUp(true);
    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    streamResponse(newMessages);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitMessage(input);
  }

  // The first assistant message is the initial report
  const initialReport = messages.length > 0 && messages[0].role === "assistant" ? messages[0] : null;
  const chatMessages = messages.slice(initialReport ? 1 : 0);
  const showChips = initialReport && !hasAskedFollowUp && !streaming;

  return (
    <div className="space-y-4">
      {/* Initial report card */}
      {!initialReport && (
        <div className="rounded-xl border border-border-base bg-bg-card p-5">
          <div className="flex items-center justify-center py-8 text-sm text-fg-faint">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating analysis...
          </div>
        </div>
      )}

      {initialReport && (
        <div className="rounded-xl border border-border-base bg-bg-card overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-2 border-b border-border-base bg-brand/5 px-5 py-3">
            <Sparkles className="h-4 w-4 text-brand" />
            <span className="text-sm font-medium text-foreground">AI Analysis</span>
            {streaming && messages.length === 1 && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
            )}
          </div>
          {/* Card body */}
          <div className="border-l-2 border-brand/30 px-5 py-4">
            <div className="text-sm leading-relaxed text-fg-subtle whitespace-pre-wrap break-words">
              {initialReport.content || (
                <span className="inline-flex items-center gap-1 text-fg-faint">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking...
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suggestion chips */}
      {showChips && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => submitMessage(chip)}
              className="rounded-full border border-border-base bg-bg-card px-3.5 py-1.5 text-xs text-fg-subtle transition-colors hover:border-brand hover:text-foreground"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Chat messages (after initial report) */}
      {chatMessages.length > 0 && (
        <div className="space-y-3">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="mr-2 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15">
                  <Bot className="h-3.5 w-3.5 text-brand" />
                </div>
              )}
              <div
                className={`max-w-[85%] text-sm leading-relaxed break-words whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "rounded-2xl rounded-br-md bg-brand/10 px-4 py-2.5 text-foreground"
                    : "text-fg-subtle"
                }`}
              >
                {msg.content || (
                  <span className="inline-flex items-center gap-1 text-fg-faint">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking...
                  </span>
                )}
              </div>
              {msg.role === "user" && (
                <div className="ml-2 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-elevated">
                  <User className="h-3.5 w-3.5 text-fg-muted" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div ref={bottomRef} />

      {/* Input bar */}
      {initialReport && (
        <>
          <div className="border-t border-border-base" />
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              disabled={streaming}
              className="w-full rounded-lg border border-border-base bg-bg-card py-2.5 pl-4 pr-10 text-sm text-foreground placeholder:text-fg-faint focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-fg-faint transition-colors hover:text-brand disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
