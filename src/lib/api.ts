const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/$/, "");
export type Chamber = { id: string; name: string; branch: string; address?: string | null; phone?: string | null };
export type Slot = { startsAt: string; endsAt: string };
export type Appointment = { id: string; patientName: string; patientPhone: string; patientEmail?: string | null; note?: string | null; adminNote?: string | null; startsAt: string; endsAt: string; status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"; chamber: { id: string; name: string; branch: string } };
export type Schedule = { id?: string; chamberId: string; dayOfWeek: number; startTime: string; endTime: string; slotDurationMinutes: number; active: boolean };
export type Session = { accessToken: string; user: { id: string; name: string; email: string; role: "SUPER_ADMIN" | "ADMIN" | "STAFF" } };
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try { response = await fetch(`${API_BASE}${path}`, { ...options, headers }); }
  catch { throw new ApiError("Cannot reach the booking server. Please try again later.", 0); }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(Array.isArray(payload?.message) ? payload.message.join(", ") : payload?.message || `Request failed (${response.status})`, response.status);
  return payload as T;
}
export const dhakaDate = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
export const toDhakaIso = (date: string, time: string) => `${date}T${time}:00+06:00`;
export const formatDhaka = (value: string) => new Intl.DateTimeFormat("en-BD", { timeZone: "Asia/Dhaka", dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
