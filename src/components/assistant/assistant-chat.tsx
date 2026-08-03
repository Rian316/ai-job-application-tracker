"use client";

import * as React from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { assistantChatAction, weeklyReportAction } from "@/actions/ai";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "How should I follow up on old applications?",
  "Give me interview prep tips",
  "How do I negotiate a salary offer?",
  "Improve my resume ATS score",
];

export function AssistantChat() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI job search assistant. Ask me about application strategy, follow-ups, interview prep, salary negotiation, or resumes. I can also generate a weekly report of your progress.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isPending]);

  function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isPending) return;

    const history = messages
      .slice(0, -1)
      .filter((m): m is Message => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    startTransition(async () => {
      const result = await assistantChatAction({ question: trimmed, history });
      if (result.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Sorry, I couldn't respond: ${result.error}`,
          },
        ]);
      }
    });
  }

  function generateReport() {
    setInput("");
    startTransition(async () => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: "Generate my weekly report" },
      ]);
      const result = await weeklyReportAction();
      if (result.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.data.report },
        ]);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card className="flex h-[calc(100vh-220px)] min-h-[480px] flex-col">
      <CardContent className="flex h-full flex-col gap-4 p-0">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse",
              )}
            >
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  message.role === "assistant"
                    ? "bg-gradient-to-br from-primary to-emerald-400 text-white"
                    : "bg-muted",
                )}
              >
                {message.role === "assistant" ? (
                  <Bot className="size-4" />
                ) : (
                  <span className="text-xs font-semibold">You</span>
                )}
              </div>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                  message.role === "assistant"
                    ? "bg-muted/60"
                    : "bg-primary text-primary-foreground",
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isPending && (
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-400 text-white">
                <Bot className="size-4" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-4 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Thinking…
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t p-4">
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Sparkles className="size-3" />
                  {suggestion}
                </button>
              ))}
              <button
                type="button"
                onClick={generateReport}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Badge variant="outline" className="px-1 py-0 text-[10px]">
                  AI
                </Badge>
                Weekly report
              </button>
            </div>
          )}
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your job search…"
              rows={1}
              className="min-h-10 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}