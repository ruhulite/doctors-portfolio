import { useEffect, useState } from "react";
import { Award, CalendarDays, ChevronLeft, ChevronRight, MapPin, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";

const heroSlides = [
  {
    src: "/images/hero-1.jpg",
    alt: "Professor Dr. Muhammad Abdullahel Kafi with the clinical team in an endoscopy room",
    eyebrow: "hero.eyebrow",
    title: "hero.title",
    description: "hero.description",
  },
  {
    src: "/images/hero-2.jpg",
    alt: "Professor Dr. Muhammad Abdullahel Kafi and colleagues in a procedure room",
    eyebrow: "hero.slide2Eyebrow",
    title: "hero.slide2Title",
    description: "hero.slide2Description",
  },
];

export function Hero() {
  const { t } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const showSlide = (index: number) => setActiveSlide((index + heroSlides.length) % heroSlides.length);
  const slide = heroSlides[activeSlide];

  return <section className="hero-medical hero-fullbleed hero-overlay-slider">
    <div className="hero-slide-frame" aria-live="polite">
      <img key={slide.src} className="hero-slide-image" src={slide.src} alt={slide.alt}/>
      <div className="hero-overlay-shade" />
      <div className="hero-layout container-shell" key={`copy-${activeSlide}`}>
        <div className="hero-copy-fade">
          <p className="hero-kicker">{t(slide.eyebrow)}</p>
          <h1 className="hero-title">{t(slide.title)}</h1>
          <p className="hero-description">{t(slide.description)}</p>
          <p className="hero-credentials">MBBS · MCPS (Medicine) · FCPS (Gastroenterology)</p>
          <p className="hero-role">{t("hero.role")}</p>
          <div className="hero-actions"><Button to="/appointment"><CalendarDays size={16}/>{t("nav.book")}</Button><Button to="/about" variant="outline">{t("hero.profile")}</Button></div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-white"><span className="flex items-center gap-2"><Award size={17}/>{t("hero.experience")}</span><span className="flex items-center gap-2"><MapPin size={17}/>{t("hero.chambers")}</span><span className="flex items-center gap-2"><ShieldCheck size={17}/>{t("hero.consultation")}</span></div>
        </div>
      </div>
      <div className="hero-slider-controls container-shell">
        <button type="button" className="hero-slider-arrow" onClick={() => showSlide(activeSlide - 1)} aria-label="Previous slide"><ChevronLeft size={20}/></button>
        <div className="hero-slider-dots" aria-label="Choose a slide">{heroSlides.map((item, index) => <button key={item.src} type="button" className={`hero-slider-dot${activeSlide === index ? " is-active" : ""}`} onClick={() => showSlide(index)} aria-label={`Show slide ${index + 1}`} aria-pressed={activeSlide === index}/>)}</div>
        <button type="button" className="hero-slider-arrow" onClick={() => showSlide(activeSlide + 1)} aria-label="Next slide"><ChevronRight size={20}/></button>
      </div>
    </div>
    <div className="container-shell relative z-10 -mb-7"><div className="quick-info">
      <div className="quick-info-item"><span className="quick-info-icon"><CalendarDays size={20}/></span><span><strong className="block text-sm text-ink">{t("hero.appointment")}</strong><small className="mt-1 block text-xs text-muted">{t("hero.appointmentSub")}</small></span></div>
      <div className="quick-info-item"><span className="quick-info-icon"><MapPin size={20}/></span><span><strong className="block text-sm text-ink">{t("hero.chambers")}</strong><small className="mt-1 block text-xs text-muted">Popular Hospital · IBN Sina</small></span></div>
      <div className="quick-info-item"><span className="quick-info-icon"><ShieldCheck size={20}/></span><span><strong className="block text-sm text-ink">{t("hero.consultation")}</strong><small className="mt-1 block text-xs text-muted">{t("hero.consultationSub")}</small></span></div>
    </div></div>
  </section>;
}
