import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, BriefcaseMedical, GraduationCap, MapPin, Phone, Stethoscope } from "lucide-react";
import { api, API_BASE, type LandingSection } from "../lib/api";
import { HealthVideos } from "../components/sections/HealthVideos";

type HeroSlide = {
    id?: string;
    enabled?: boolean;
    headingBn?: string;
    headingEn?: string;
    subtitleBn?: string;
    subtitleEn?: string;
    bodyBn?: string;
    bodyEn?: string;
    imageUrl?: string;
    ctaTextBn?: string;
    ctaTextEn?: string;
    ctaUrl?: string;
};

type Content = {
    headingBn?: string;
    headingEn?: string;
    subtitleBn?: string;
    subtitleEn?: string;
    bodyBn?: string;
    bodyEn?: string;
    imageUrl?: string;
    slides?: HeroSlide[];
    items?: Array<{
        titleBn?: string;
        titleEn?: string;
        descriptionBn?: string;
        descriptionEn?: string;
        metaBn?: string;
        metaEn?: string;
    }>;
    phone?: string;
    email?: string;
    addressBn?: string;
    addressEn?: string;
    ctaTextBn?: string;
    ctaTextEn?: string;
    ctaUrl?: string;
};

const langText = (bn?: string, en?: string, lang?: string) =>
    lang === "en" ? en || bn || "" : bn || en || "";

const resolveImageUrl = (url?: string) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    const backendOrigin = API_BASE.replace(/\/api\/?$/, "");
    return `${backendOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
};

const sectionNames: Record<string, { bn: string; en: string }> = {
    hero: { bn: "স্বাগতম", en: "Welcome" },
    about: { bn: "চিকিৎসক পরিচিতি", en: "About the Doctor" },
    qualifications: { bn: "শিক্ষাগত যোগ্যতা", en: "Qualifications" },
    experience: { bn: "পেশাগত অভিজ্ঞতা", en: "Professional Experience" },
    specializations: { bn: "বিশেষজ্ঞ সেবা", en: "Specializations" },
    chambers: { bn: "চেম্বার ও কর্মস্থল", en: "Chambers" },
    contact: { bn: "যোগাযোগ", en: "Contact" },
};

function getHeroSlides(content: Content): HeroSlide[] {
    if (Array.isArray(content.slides)) {
        return content.slides.filter((slide) => slide.enabled !== false);
    }

    // Backward compatibility with the previous single-slide Hero format.
    const hasLegacyContent = Boolean(
        content.headingBn || content.headingEn || content.subtitleBn ||
        content.subtitleEn || content.bodyBn || content.bodyEn ||
        content.imageUrl || content.ctaTextBn || content.ctaTextEn,
    );

    return hasLegacyContent ? [{ ...content, id: "legacy-hero" }] : [];
}

function HeroSlider({ content, lang }: { content: Content; lang: string }) {
    const slides = getHeroSlides(content);
    const [activeIndex, setActiveIndex] = useState(0);
    const bn = lang !== "en";

    useEffect(() => {
        setActiveIndex(0);
    }, [slides.length]);

    useEffect(() => {
        if (slides.length < 2) return;
        const timer = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % slides.length);
        }, 6500);
        return () => window.clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return null;

    const slide = slides[activeIndex] || slides[0];
    const heading = langText(slide.headingBn, slide.headingEn, lang);
    const subtitle = langText(slide.subtitleBn, slide.subtitleEn, lang);
    const body = langText(slide.bodyBn, slide.bodyEn, lang);
    const ctaText = langText(slide.ctaTextBn, slide.ctaTextEn, lang);

    const showPrevious = () =>
        setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
    const showNext = () =>
        setActiveIndex((current) => (current + 1) % slides.length);

    return (
        <section id="hero" className="hero-medical hero-overlay-slider">
            <div className="hero-slide-frame">
                <div className="hero-overlay-shade" />

                {slide.imageUrl && (
                    <img
                        key={`hero-image-${slide.id || activeIndex}-${activeIndex}`}
                        className="hero-slide-image"
                        src={resolveImageUrl(slide.imageUrl)}
                        alt={heading}
                    />
                )}

                <div className="container-shell hero-layout">
                    <div
                        key={`hero-copy-${slide.id || activeIndex}-${activeIndex}`}
                        className="hero-copy-fade"
                    >
                        {subtitle && <p className="hero-kicker">{subtitle}</p>}
                        {heading && <h1 className="hero-title">{heading}</h1>}
                        {body && <p className="hero-description">{body}</p>}
                        {ctaText && (
                            <a
                                className="mt-7 inline-flex rounded-full bg-teal px-6 py-3 font-bold text-deep transition-colors hover:bg-white hover:text-deep"
                                href={slide.ctaUrl || "#contact"}
                            >
                                {ctaText}
                            </a>
                        )}
                    </div>
                </div>

                {slides.length > 1 && (
                    <div className="hero-slider-controls" aria-label={bn ? "হিরো স্লাইড নিয়ন্ত্রণ" : "Hero slide controls"}>
                        <button
                            type="button"
                            className="hero-slider-arrow"
                            onClick={showPrevious}
                            aria-label={bn ? "আগের স্লাইড" : "Previous slide"}
                        >
                            <ArrowLeft size={19} />
                        </button>

                        <div className="hero-slider-dots">
                            {slides.map((item, index) => (
                                <button
                                    key={item.id || index}
                                    type="button"
                                    className={`hero-slider-dot ${index === activeIndex ? "is-active" : ""}`}
                                    onClick={() => setActiveIndex(index)}
                                    aria-label={`${bn ? "স্লাইড" : "Slide"} ${index + 1}`}
                                    aria-current={index === activeIndex ? "true" : undefined}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            className="hero-slider-arrow"
                            onClick={showNext}
                            aria-label={bn ? "পরের স্লাইড" : "Next slide"}
                        >
                            <ArrowRight size={19} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

export function HomePage() {
    const { i18n } = useTranslation();
    const lang = i18n.language;
    const [sections, setSections] = useState<LandingSection[]>([]);
    const [error, setError] = useState("");
    const preview = new URLSearchParams(window.location.search).get("preview") === "1";

    useEffect(() => {
        const raw = sessionStorage.getItem("kafi_cms_session");
        let token: string | undefined;
        try {
            token = raw ? JSON.parse(raw).accessToken : undefined;
        } catch {
            token = undefined;
        }

        const path = preview ? "/admin/preview/landing" : "/public/landing";
        api<LandingSection[]>(path, {}, token)
            .then((rows) => setSections(rows.map((section) =>
                preview ? { ...section, publishedContent: section.draftContent } : section,
            )))
            .catch((requestError) => setError(requestError.message));
    }, [preview]);

    const seo = sections.find((section) => section.key === "seo")?.publishedContent as any;

    useEffect(() => {
        document.documentElement.lang = lang === "en" ? "en" : "bn";
        if (!seo) return;

        const title = langText(seo.metaTitleBn, seo.metaTitleEn, lang);
        const description = langText(seo.metaDescriptionBn, seo.metaDescriptionEn, lang);
        if (title) document.title = title;

        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "description");
            document.head.appendChild(meta);
        }
        if (description) meta.setAttribute("content", description);

        for (const [property, value] of [
            ["og:title", title],
            ["og:description", description],
            ["og:type", "profile"],
        ]) {
            let tag = document.querySelector(`meta[property="${property}"]`);
            if (!tag) {
                tag = document.createElement("meta");
                tag.setAttribute("property", property);
                document.head.appendChild(tag);
            }
            tag.setAttribute("content", value);
        }

        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
        }
        canonical.href = window.location.origin + window.location.pathname;

        let ld = document.getElementById("doctor-jsonld");
        if (!ld) {
            ld = document.createElement("script");
            ld.id = "doctor-jsonld";
            ld.setAttribute("type", "application/ld+json");
            document.head.appendChild(ld);
        }
        ld.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Physician",
            name: "Professor Dr. Muhammad Abdullahel Kafi",
            medicalSpecialty: "Gastroenterology",
            url: canonical.href,
            areaServed: { "@type": "Country", name: "Bangladesh" },
        });
    }, [lang, seo]);

    const ordered = [...sections]
        .filter((section) => section.enabled && !["seo", "branding", "videoSection"].includes(section.key))
        .sort((a, b) => a.sortOrder - b.sortOrder);

    return (
        <div>
            {preview && (
                <div className="sticky top-0 z-50 bg-amber-100 px-4 py-2 text-center text-sm font-bold text-amber-950">
                    Draft preview — not publicly published
                </div>
            )}

            {error && (
                <div className="container-shell py-4 text-sm text-muted" role="status">
                    {lang === "bn"
                        ? "ওয়েবসাইটের তথ্য লোড করা যাচ্ছে না।"
                        : "Website content is temporarily unavailable."}
                </div>
            )}

            {ordered.map((section) => {
                const content = (section.publishedContent || {}) as Content;
                const heading = langText(content.headingBn || section.title, content.headingEn || section.title, lang);
                const body = langText(content.bodyBn, content.bodyEn, lang);

                if (section.key === "hero") {
                    return <HeroSlider key={section.id} content={content} lang={lang} />;
                }

                if (section.key === "contact") {
                    return (
                        <section id="contact" key={section.id} className="container-shell section-pad">
                            <div className="rounded-3xl bg-[#10354e] p-8 text-white md:p-12">
                                <h2 className="text-3xl font-extrabold">{heading || sectionNames.contact[lang as "bn" | "en"]}</h2>
                                <p className="mt-3 max-w-2xl text-white/75">{body}</p>
                                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                    {content.phone && <a className="flex items-center gap-3" href={`tel:${content.phone}`}><Phone />{content.phone}</a>}
                                    {content.email && <a className="flex items-center gap-3" href={`mailto:${content.email}`}><span>@</span>{content.email}</a>}
                                    {(content.addressBn || content.addressEn) && <p className="flex items-center gap-3"><MapPin />{langText(content.addressBn, content.addressEn, lang)}</p>}
                                </div>
                            </div>
                        </section>
                    );
                }

                return (
                    <section id={section.key} key={section.id} className="container-shell section-pad">
                        <div className="mx-auto mb-9 max-w-3xl text-center">
                            <p className="section-kicker">{sectionNames[section.key]?.[lang as "bn" | "en"] || section.key}</p>
                            <h2 className="section-title">{heading || sectionNames[section.key]?.[lang as "bn" | "en"]}</h2>
                            {body && <p className="section-description">{body}</p>}
                        </div>

                        {section.key === "about" && content.imageUrl && (
                            <img src={resolveImageUrl(content.imageUrl)} alt={heading} className="mx-auto mb-7 max-h-96 rounded-2xl object-cover" />
                        )}
                        {section.key === "about" && body && (
                            <p className="mx-auto max-w-4xl text-center leading-8 text-muted">{body}</p>
                        )}

                        {content.items && (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {content.items.map((item, index) => (
                                    <article key={index} className="feature-card">
                                        <span className="feature-icon">
                                            {section.key === "qualifications" ? <GraduationCap /> : section.key === "experience" ? <BriefcaseMedical /> : <Stethoscope />}
                                        </span>
                                        <h3 className="text-lg font-extrabold">{langText(item.titleBn, item.titleEn, lang)}</h3>
                                        <p className="mt-2 text-sm leading-7 text-muted">{langText(item.descriptionBn, item.descriptionEn, lang)}</p>
                                        <p className="mt-2 text-xs font-bold text-teal">{langText(item.metaBn, item.metaEn, lang)}</p>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                );
            })}

            <HealthVideos preview={preview} />
        </div>
    );
}
