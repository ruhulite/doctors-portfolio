import { Hero } from "../components/sections/Hero";
import { SpecialtyGrid } from "../components/sections/SpecialtyGrid";
import { ChamberCards } from "../components/sections/ChamberCards";
import { Button } from "../components/ui/Button";
import { useTranslation } from "react-i18next";

export function HomePage() {
  const { t } = useTranslation();
  return <><Hero/><div className="bg-deep py-6 text-white"><div className="container-shell grid grid-cols-3 gap-3 text-center"><Stat value="16+" label="Years of experience*"/><Stat value="2" label="Dhaka chambers"/><Stat value="5" label="Visiting days / week"/></div></div><section className="container-shell py-16 md:py-20"><div className="grid items-center gap-8 md:grid-cols-[.7fr_1.3fr]"><div className="grid min-h-56 place-items-center rounded-3xl bg-mint text-5xl font-extrabold text-teal">MK</div><div><p className="text-xs font-bold uppercase tracking-widest text-teal">{t("about.eyebrow")}</p><h2 className="mt-3 text-3xl font-bold">{t("about.title")}</h2><p className="mt-3 text-sm leading-7 text-muted">{t("about.specialty")}</p><p className="mt-2 text-sm leading-7 text-muted">{t("about.previous")}</p><Button to="/about" variant="outline" className="mt-5">View full profile</Button></div></div></section><SpecialtyGrid/><ChamberCards/><section className="bg-deep py-14 text-center text-white"><div className="container-shell"><h2 className="text-3xl font-bold">{t("booking.title")}</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-white/70">{t("booking.description")}</p><Button to="/appointment" className="mt-6 bg-white !text-deep">Request appointment</Button></div></section></>;
}
function Stat({value,label}:{value:string;label:string}) { return <div><strong className="block text-2xl font-bold md:text-3xl">{value}</strong><span className="mt-1 block text-[10px] text-white/65 md:text-xs">{label}</span></div>; }