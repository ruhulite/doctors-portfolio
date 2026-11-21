
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    Clock,
    GraduationCap,
    MapPin,
    Phone,
    Stethoscope,
} from "lucide-react";

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

type ContentItem = {
    titleBn?: string;
    titleEn?: string;

    descriptionBn?: string;
    descriptionEn?: string;

    metaBn?: string;
    metaEn?: string;

    addressBn?: string;
    addressEn?: string;

    visitingDaysBn?: string;
    visitingDaysEn?: string;

    visitingHoursBn?: string;
    visitingHoursEn?: string;

    appointmentNumber?: string;
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
    items?: ContentItem[];
    qualificationItems?: ContentItem[];
    phone?: string;
    email?: string;
    addressBn?: string;
    addressEn?: string;
    ctaTextBn?: string;
    ctaTextEn?: string;
};

const langText = (
    bn?: string,
    en?: string,
    lang?: string
) => (lang === "en" ? en || bn || "" : bn || en || "");

const resolveImageUrl = (url?: string) => {
    if (!url) return "";

    if (/^https?:\/\//i.test(url)) return url;

    const backendOrigin = API_BASE.replace(/\/api\/?$/, "");

    return `${backendOrigin}${url.startsWith("/") ? "" : "/"}${url}`;
};

const sectionNames: Record<string, { bn: string; en: string }> = {
    hero: {
        bn: "স্বাগতম",
        en: "Welcome",
    },
    stats: {
        bn: "পরিসংখ্যান",
        en: "Statistics",
    },
    about: {
        bn: "চিকিৎসক পরিচিতি",
        en: "About the Doctor",
    },
    specializations: {
        bn: "বিশেষজ্ঞতার ক্ষেত্র",
        en: "Areas of Expertise",
    },
    chambers: {
        bn: "চেম্বার ও সাক্ষাতের সময়",
        en: "Chambers & Visiting Hours",
    },
};

function getHeroSlides(content: Content): HeroSlide[] {
    if (Array.isArray(content.slides)) {
        return content.slides.filter(
            (slide) => slide.enabled !== false
        );
    }

    const hasLegacyContent = Boolean(
        content.headingBn ||
        content.headingEn ||
        content.subtitleBn ||
        content.subtitleEn ||
        content.bodyBn ||
        content.bodyEn ||
        content.imageUrl ||
        content.ctaTextBn ||
        content.ctaTextEn
    );

    return hasLegacyContent
        ? [{ ...content, id: "legacy-hero" }]
        : [];
}

/* -------------------------------------------------------
   HERO SLIDER
------------------------------------------------------- */

function HeroSlider({
                        content,
                        lang,
                    }: {
    content: Content;
    lang: string;
}) {
    const slides = getHeroSlides(content);
    const [activeIndex, setActiveIndex] = useState(0);
    const bn = lang !== "en";

    useEffect(() => {
        setActiveIndex(0);
    }, [slides.length]);

    useEffect(() => {
        if (slides.length < 2) return;

        const timer = window.setInterval(() => {
            setActiveIndex(
                (current) => (current + 1) % slides.length
            );
        }, 6500);

        return () => window.clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return null;

    const slide = slides[activeIndex] || slides[0];

    const heading = langText(
        slide.headingBn,
        slide.headingEn,
        lang
    );

    const subtitle = langText(
        slide.subtitleBn,
        slide.subtitleEn,
        lang
    );

    const body = langText(
        slide.bodyBn,
        slide.bodyEn,
        lang
    );

    const ctaText = langText(
        slide.ctaTextBn,
        slide.ctaTextEn,
        lang
    );

    const showPrevious = () =>
        setActiveIndex(
            (current) =>
                (current - 1 + slides.length) % slides.length
        );

    const showNext = () =>
        setActiveIndex(
            (current) => (current + 1) % slides.length
        );

    return (
        <section
            id="hero"
            className="hero-medical hero-overlay-slider"
        >
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
                        {subtitle && (
                            <p className="hero-kicker">
                                {subtitle}
                            </p>
                        )}

                        {heading && (
                            <h1 className="hero-title">
                                {heading}
                            </h1>
                        )}

                        {body && (
                            <p className="hero-description">
                                {body}
                            </p>
                        )}

                        {ctaText && (
                            <a
                                className="mt-7 inline-flex rounded-full bg-teal px-6 py-3 font-bold text-deep transition-colors hover:bg-white hover:text-deep"
                                href={slide.ctaUrl || "#about"}
                            >
                                {ctaText}
                            </a>
                        )}
                    </div>
                </div>

                {slides.length > 1 && (
                    <div
                        className="hero-slider-controls"
                        aria-label={
                            bn
                                ? "হিরো স্লাইড নিয়ন্ত্রণ"
                                : "Hero slide controls"
                        }
                    >
                        <button
                            type="button"
                            className="hero-slider-arrow"
                            onClick={showPrevious}
                            aria-label={
                                bn ? "আগের স্লাইড" : "Previous slide"
                            }
                        >
                            <ArrowLeft size={19} />
                        </button>

                        <div className="hero-slider-dots">
                            {slides.map((item, index) => (
                                <button
                                    key={item.id || index}
                                    type="button"
                                    className={`hero-slider-dot ${
                                        index === activeIndex
                                            ? "is-active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setActiveIndex(index)
                                    }
                                    aria-label={`${
                                        bn ? "স্লাইড" : "Slide"
                                    } ${index + 1}`}
                                    aria-current={
                                        index === activeIndex
                                            ? "true"
                                            : undefined
                                    }
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            className="hero-slider-arrow"
                            onClick={showNext}
                            aria-label={
                                bn ? "পরের স্লাইড" : "Next slide"
                            }
                        >
                            <ArrowRight size={19} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

/* -------------------------------------------------------
   STATISTICS
------------------------------------------------------- */

function StatsBand({
                       content,
                       lang,
                   }: {
    content: Content;
    lang: string;
}) {
    const bn = lang !== "en";

    const defaultItems: ContentItem[] = [
        {
            titleBn: "16+",
            titleEn: "16+",
            descriptionBn: "বছরের অভিজ্ঞতা*",
            descriptionEn: "Years of Experience*",
        },
        {
            titleBn: "2",
            titleEn: "2",
            descriptionBn: "ঢাকায় চেম্বার",
            descriptionEn: "Chambers in Dhaka",
        },
        {
            titleBn: "5",
            titleEn: "5",
            descriptionBn: "সপ্তাহে সাক্ষাতের দিন",
            descriptionEn: "Consultation Days per Week",
        },
    ];

    const items =
        content.items && content.items.length > 0
            ? content.items.slice(0, 3)
            : defaultItems;

    const backgroundImage = resolveImageUrl(content.imageUrl);

    return (
        <section
            id="stats"
            className="stats-band stats-band-section"
            style={{
                backgroundImage: `
                    linear-gradient(
                        105deg,
                        rgba(29, 210, 200, 0.92),
                        rgba(29, 210, 200, 0.78)
                    ),
                    url("${backgroundImage || "/images/hero-1.jpg"}")
                `,
                backgroundPosition: "center",
                backgroundSize: "cover",
            }}
            aria-label={
                bn
                    ? "চিকিৎসকের পরিসংখ্যান"
                    : "Doctor statistics"
            }
        >
            <div className="container-shell stats-band-inner">
                {items.map((item, index) => (
                    <div className="stats-cell" key={index}>
                        <strong
                            className="stats-number"
                            style={{
                                fontSize: "32px",
                                fontWeight: 850,
                            }}
                        >
                            {langText(
                                item.titleBn,
                                item.titleEn,
                                lang
                            )}
                        </strong>

                        <span>
                            {langText(
                                item.descriptionBn,
                                item.descriptionEn,
                                lang
                            )}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* -------------------------------------------------------
   CHAMBER CARD
------------------------------------------------------- */

function ChamberCard({
                         item,
                         index,
                         lang,
                     }: {
    item: ContentItem;
    index: number;
    lang: string;
}) {
    const bn = lang !== "en";

    const title = langText(
        item.titleBn,
        item.titleEn,
        lang
    );

    // New CMS fields with backward compatibility.
    const address = langText(
        item.addressBn || item.descriptionBn,
        item.addressEn || item.descriptionEn,
        lang
    );

    const visitingDays = langText(
        item.visitingDaysBn,
        item.visitingDaysEn,
        lang
    );

    const visitingHours = langText(
        item.visitingHoursBn || item.metaBn,
        item.visitingHoursEn || item.metaEn,
        lang
    );

    const appointmentNumber =
        item.appointmentNumber?.trim() || "";

    const telephoneLink = appointmentNumber.replace(
        /[^\d+]/g,
        ""
    );

    return (
        <article className="chamber-panel">
            {/* Chamber heading */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-[.15em] text-teal">
                        {bn
                            ? `চেম্বার ${index + 1}`
                            : `Chamber ${index + 1}`}
                    </span>

                    <h3 className="mt-2 text-2xl font-extrabold">
                        {title}
                    </h3>
                </div>

                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-mint text-teal">
                    <MapPin size={22} />
                </span>
            </div>

            {/* Address */}
            {address && (
                <div className="mt-5 flex gap-3 text-sm text-muted">
                    <MapPin
                        size={18}
                        className="mt-0.5 shrink-0 text-teal"
                    />

                    <div className="min-w-0">
                        <p className="text-xs font-extrabold text-ink">
                            {bn ? "ঠিকানা" : "Address"}
                        </p>

                        <p className="mt-1 leading-6">
                            {address}
                        </p>
                    </div>
                </div>
            )}

            {/* Appointment phone */}
            {appointmentNumber && (
                <div className="mt-5 flex gap-3 text-sm text-muted">
                    <Phone
                        size={18}
                        className="mt-0.5 shrink-0 text-teal"
                    />

                    <div className="min-w-0">
                        <p className="text-xs font-extrabold text-ink">
                            {bn
                                ? "অ্যাপয়েন্টমেন্ট ফোন"
                                : "Appointment Phone"}
                        </p>

                        <a
                            href={`tel:${telephoneLink}`}
                            className="mt-1 inline-block font-medium hover:text-teal"
                        >
                            {appointmentNumber}
                        </a>
                    </div>
                </div>
            )}

            {/* Visiting hours */}
            {visitingHours && (
                <div className="mt-5 flex gap-3 text-sm text-muted">
                    <Clock
                        size={18}
                        className="mt-0.5 shrink-0 text-teal"
                    />

                    <div className="min-w-0">
                        <p className="text-xs font-extrabold text-ink">
                            {bn
                                ? "সাক্ষাতের সময়"
                                : "Visiting Hours"}
                        </p>

                        <p className="mt-1 leading-6">
                            {visitingHours}
                        </p>
                    </div>
                </div>
            )}

            {/* Visiting days */}
            {visitingDays && (
                <div className="mt-5 flex gap-3 border-t border-line pt-4 text-sm text-muted">
                    <CalendarDays
                        size={18}
                        className="mt-0.5 shrink-0 text-teal"
                    />

                    <div className="min-w-0">
                        <p className="text-xs font-extrabold text-ink">
                            {bn
                                ? "সাক্ষাতের দিন"
                                : "Visiting Days"}
                        </p>

                        <p className="mt-1 leading-6">
                            {visitingDays}
                        </p>
                    </div>
                </div>
            )}

            {/* Appointment button */}
            {appointmentNumber && (
                <a
                    href={`tel:${telephoneLink}`}
                    className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-teal transition-colors hover:text-deep"
                >
                    {bn
                        ? "অ্যাপয়েন্টমেন্টের জন্য ফোন করুন"
                        : "Call for Appointment"}

                    <ArrowRight size={14} />
                </a>
            )}
        </article>
    );
}

/* -------------------------------------------------------
   HOME PAGE
------------------------------------------------------- */

export function HomePage() {
    const { i18n } = useTranslation();
    const lang = i18n.language;

    const [sections, setSections] = useState<LandingSection[]>([]);
    const [error, setError] = useState("");

    const preview =
        new URLSearchParams(window.location.search).get(
            "preview"
        ) === "1";

    useEffect(() => {
        let token: string | undefined;

        try {
            const raw = sessionStorage.getItem(
                "kafi_cms_session"
            );

            token = raw
                ? JSON.parse(raw).accessToken
                : undefined;
        } catch {
            token = undefined;
        }

        const path = preview
            ? "/admin/preview/landing"
            : "/public/landing";

        api<LandingSection[]>(path, {}, token)
            .then((rows) =>
                setSections(
                    rows.map((section) =>
                        preview
                            ? {
                                ...section,
                                publishedContent:
                                section.draftContent,
                            }
                            : section
                    )
                )
            )
            .catch((requestError) =>
                setError(requestError.message)
            );
    }, [preview]);

    const seo = sections.find(
        (section) => section.key === "seo"
    )?.publishedContent as any;

    /* SEO metadata */
    useEffect(() => {
        document.documentElement.lang =
            lang === "en" ? "en" : "bn";

        if (!seo) return;

        const title = langText(
            seo.metaTitleBn,
            seo.metaTitleEn,
            lang
        );

        const description = langText(
            seo.metaDescriptionBn,
            seo.metaDescriptionEn,
            lang
        );

        if (title) {
            document.title = title;
        }

        let meta = document.querySelector(
            'meta[name="description"]'
        );

        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "description");
            document.head.appendChild(meta);
        }

        if (description) {
            meta.setAttribute("content", description);
        }

        for (const [property, value] of [
            ["og:title", title],
            ["og:description", description],
            ["og:type", "profile"],
        ]) {
            let tag = document.querySelector(
                `meta[property="${property}"]`
            );

            if (!tag) {
                tag = document.createElement("meta");
                tag.setAttribute("property", property);
                document.head.appendChild(tag);
            }

            tag.setAttribute("content", value);
        }

        let canonical = document.querySelector(
            'link[rel="canonical"]'
        ) as HTMLLinkElement | null;

        if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
        }

        canonical.href =
            window.location.origin + window.location.pathname;

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
            areaServed: {
                "@type": "Country",
                name: "Bangladesh",
            },
        });
    }, [lang, seo]);

    /* Landing page section order */
    const landingOrder = [
        "hero",
        "stats",
        "about",
        "specializations",
        "chambers",
    ];

    const ordered = [...sections]
        .filter(
            (section) =>
                section.enabled &&
                landingOrder.includes(section.key)
        )
        .sort(
            (a, b) =>
                landingOrder.indexOf(a.key) -
                landingOrder.indexOf(b.key)
        );

    /* Doctor profile content */
    const aboutSection = sections.find(
        (section) => section.key === "about"
    );

    const aboutContent = (
        preview
            ? aboutSection?.draftContent
            : aboutSection?.publishedContent
    ) as Content | undefined;

    /* Qualifications */
    const qualificationsSection = sections.find(
        (section) => section.key === "qualifications"
    );

    const qualificationsContent = (
        preview
            ? qualificationsSection?.draftContent
            : qualificationsSection?.publishedContent
    ) as Content | undefined;

    const qualificationItems = Array.isArray(
        qualificationsContent?.items
    )
        ? qualificationsContent.items
        : Array.isArray(aboutContent?.qualificationItems)
            ? aboutContent.qualificationItems
            : [];

    return (
        <div>
            {/* Draft preview notice */}
            {preview && (
                <div className="sticky top-0 z-50 bg-amber-100 px-4 py-2 text-center text-sm font-bold text-amber-950">
                    Draft preview — not publicly published
                </div>
            )}

            {/* Loading error */}
            {error && (
                <div
                    className="container-shell py-4 text-sm text-muted"
                    role="status"
                >
                    {lang === "bn"
                        ? "ওয়েবসাইটের তথ্য লোড করা যাচ্ছে না।"
                        : "Website content is temporarily unavailable."}
                </div>
            )}

            {/* Landing sections */}
            {ordered.map((section) => {
                const content = (
                    preview
                        ? section.draftContent
                        : section.publishedContent
                ) as Content;

                const heading = sectionNames[section.key]
                    ? sectionNames[section.key][
                        lang === "en" ? "en" : "bn"
                        ]
                    : langText(
                        content.headingBn || section.title,
                        content.headingEn || section.title,
                        lang
                    );

                const subtitle = langText(
                    content.subtitleBn,
                    content.subtitleEn,
                    lang
                );

                const body = langText(
                    content.bodyBn,
                    content.bodyEn,
                    lang
                );

                /* Hero */
                if (section.key === "hero") {
                    return (
                        <HeroSlider
                            key={section.id}
                            content={content}
                            lang={lang}
                        />
                    );
                }

                /* Statistics */
                if (section.key === "stats") {
                    return (
                        <StatsBand
                            key={section.id}
                            content={content}
                            lang={lang}
                        />
                    );
                }

                /* Doctor profile */
                if (section.key === "about") {
                    const doctorName = langText(
                        content.headingBn,
                        content.headingEn,
                        lang
                    );

                    return (
                        <section
                            id="about"
                            key={section.id}
                        >
                            <div className="container-shell section-pad">
                                <div className="about-panel about-profile-layout">
                                    <div className="about-art about-art-photo about-profile-visual">
                                        {content.imageUrl ? (
                                            <img
                                                src={resolveImageUrl(
                                                    content.imageUrl
                                                )}
                                                alt={
                                                    doctorName ||
                                                    (lang === "en"
                                                        ? "Doctor profile"
                                                        : "চিকিৎসকের ছবি")
                                                }
                                                className="about-profile-image"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="about-profile-image-placeholder">
                                                <Stethoscope size={58} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="about-profile-content">
                                        <p className="section-kicker">
                                            {lang === "en"
                                                ? "DOCTOR PROFILE"
                                                : "চিকিৎসক পরিচিতি"}
                                        </p>

                                        {doctorName && (
                                            <h2 className="about-doctor-name">
                                                {doctorName}
                                            </h2>
                                        )}

                                        {subtitle && (
                                            <h3 className="about-doctor-subtitle">
                                                {subtitle}
                                            </h3>
                                        )}

                                        {body && (
                                            <p className="section-description">
                                                {body}
                                            </p>
                                        )}

                                        {qualificationItems.length > 0 && (
                                            <div className="qualification-grid mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {qualificationItems.map(
                                                    (item, index) => (
                                                        <article
                                                            key={index}
                                                            className="qualification-item about-qualification-card"
                                                        >
                                                            <span className="about-qualification-icon">
                                                                <GraduationCap size={18} />
                                                            </span>

                                                            <div className="min-w-0">
                                                                <h3 className="about-qualification-title">
                                                                    {langText(
                                                                        item.titleBn,
                                                                        item.titleEn,
                                                                        lang
                                                                    )}
                                                                </h3>

                                                                {(item.descriptionBn ||
                                                                    item.descriptionEn) && (
                                                                    <p className="about-qualification-description">
                                                                        {langText(
                                                                            item.descriptionBn,
                                                                            item.descriptionEn,
                                                                            lang
                                                                        )}
                                                                    </p>
                                                                )}

                                                                {(item.metaBn ||
                                                                    item.metaEn) && (
                                                                    <p className="about-qualification-meta">
                                                                        {langText(
                                                                            item.metaBn,
                                                                            item.metaEn,
                                                                            lang
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </article>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                }

                /* Chambers */
                if (section.key === "chambers") {
                    return (
                        <section
                            id="chambers"
                            key={section.id}
                            className="chambers-section section-pad"
                        >
                            <div className="container-shell">
                                <div className="mx-auto mb-9 max-w-3xl text-center">
                                    <p className="section-kicker">
                                        {sectionNames.chambers[
                                            lang === "en" ? "en" : "bn"
                                            ]}
                                    </p>

                                    <h2 className="section-title">
                                        {heading ||
                                            sectionNames.chambers[
                                                lang === "en"
                                                    ? "en"
                                                    : "bn"
                                                ]}
                                    </h2>

                                    {subtitle && (
                                        <p className="section-description">
                                            {subtitle}
                                        </p>
                                    )}

                                    {body && (
                                        <p className="section-description">
                                            {body}
                                        </p>
                                    )}
                                </div>

                                {content.items &&
                                    content.items.length > 0 && (
                                        <div className="chambers-grid">
                                            {content.items.map(
                                                (item, index) => (
                                                    <ChamberCard
                                                        key={index}
                                                        item={item}
                                                        index={index}
                                                        lang={lang}
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}
                            </div>
                        </section>
                    );
                }

                /* Other landing sections */
                return (
                    <section
                        id={section.key}
                        key={section.id}
                    >
                        <div className="container-shell section-pad">
                            <div className="mx-auto mb-9 max-w-3xl text-center">
                                <p className="section-kicker">
                                    {sectionNames[section.key]?.[
                                        lang === "en" ? "en" : "bn"
                                        ] || section.key}
                                </p>

                                <h2 className="section-title">
                                    {heading ||
                                        sectionNames[section.key]?.[
                                            lang === "en"
                                                ? "en"
                                                : "bn"
                                            ]}
                                </h2>

                                {subtitle && (
                                    <p className="section-description">
                                        {subtitle}
                                    </p>
                                )}

                                {body && (
                                    <p className="section-description">
                                        {body}
                                    </p>
                                )}
                            </div>

                            {content.items && (
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                    {content.items.map(
                                        (item, index) => (
                                            <article
                                                key={index}
                                                className="feature-card"
                                            >
                                                <span className="feature-icon">
                                                    <Stethoscope />
                                                </span>

                                                <h3 className="text-lg font-extrabold">
                                                    {langText(
                                                        item.titleBn,
                                                        item.titleEn,
                                                        lang
                                                    )}
                                                </h3>

                                                <p className="mt-2 text-sm leading-7 text-muted">
                                                    {langText(
                                                        item.descriptionBn,
                                                        item.descriptionEn,
                                                        lang
                                                    )}
                                                </p>

                                                {(item.metaBn ||
                                                    item.metaEn) && (
                                                    <p className="mt-3 text-sm font-bold text-teal">
                                                        {langText(
                                                            item.metaBn,
                                                            item.metaEn,
                                                            lang
                                                        )}
                                                    </p>
                                                )}
                                            </article>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                );
            })}

            {/* Health education videos */}
            <HealthVideos preview={preview} />
        </div>
    );
}
