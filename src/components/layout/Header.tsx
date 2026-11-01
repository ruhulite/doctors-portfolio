import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { Button } from "../ui/Button";

export function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const toggleLanguage = () => { void i18n.changeLanguage(i18n.language === "en" ? "bn" : "en"); };
  const links = [{to:"/",label:t("nav.home")},{to:"/about",label:t("nav.about")},{to:"/chambers",label:t("nav.chambers")}];
  return <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
    <div className="container-shell flex min-h-[76px] items-center justify-between gap-4">
      <Link to="/" className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-deep font-bold text-white">MK</span>
        <span className="text-sm font-bold leading-tight">Prof. Dr. Muhammad Abdullahel Kafi<small className="mt-1 block text-[10px] font-medium uppercase tracking-wider text-muted">Gastroenterology Specialist</small></span>
      </Link>
      <nav className="hidden items-center gap-7 md:flex">{links.map(link=><NavLink key={link.to} to={link.to} className={({isActive})=>`text-sm font-semibold ${isActive?"text-teal":"text-muted hover:text-teal"}`}>{link.label}</NavLink>)}</nav>
      <div className="flex items-center gap-2">
        <button onClick={toggleLanguage} className="rounded-full border border-line px-3 py-2 text-xs font-bold" aria-label="Switch language">{i18n.language === "en" ? "বাংলা" : "English"}</button>
        <Button to="/appointment" className="hidden sm:inline-flex">{t("nav.book")}</Button>
        <button onClick={()=>setOpen(!open)} className="rounded-lg border border-line p-2 md:hidden" aria-label="Toggle menu">{open?<X size={19}/>:<Menu size={19}/>}</button>
      </div>
    </div>
    {open && <nav className="grid gap-3 border-t border-line bg-white px-6 py-4 md:hidden">{links.map(link=><NavLink onClick={()=>setOpen(false)} key={link.to} to={link.to} className="py-1 text-sm font-semibold">{link.label}</NavLink>)}<NavLink onClick={()=>setOpen(false)} to="/appointment" className="py-1 text-sm font-semibold text-teal">{t("nav.appointment")}</NavLink></nav>}
  </header>;
}