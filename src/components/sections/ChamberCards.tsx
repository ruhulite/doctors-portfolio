import { Clock3, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../ui/SectionHeading";
import { Button } from "../ui/Button";

export function ChamberCards() {
  const { t } = useTranslation();
  return <section className="container-shell section-pad"><SectionHeading title={t("chambers.title")} eyebrow="Chambers & visiting hours" description={t("chambers.verify")}/>
    <div className="grid gap-5 lg:grid-cols-2">
      <article className="chamber-panel"><div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-extrabold uppercase tracking-[.15em] text-teal">Chamber 01</span><h3 className="mt-2 text-2xl font-extrabold">{t("chambers.popular")}</h3><p className="mt-1 text-xs text-muted">{t("chambers.branch")}</p></div><span className="grid size-12 place-items-center rounded-full bg-mint text-teal"><MapPin size={22}/></span></div><Detail Icon={MapPin} label="Address" value={t("chambers.popularAddress")}/><Detail Icon={Phone} label={t("chambers.phone")} value="09666 787801" href="tel:09666787801"/><Detail Icon={Clock3} label="Visiting hours" value={t("chambers.popularHours")}/><p className="mt-5 border-t border-line pt-4 text-xs leading-6 text-muted"><strong className="text-ink">Days:</strong> {t("chambers.days")}</p><a href="tel:09666787801" className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-teal">Call for appointment <ArrowUpRight size={14}/></a></article>
      <article className="chamber-panel"><div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-extrabold uppercase tracking-[.15em] text-teal">Chamber 02</span><h3 className="mt-2 text-2xl font-extrabold">{t("chambers.ibn")}</h3><p className="mt-1 text-xs text-muted">{t("chambers.branch")}</p></div><span className="grid size-12 place-items-center rounded-full bg-mint text-teal"><MapPin size={22}/></span></div><Detail Icon={MapPin} label="Address" value={t("chambers.addressPending")}/><Detail Icon={Phone} label={t("chambers.phone")} value={t("chambers.phonePending")}/><Detail Icon={Clock3} label="Visiting hours" value={t("chambers.ibnHours")}/><p className="mt-5 border-t border-line pt-4 text-xs leading-6 text-muted"><strong className="text-ink">Days:</strong> {t("chambers.days")}</p><p className="mt-5 text-xs font-semibold text-muted">Please confirm address and appointment contact before visiting.</p></article>
    </div><div className="mt-7"><Button to="/appointment">Request an appointment</Button></div>
  </section>;
}
function Detail({Icon,label,value,href}:{Icon:typeof MapPin;label:string;value:string;href?:string}) { return <div className="mt-5 flex gap-3 text-sm text-muted"><Icon size={18} className="mt-0.5 shrink-0 text-teal"/><div><p className="text-xs font-extrabold text-ink">{label}</p>{href?<a href={href} className="hover:text-teal">{value}</a>:<p>{value}</p>}</div></div>; }
