import { fail, type ActionResult } from "@/lib/action-result";

export function zodErrors(
  error: { issues: { path: PropertyKey[]; message: string }[] },
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] = fieldErrors[key] ?? [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}

export function failZod(
  error: { issues: { path: PropertyKey[]; message: string }[] },
): ActionResult<never> {
  return fail("Please fix the errors below.", zodErrors(error));
}
