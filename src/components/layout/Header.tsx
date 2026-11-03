import { useState } from "react";
import { Menu, X, Phone, CalendarDays } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { Button } from "../ui/Button";

export function Header() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const toggleLanguage = () => { void i18n.changeLanguage(i18n.language === "en" ? "bn" : "en"); };
  const links = [{to:"/",label:t("nav.home")},{to:"/about",label:t("nav.about")},{to:"/chambers",label:t("nav.chambers")}];
  return <>
    <div className="top-contact"><div className="container-shell top-contact-inner"><span>Digestive Health · Liver · Pancreas</span><span className="flex items-center gap-2"><Phone size={13}/> Appointment: <a href="tel:09666787801" className="font-bold">09666 787801</a><span className="mx-2 text-white/30">|</span> Dhaka, Bangladesh</span></div></div>
    <header className="site-header">
      <div className="container-shell flex min-h-[82px] items-center justify-between gap-4">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={()=>setOpen(false)}>
          <span className="brand-mark">MK</span>
          <span className="min-w-0"><span className="brand-title">Prof. Dr. Muhammad Abdullahel Kafi</span><small className="brand-subtitle">Gastroenterology Specialist</small></span>
        </Link>
        <nav className="hidden items-center gap-7 lg:flex">{links.map(link=><NavLink key={link.to} to={link.to} end={link.to==="/"} className={({isActive})=>`nav-link ${isActive?"active":""}`}>{link.label}</NavLink>)}</nav>
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={toggleLanguage} className="rounded-full border border-line px-3 py-2 text-xs font-bold text-ink hover:border-teal" aria-label="Switch language">{i18n.language === "en" ? "বাংলা" : "English"}</button>
          <Button to="/appointment" className="header-book-cta hidden md:inline-flex"><CalendarDays size={15}/>{t("nav.book")}</Button>
          <button onClick={()=>setOpen(!open)} className="rounded-lg border border-line p-2 text-ink lg:hidden" aria-label="Toggle menu">{open?<X size={19}/>:<Menu size={19}/>}</button>
        </div>
      </div>
      {open && <nav className="grid gap-1 border-t border-line bg-white px-6 py-4 lg:hidden">{links.map(link=><NavLink onClick={()=>setOpen(false)} key={link.to} end={link.to==="/"} to={link.to} className="rounded-lg px-3 py-2 text-sm font-semibold text-muted hover:bg-mist hover:text-teal">{link.label}</NavLink>)}<NavLink onClick={()=>setOpen(false)} to="/appointment" className="rounded-lg px-3 py-2 text-sm font-bold text-teal">{t("nav.appointment")}</NavLink></nav>}
    </header>
  </>;
}
