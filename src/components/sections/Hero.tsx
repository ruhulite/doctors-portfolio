import { Award, CalendarDays, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";

export function Hero() {
  const { t } = useTranslation();
  return <section className="hero-wash py-16 md:py-24">
    <div className="container-shell grid items-center gap-12 md:grid-cols-[1.15fr_.85fr]">
      <div>
        <p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-teal">{t("hero.eyebrow")}</p>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-ink md:text-6xl">{t("hero.title")}</h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-muted">{t("hero.description")}</p>
        <p className="mt-5 font-semibold text-teal">MBBS · MCPS (Medicine) · FCPS (Gastroenterology)</p>
        <p className="mt-2 text-sm font-medium text-muted">Professor, Department of Gastroenterology</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button to="/appointment"><CalendarDays size={16}/>{t("nav.book")}</Button><Button to="/about" variant="outline">{t("hero.profile")}</Button></div>
        <div className="mt-9 flex flex-wrap gap-5 text-xs font-semibold text-muted"><span className="flex items-center gap-2"><Award size={17} className="text-teal"/>{t("hero.experience")}</span><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-teal"/>Two Dhaka chambers</span></div>
      </div>
      <div className="relative grid min-h-[330px] place-items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#d8ece7] to-[#a9cec7] p-8">
        <div className="absolute size-64 rounded-full border border-white/60" />
        <div className="relative text-center"><div className="mx-auto grid size-28 place-items-center rounded-full bg-white/80 text-3xl font-bold text-teal">MK</div><div className="mx-auto mt-3 h-40 w-64 rounded-t-[7rem] bg-white/90" /><p className="mt-4 text-xs font-semibold text-deep">Professional portrait placeholder</p><p className="text-[10px] text-muted">Replace with the doctor's approved photograph</p></div>
      </div>
    </div>
  </section>;
}