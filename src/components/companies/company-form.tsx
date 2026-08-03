"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { companySchema, type CompanyInput } from "@/validators/application";
import { createCompanyAction, updateCompanyAction } from "@/actions/company";

type Props = {
  mode: "create" | "edit";
  companyId?: string;
  initialData?: Partial<CompanyInput>;
};

export function CompanyForm({ mode, companyId, initialData }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(mode === "edit");
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name ?? "",
      industry: initialData?.industry ?? "",
      size: initialData?.size ?? "",
      glassdoorRating: initialData?.glassdoorRating ? String(initialData.glassdoorRating) : "",
      website: initialData?.website ?? "",
      location: initialData?.location ?? "",
      notes: initialData?.notes ?? "",
      interviewExperience: initialData?.interviewExperience ?? "",
      salaryRange: initialData?.salaryRange ?? "",
      pros: initialData?.pros ?? "",
      cons: initialData?.cons ?? "",
    },
  });

  function onSubmit(values: CompanyInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createCompanyAction(values)
          : await updateCompanyAction(companyId!, values);

      if (result.success) {
        toast.success(mode === "create" ? "Company added" : "Company updated");
        if (mode === "edit") {
          router.refresh();
        } else {
          router.push("/companies");
          router.refresh();
        }
        setOpen(false);
      } else if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          form.setError(field as keyof CompanyInput, { message: messages[0] });
        }
      } else {
        toast.error(result.error);
      }
    });
  }

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company name *</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input placeholder="SaaS / Healthcare..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input placeholder="100–500 employees" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://acme.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Headquarters</FormLabel>
                <FormControl>
                  <Input placeholder="San Francisco, CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="glassdoorRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Glassdoor rating</FormLabel>
                <FormControl>
                  <Input type="number" min={0} max={5} step={0.1} placeholder="4.2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salaryRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary range</FormLabel>
                <FormControl>
                  <Input placeholder="$150k–$200k" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="pros"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pros</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="What's great about working here?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cons"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cons</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="What gives you pause?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interviewExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interview experience</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Process notes, feedback, red flags..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Anything else worth remembering" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            <Save className="size-4" />
            {mode === "create" ? "Add company" : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  if (mode === "edit") {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Save className="size-4" />
          Add company
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add company</DialogTitle>
          <DialogDescription>
            Track research notes, interview experience and salary info.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
