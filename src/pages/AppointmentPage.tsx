import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../components/ui/SectionHeading";

export function AppointmentPage() {
  const { t } = useTranslation();
  const [submitted,setSubmitted] = useState(false);
  const [chamber,setChamber] = useState("");
  const today = new Date().toLocaleDateString("en-CA");
  return <section className="container-shell py-16 md:py-20"><div className="mx-auto max-w-2xl"><SectionHeading eyebrow="Online appointment request" title={t("booking.title")} description={t("booking.description")}/><form className="rounded-3xl border border-line bg-white p-6 shadow-soft md:p-8" onSubmit={e=>{e.preventDefault();setSubmitted(true);}}><div className="grid gap-4 sm:grid-cols-2">
    <Field label={t("booking.name")}><input required autoComplete="name" className="form-control" placeholder="Patient name"/></Field>
    <Field label={t("booking.phone")}><input required type="tel" inputMode="tel" pattern="01[0-9]{9}" className="form-control" placeholder="01XXXXXXXXX"/></Field>
    <Field label={t("booking.chamber")}><select required value={chamber} onChange={e=>setChamber(e.target.value)} className="form-control"><option value="">Select chamber</option><option>Popular Hospital – Dhanmondi</option><option>IBN Sina Hospital – Dhanmondi</option></select></Field>
    <Field label={t("booking.date")}><input required type="date" min={today} className="form-control"/></Field>
    <div className="sm:col-span-2"><Field label={t("booking.notes")}><textarea rows={3} className="form-control" placeholder="Optional note"/></Field></div>
    </div><button className="mt-5 w-full rounded-xl bg-teal px-5 py-3.5 text-sm font-bold text-white hover:bg-teal-dark">{t("booking.submit")}</button><p className="mt-4 rounded-xl bg-mist p-3 text-xs leading-6 text-muted">{t("booking.demo")}</p>{submitted&&<p role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">Your details passed local form validation. This is not a confirmed appointment; please call the hospital.</p>}</form></div></section>;
}
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="grid gap-2 text-xs font-bold text-ink">{label}{children}</label>; }