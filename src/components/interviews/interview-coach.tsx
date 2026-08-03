"use client";

import * as React from "react";
import { Bot, Loader2, Send, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { interviewCoachAction } from "@/actions/ai";
import { getCoachQuestion } from "@/lib/ai";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function InterviewCoach() {
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = React.useState<string>(
    getCoachQuestion(0).question,
  );
  const [input, setInput] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const [started, setStarted] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isPending]);

  const question = getCoachQuestion(questionIndex);

  function startSession() {
    setStarted(true);
    setMessages([]);
    setQuestionIndex(0);
    setCurrentQuestion(getCoachQuestion(0).question);
    setInput("");
  }

  function submitAnswer(answer: string) {
    const trimmed = answer.trim();
    if (!trimmed || isPending) return;

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content.slice(0, 6000),
    }));

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    startTransition(async () => {
      const result = await interviewCoachAction({ answer: trimmed, history });
      const reply = result.success
        ? result.data.reply
        : `I couldn't respond: ${result.error}`;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (result.success) {
        setQuestionIndex((i) => i + 1);
        setCurrentQuestion(getCoachQuestion(questionIndex + 1).question);
      }
    });
  }

  return (
    <Card className="flex h-[calc(100vh-220px)] min-h-[480px] flex-col">
      <CardContent className="flex h-full flex-col gap-4 p-0">
        {!started ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-400 text-white">
              <Bot className="size-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Mock interview practice</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                The coach asks behavioral questions, scores each answer, and
                shows how to improve with the STAR method. 8 questions per
                session.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Badge key={i} variant="secondary">
                  {getCoachQuestion(i).topic}
                </Badge>
              ))}
            </div>
            <Button onClick={startSession}>Start practice</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  Question {Math.min(questionIndex + 1, 8)} of 8
                </Badge>
                <span className="text-sm font-medium capitalize">
                  {question.topic}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const next = getCoachQuestion(questionIndex + 1);
                  setQuestionIndex((i) => i + 1);
                  setCurrentQuestion(next.question);
                }}
              >
                <SkipForward className="size-3.5" />
                Skip
              </Button>
            </div>

            <div className="rounded-lg bg-muted/60 px-4 py-3 mx-4 text-sm">
              <p className="font-medium">{currentQuestion}</p>
            </div>

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
                    Scoring your answer…
                  </div>
                </div>
              )}
            </div>

            <form
              className="flex items-end gap-2 border-t p-4"
              onSubmit={(e) => {
                e.preventDefault();
                submitAnswer(input);
              }}
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Answer the question (try the STAR method)…"
                rows={2}
                className="min-h-16 resize-none"
              />
              <Button
                type="submit"
                size="icon"
                className="h-16 w-10"
                disabled={isPending || !input.trim()}
              >
                <Send className="size-4" />
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}