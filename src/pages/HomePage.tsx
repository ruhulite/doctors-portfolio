import { Activity, HeartPulse, Microscope, ScanLine, Stethoscope, ClipboardPlus, ArrowRight, Clock3, MapPin, Phone } from "lucide-react";
import { Hero } from "../components/sections/Hero";
import { ChamberCards } from "../components/sections/ChamberCards";
import { Button } from "../components/ui/Button";
import { useTranslation } from "react-i18next";

const expertise = [
  { Icon: Activity, title: "specialties.digestive", desc: "home.digestiveDesc" },
  { Icon: HeartPulse, title: "specialties.liver", desc: "home.liverDesc" },
  { Icon: Stethoscope, title: "specialties.pancreas", desc: "home.pancreasDesc" },
  { Icon: ScanLine, title: "specialties.endoscopy", desc: "home.endoscopyDesc" },
  { Icon: Microscope, title: "specialties.ercp", desc: "home.ercpDesc" },
  { Icon: ClipboardPlus, title: "specialties.consultation", desc: "home.consultationDesc" },
] as const;

export function HomePage() {
  const { t } = useTranslation();
  return <>
    <Hero />
    <section className="stats-band mt-7"><div className="container-shell grid grid-cols-3"><Stat value="16+" label={t("home.statsExperience")}/><Stat value="2" label={t("home.statsChambers")}/><Stat value="5" label={t("home.statsDays")}/></div></section>
    <section className="container-shell section-pad"><div className="about-panel"><div className="about-art about-art-photo"><img src="/images/doctor-profile.png" alt={t("about.title")} /></div><div><p className="section-kicker">{t("about.eyebrow")}</p><h2 className="section-title">{t("about.title")}</h2><h3 className="mt-4 text-lg font-bold text-teal">{t("about.specialty")}</h3><p className="section-description">{t("about.previous")}. {t("home.profileExtra")}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{["MBBS","MCPS (Medicine)","FCPS (Gastroenterology)",t("hero.role")].map(x=><div key={x} className="flex items-center gap-3 rounded-lg border border-line bg-white p-3 text-xs font-bold"><span className="grid size-6 place-items-center rounded-full bg-mint text-teal">✓</span>{x}</div>)}</div><Button to="/about" variant="outline" className="mt-6">{t("home.profileButton")} <ArrowRight size={15}/></Button></div></div></section>
    <section className="bg-[#f2f7f9]"><div className="container-shell section-pad"><div className="mx-auto mb-10 max-w-2xl text-center"><p className="section-kicker">{t("home.expertiseEyebrow")}</p><h2 className="section-title">{t("home.expertiseTitle")}</h2><p className="section-description">{t("home.expertiseDescription")}</p></div><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{expertise.map(({Icon,title,desc})=><article key={title} className="feature-card"><span className="feature-icon"><Icon size={22}/></span><h3 className="text-lg font-extrabold text-ink">{t(title)}</h3><p className="mt-2 text-sm leading-7 text-muted">{t(desc)}</p></article>)}</div></div></section>
    <ChamberCards />
    <section className="cta-band"><div className="container-shell grid items-center gap-8 py-14 md:grid-cols-[1fr_auto] md:gap-10"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#a8e1dd]">{t("home.appointmentEyebrow")}</p><h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight md:text-4xl">{t("home.appointmentTitle")}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">{t("home.appointmentDescription")}</p></div><Button to="/appointment" className="justify-self-start bg-white !text-deep hover:!bg-[#eaf4f4]">{t("home.appointmentButton")} <ArrowRight size={16}/></Button></div></section>
    <section className="container-shell section-pad"><div className="grid gap-6 md:grid-cols-3"><Info Icon={Clock3} title={t("home.visitingTitle")} text={t("home.visitingText")}/><Info Icon={MapPin} title={t("home.locationsTitle")} text={t("home.locationsText")}/><Info Icon={Phone} title={t("home.supportTitle")} text={t("home.supportText")}/></div></section>
  </>;
}
function Stat({value,label}:{value:string;label:string}) { return <div className="stats-cell"><strong>{value}</strong><span>{label}</span></div>; }
function Info({Icon,title,text}:{Icon:typeof Clock3;title:string;text:string}) { return <div className="flex gap-4 border-b border-line pb-5 md:border-b-0"><span className="feature-icon mb-0 shrink-0"><Icon size={21}/></span><div><h3 className="font-extrabold">{title}</h3><p className="mt-2 text-sm leading-7 text-muted">{text}</p></div></div>; }
