
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import i18n from "../../i18n";
import { api, type LandingSection } from "../../lib/api";

type HeaderContent = Record<string, any>;

export function Header() {
    const [open, setOpen] = useState(false);
    const [brand, setBrand] = useState<HeaderContent>({});
    const [contact, setContact] = useState<HeaderContent>({});
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        api<LandingSection[]>("/public/landing")
            .then((rows) => {
                setBrand(
                    rows.find((row) => row.key === "branding")?.publishedContent || {},
                );
                setContact(
                    rows.find((row) => row.key === "contact")?.publishedContent || {},
                );
            })
            .catch(() => {});
    }, []);

    // Detect page scrolling for the sticky header background.
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const toggle = () =>
        void i18n.changeLanguage(i18n.language === "en" ? "bn" : "en");

    // Navigation follows the public landing-page section order.
    // Home and Professional Experience links have been removed.
    const links = [
        { id: "about", bn: "চিকিৎসক পরিচিতি", en: "About the Doctor" },
        { id: "specializations", bn: "বিশেষজ্ঞতার ক্ষেত্র", en: "Expertise" },
        { id: "chambers", bn: "চেম্বার ও সময়", en: "Chambers & Hours" },
        { id: "videos", bn: "স্বাস্থ্য সচেতনতামূলক ভিডিও", en: "Health Videos" },
    ];

    const lang = i18n.language;
    const phone = contact.phone || "09666 787801";

    return (
        <>
            <div className="top-contact">
                <div className="container-shell top-contact-inner">
                    <span>
                        {lang === "bn"
                            ? "পরিপাকতন্ত্র · লিভার · অগ্ন্যাশয়"
                            : "Digestive Health · Liver · Pancreas"}
                    </span>

                    <span className="flex items-center gap-2">
                        <Phone size={13} />
                        <a href={`tel:${phone}`} className="font-bold">
                            {phone}
                        </a>
                        <span className="mx-2 text-white/30">|</span>
                        Dhaka, Bangladesh
                    </span>
                </div>
            </div>

            <header
                className={`site-header ${isScrolled ? "is-scrolled" : ""}`}
            >
                <div className="container-shell flex min-h-[82px] items-center justify-between gap-4">
                    <Link to="/" className="flex min-w-0 items-center gap-3">
                        <span className="brand-mark">
                            {brand.logoText || "MK"}
                        </span>

                        <span className="min-w-0">
                            <span className="brand-title">
                                {lang === "bn"
                                    ? brand.nameBn || "অধ্যাপক ডা. মুহাম্মদ আব্দুল্লাহেল কাফি"
                                    : brand.nameEn || "Professor Dr. Muhammad Abdullahel Kafi"}
                            </span>

                            <small className="brand-subtitle">
                                {lang === "bn"
                                    ? brand.subtitleBn || "গ্যাস্ট্রোএন্টারোলজি বিশেষজ্ঞ"
                                    : brand.subtitleEn || "Gastroenterology Specialist"}
                            </small>
                        </span>
                    </Link>

                    <nav
                        aria-label="Main navigation"
                        className="hidden items-center gap-5 xl:flex"
                    >
                        {links.map((link) => (
                            <a
                                key={link.id}
                                className="nav-link"
                                href={`/#${link.id}`}
                            >
                                {lang === "bn" ? link.bn : link.en}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggle}
                            className="header-action-button rounded-full border px-3 py-2 text-xs font-bold"
                            aria-label={
                                lang === "bn"
                                    ? "Switch to English"
                                    : "বাংলায় পরিবর্তন করুন"
                            }
                        >
                            {lang === "en" ? "বাংলা" : "English"}
                        </button>

                        <button
                            onClick={() => setOpen(!open)}
                            className="header-action-button rounded-lg border p-2 xl:hidden"
                            aria-expanded={open}
                            aria-label="Toggle navigation"
                        >
                            {open ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {open && (
                    <nav
                        aria-label="Mobile navigation"
                        className="mobile-header-menu grid gap-1 border-t px-6 py-4 xl:hidden"
                    >
                        {links.map((link) => (
                            <a
                                onClick={() => setOpen(false)}
                                key={link.id}
                                href={`/#${link.id}`}
                                className="mobile-header-link rounded-lg px-3 py-2 text-sm font-semibold"
                            >
                                {lang === "bn" ? link.bn : link.en}
                            </a>
                        ))}
                    </nav>
                )}
            </header>
        </>
    );
}
