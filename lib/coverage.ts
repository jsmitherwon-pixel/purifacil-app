/** Strip anything non-numeric and clamp to 5 digits — MX postal-code format. */
export function normalizeZip(input: string): string {
  return input.replace(/\D/g, '').slice(0, 5);
}
