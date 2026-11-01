import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../components/ui/SectionHeading";
import { api, dhakaDate, formatDhaka, type Chamber, type Slot } from "../lib/api";

export function AppointmentPage() {
  const { t } = useTranslation();
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [chamberId, setChamberId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const today = dhakaDate(new Date());

  useEffect(() => { api<Chamber[]>("/chambers").then(setChambers).catch(e => setError(e.message)); }, []);
  useEffect(() => {
    setSlot(""); setSlots([]);
    if (!chamberId || !date) return;
    setLoadingSlots(true);
    api<{ slots: Slot[] }>(`/chambers/${encodeURIComponent(chamberId)}/slots?date=${date}`)
      .then(data => setSlots(data.slots)).catch(e => setError(e.message)).finally(() => setLoadingSlots(false));
  }, [chamberId, date]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    if (!slot) { setError("Please select an available appointment time."); return; }
    setBusy(true);
    try {
      const result = await api<{ id: string; status: string }>("/appointments", { method: "POST", body: JSON.stringify({ chamberId, patientName: name.trim(), patientPhone: phone.trim(), startsAt: slot, note: note.trim() || undefined }) });
      setMessage(`Your request was submitted successfully. Reference: ${result.id}. Status: ${result.status}. The chamber must confirm your appointment.`);
      setName(""); setPhone(""); setNote(""); setSlot("");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to submit appointment request."); }
    finally { setBusy(false); }
  }

  return <section className="container-shell py-16 md:py-20"><div className="mx-auto max-w-2xl"><SectionHeading eyebrow="Online appointment request" title={t("booking.title")} description="Choose a chamber, date and available time. Your request remains pending until the chamber confirms it."/>
    <form className="rounded-3xl border border-line bg-white p-6 shadow-soft md:p-8" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("booking.name")}><input required minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)} autoComplete="name" className="form-control" placeholder="Patient name"/></Field>
        <Field label={t("booking.phone")}><input required type="tel" inputMode="tel" pattern="(?:\+?88)?01[3-9][0-9]{8}" value={phone} onChange={e=>setPhone(e.target.value)} className="form-control" placeholder="01XXXXXXXXX"/></Field>
        <Field label={t("booking.chamber")}><select required value={chamberId} onChange={e=>setChamberId(e.target.value)} className="form-control"><option value="">Select chamber</option>{chambers.map(c=><option key={c.id} value={c.id}>{c.name} – {c.branch}</option>)}</select></Field>
        <Field label={t("booking.date")}><input required type="date" min={today} value={date} onChange={e=>setDate(e.target.value)} className="form-control"/></Field>
        <div className="sm:col-span-2"><Field label="Available appointment time"><select required value={slot} onChange={e=>setSlot(e.target.value)} className="form-control" disabled={!date || !chamberId || loadingSlots}><option value="">{loadingSlots ? "Loading available times…" : "Select available time"}</option>{slots.map(s=><option key={s.startsAt} value={s.startsAt}>{formatDhaka(s.startsAt)}</option>)}</select></Field>{date && !loadingSlots && slots.length===0 && <p className="mt-2 text-xs text-muted">No available slots for this date. Please select another date.</p>}</div>
        <div className="sm:col-span-2"><Field label={t("booking.notes")}><textarea rows={3} maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} className="form-control" placeholder="Optional note. Please do not include sensitive medical details."/></Field></div>
      </div>
      <button disabled={busy || !chambers.length} className="mt-5 w-full rounded-xl bg-teal px-5 py-3.5 text-sm font-bold text-deep hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Submitting…" : t("booking.submit")}</button>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {message && <p role="status" className="mt-4 rounded-xl bg-green-50 p-3 text-sm leading-6 text-green-800">{message}</p>}
      <p className="mt-4 rounded-xl bg-mist p-3 text-xs leading-6 text-muted">Submitting this form sends your appointment request to the clinic system. It is not a confirmed appointment until an administrator approves it. Avoid entering diagnoses or sensitive clinical information.</p>
    </form></div></section>;
}
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="grid gap-2 text-xs font-bold text-ink">{label}{children}</label>; }
