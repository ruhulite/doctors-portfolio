import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Footer() {
  const { t } = useTranslation();
  return <footer className="bg-[#0d2d35] py-10 text-white">
    <div className="container-shell grid gap-8 md:grid-cols-3">
      <div><div className="font-bold">Prof. Dr. Muhammad Abdullahel Kafi</div><p className="mt-3 max-w-sm text-sm leading-7 text-white/65">Gastroenterology · Digestive system · Liver · Pancreas</p></div>
      <div><h3 className="mb-3 text-sm font-bold">Explore</h3><div className="grid gap-2 text-sm text-white/70"><Link to="/about">About</Link><Link to="/chambers">Chambers</Link><Link to="/appointment">Appointment</Link></div></div>
      <div><h3 className="mb-3 text-sm font-bold">Popular Hospital</h3><a className="text-sm text-white/70" href="tel:09666787801">09666 787801</a><p className="mt-3 text-xs leading-6 text-white/60">{t("footer.disclaimer")}</p></div>
    </div>
    <div className="container-shell mt-8 border-t border-white/15 pt-5 text-xs text-white/50">© {new Date().getFullYear()} Professor Dr. Muhammad Abdullahel Kafi</div>
  </footer>;
}