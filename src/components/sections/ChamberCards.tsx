import { Clock3, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../ui/SectionHeading";

export function ChamberCards() {
  const { t } = useTranslation();
  return <section className="container-shell py-16 md:py-20"><SectionHeading title={t("chambers.title")} eyebrow="Dhaka, Bangladesh" description={t("chambers.verify")}/>
    <div className="grid gap-5 md:grid-cols-2">
      <article className="rounded-2xl border border-line bg-white p-6 shadow-sm"><h3 className="text-xl font-bold">{t("chambers.popular")}</h3><p className="mt-1 text-xs text-muted">{t("chambers.branch")}</p><Detail Icon={MapPin} label="Address" value={t("chambers.popularAddress")}/><Detail Icon={Phone} label={t("chambers.phone")} value="09666 787801" href="tel:09666787801"/><Detail Icon={Clock3} label="Visiting hours" value={t("chambers.popularHours")}/><p className="mt-5 border-t border-line pt-4 text-xs leading-6 text-muted"><strong className="text-ink">Days:</strong> {t("chambers.days")}</p></article>
      <article className="rounded-2xl border border-line bg-white p-6 shadow-sm"><h3 className="text-xl font-bold">{t("chambers.ibn")}</h3><p className="mt-1 text-xs text-muted">{t("chambers.branch")}</p><Detail Icon={MapPin} label="Address" value={t("chambers.addressPending")}/><Detail Icon={Phone} label={t("chambers.phone")} value={t("chambers.phonePending")}/><Detail Icon={Clock3} label="Visiting hours" value={t("chambers.ibnHours")}/><p className="mt-5 border-t border-line pt-4 text-xs leading-6 text-muted"><strong className="text-ink">Days:</strong> {t("chambers.days")}</p></article>
    </div>
  </section>;
}
function Detail({Icon,label,value,href}:{Icon:typeof MapPin;label:string;value:string;href?:string}) { return <div className="mt-5 flex gap-3 text-sm text-muted"><Icon size={18} className="mt-0.5 shrink-0 text-teal"/><div><p className="text-xs font-bold text-ink">{label}</p>{href?<a href={href} className="hover:text-teal">{value}</a>:<p>{value}</p>}</div></div>; }