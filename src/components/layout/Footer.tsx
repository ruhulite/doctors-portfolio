import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { MapPin, Phone, Clock3 } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();
  return <footer className="bg-[#10354e] py-12 text-white">
    <div className="container-shell grid gap-9 md:grid-cols-[1.4fr_.8fr_1fr]">
      <div><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 font-extrabold">MK</span><span className="text-sm font-extrabold">{t("about.title")}<small className="mt-1 block text-[9px] font-semibold uppercase tracking-[.14em] text-white/55">{t("footer.brandSpecialty")}</small></span></div><p className="mt-4 max-w-sm text-sm leading-7 text-white/65">{t("footer.brandDescription")}</p></div>
      <div><h3 className="mb-4 text-sm font-extrabold">{t("footer.explore")}</h3><div className="grid gap-3"><Link className="footer-link" to="/">{t("footer.home")}</Link><Link className="footer-link" to="/about">{t("footer.about")}</Link><Link className="footer-link" to="/chambers">{t("footer.chambers")}</Link><Link className="footer-link" to="/appointment">{t("footer.appointment")}</Link></div></div>
      <div><h3 className="mb-4 text-sm font-extrabold">{t("footer.chamberInfo")}</h3><div className="grid gap-3 text-sm text-white/65"><p className="flex gap-2"><MapPin size={16} className="shrink-0 text-[#80d2cf]"/>{t("footer.location")}</p><p className="flex gap-2"><Phone size={16} className="shrink-0 text-[#80d2cf]"/><a href="tel:09666787801">০৯৬৬৬ ৭৮৭৮০১</a></p><p className="flex gap-2"><Clock3 size={16} className="shrink-0 text-[#80d2cf]"/>{t("footer.days")}</p></div></div>
    </div>
    <div className="container-shell mt-9 border-t border-white/15 pt-5 text-xs leading-6 text-white/50"><p>{t("footer.disclaimer")}</p><p className="mt-2">© {new Date().getFullYear()} {t("about.title")}. All rights reserved.</p></div>
  </footer>;
}
