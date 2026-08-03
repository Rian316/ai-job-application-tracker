"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCcw, Unplug } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  updateNotificationSettingsAction,
  updateGoalsAction,
} from "@/actions/settings";

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  browserNotifications: z.boolean(),
  weeklySummary: z.boolean(),
  weeklySummaryDay: z.string(),
  timezone: z.string(),
});

const goalsFormSchema = z.object({
  weeklyApplications: z.number().int().min(1).max(100),
  monthlyApplications: z.number().int().min(1).max(500),
  targetRole: z.string().optional(),
  targetCompany: z.string().optional(),
});

type SettingsData = {
  emailNotifications: boolean;
  browserNotifications: boolean;
  weeklySummary: boolean;
  weeklySummaryDay: string;
  timezone: string;
};

type GoalsData = {
  weeklyApplications: number;
  monthlyApplications: number;
  targetRole: string | null;
  targetCompany: string | null;
};

export function SettingsForms({
  settings,
  goals,
  calendarConnected,
}: {
  settings: SettingsData | null;
  goals: GoalsData | null;
  calendarConnected: boolean;
}) {
  const router = useRouter();
  const [calendarPending, startCalendarTransition] = React.useTransition();

  const notificationForm = useForm({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: settings?.emailNotifications ?? true,
      browserNotifications: settings?.browserNotifications ?? true,
      weeklySummary: settings?.weeklySummary ?? true,
      weeklySummaryDay: settings?.weeklySummaryDay ?? "sunday",
      timezone: settings?.timezone ?? "UTC",
    },
  });

  const goalsForm = useForm({
    resolver: zodResolver(goalsFormSchema),
    defaultValues: {
      weeklyApplications: goals?.weeklyApplications ?? 5,
      monthlyApplications: goals?.monthlyApplications ?? 20,
      targetRole: goals?.targetRole ?? "",
      targetCompany: goals?.targetCompany ?? "",
    },
  });

  function onSaveNotifications(values: z.infer<typeof notificationFormSchema>) {
    void updateNotificationSettingsAction(values).then((result) => {
      if (result.success) {
        toast.success("Notification settings saved");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function onSaveGoals(values: z.infer<typeof goalsFormSchema>) {
    void updateGoalsAction({
      weeklyApplications: Number(values.weeklyApplications),
      monthlyApplications: Number(values.monthlyApplications),
      targetRole: values.targetRole || undefined,
      targetCompany: values.targetCompany || undefined,
    }).then((result) => {
      if (result.success) {
        toast.success("Goals saved");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function connectCalendar() {
    fetch("/api/calendar/connect")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: { url: string }) => {
        window.location.href = data.url;
      })
      .catch(() => toast.error("Google Calendar is not configured."));
  }

  function disconnectCalendar() {
    startCalendarTransition(async () => {
      const res = await fetch("/api/calendar/disconnect", { method: "POST" });
      if (res.ok) {
        toast.success("Google Calendar disconnected");
        router.refresh();
      } else {
        toast.error("Failed to disconnect");
      }
    });
  }

  function syncCalendar() {
    startCalendarTransition(async () => {
      const res = await fetch("/api/calendar/sync", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.synced !== undefined) {
        toast.success(`Synced ${data.synced} upcoming interviews`);
      } else {
        toast.error(data?.error ?? "Sync failed");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose what reminders you receive.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...notificationForm}>
            <form onSubmit={notificationForm.handleSubmit(onSaveNotifications)} className="space-y-5">
              <FormField
                control={notificationForm.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div>
                      <FormLabel>Email notifications</FormLabel>
                      <FormDescription>
                        Reminders for interviews and follow-ups.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="browserNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div>
                      <FormLabel>Browser notifications</FormLabel>
                      <FormDescription>
                        Show alerts in the browser.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={notificationForm.control}
                name="weeklySummary"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-3">
                    <div>
                      <FormLabel>Weekly summary</FormLabel>
                      <FormDescription>
                        A digest of your week&apos;s activity.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={notificationForm.control}
                  name="weeklySummaryDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Summary day</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["sunday", "monday", "friday", "saturday"].map((day) => (
                            <SelectItem key={day} value={day} className="capitalize">
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={notificationForm.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="UTC" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">
                {notificationForm.formState.isSubmitting && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Save notifications
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
            <CardDescription>Set your application targets.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...goalsForm}>
              <form onSubmit={goalsForm.handleSubmit(onSaveGoals)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={goalsForm.control}
                    name="weeklyApplications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weekly applications</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={goalsForm.control}
                    name="monthlyApplications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly applications</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={500}
                            value={field.value}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={goalsForm.control}
                  name="targetRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target role</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={goalsForm.control}
                  name="targetCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company you would love to work at" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">
                  {goalsForm.formState.isSubmitting && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Save goals
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Google Calendar</CardTitle>
            <CardDescription>
              Push upcoming interviews to your Google Calendar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            {calendarConnected ? (
              <>
                <Button
                  variant="outline"
                  onClick={syncCalendar}
                  disabled={calendarPending}
                >
                  {calendarPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="size-4" />
                  )}
                  Sync interviews
                </Button>
                <Button
                  variant="destructive"
                  onClick={disconnectCalendar}
                  disabled={calendarPending}
                >
                  <Unplug className="size-4" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button onClick={connectCalendar}>
                Connect Google Calendar
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}