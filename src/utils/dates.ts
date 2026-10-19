export function localDate(date = new Date()): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
export function dateFrom(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function addDays(value: string, days: number): string {
  const date = dateFrom(value);
  date.setDate(date.getDate() + days);
  return localDate(date);
}
export function niceDate(value: string): string {
  return value
    ? dateFrom(value).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "No date";
}
export function daysBetween(value: string, today = localDate()): number {
  return Math.round(
    (Date.UTC(...parts(value)) - Date.UTC(...parts(today))) / 86400000,
  );
}
function parts(value: string): [number, number, number] {
  const [y, m, d] = value.split("-").map(Number);
  return [y, m - 1, d];
}
