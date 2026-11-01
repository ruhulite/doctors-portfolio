import { Activity, Stethoscope, ScanLine, HeartPulse, Microscope, ClipboardPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../ui/SectionHeading";

const items = [
  {key:"digestive",Icon:Activity,desc:"Specialist consultation for digestive system conditions."},
  {key:"liver",Icon:HeartPulse,desc:"Assessment and specialist care for liver-related conditions."},
  {key:"pancreas",Icon:Stethoscope,desc:"Consultation for pancreatic and related digestive conditions."},
  {key:"endoscopy",Icon:ScanLine,desc:"Professional expertise in therapeutic endoscopic procedures."},
  {key:"ercp",Icon:Microscope,desc:"Expertise in ERCP and related interventional procedures."},
  {key:"consultation",Icon:ClipboardPlus,desc:"Consultation based on clinical assessment and individual needs."},
] as const;

export function SpecialtyGrid() {
  const { t } = useTranslation();
  return <section className="bg-[#f2f7f9] py-16 md:py-20"><div className="container-shell"><SectionHeading centered title={t("specialties.title")} eyebrow="Areas of expertise"/><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{items.map(({key,Icon,desc})=><article key={key} className="feature-card"><span className="feature-icon"><Icon size={21}/></span><h3 className="font-extrabold text-ink">{t(`specialties.${key}`)}</h3><p className="mt-2 text-sm leading-7 text-muted">{desc}</p></article>)}</div></div></section>;
}
