export type FieldErrors = { fieldErrors: Record<string, string[]> };
export function isFieldErrors(value: any): value is FieldErrors {
  return (value as any)?.fieldErrors != null;
}
