"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, CheckCircle2, Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/validators/auth";
import { forgotPasswordAction } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      const result = await forgotPasswordAction(values);
      if (result.success) {
        setSent(true);
      } else if (result.error) {
        form.setError("root", { message: result.error });
      }
    });
  }

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <Card className="glass-strong shadow-xl">
          <CardContent className="flex flex-col items-center gap-4 pt-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="size-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              Check your inbox
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If an account exists for{" "}
              <span className="font-medium text-foreground">
                {form.getValues("email")}
              </span>
              , we&apos;ve sent a password reset link. It expires in 1 hour.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="glass-strong shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Forgot your password?
          </CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Send reset link
              </Button>
            </form>
          </Form>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
