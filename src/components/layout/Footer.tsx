
import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { API_BASE, api, type LandingSection } from "../../lib/api";

type FooterData = {
    branding: Record<string, any>;
    contact: Record<string, any>;
    about: Record<string, any>;
    specializations: Record<string, any>;
    chambers: Record<string, any>;
};

const initialData: FooterData = {
    branding: {},
    contact: {},
    about: {},
    specializations: {},
    chambers: {},
};

function getAssetUrl(path?: string) {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    const base = API_BASE.replace(/\/api\/?$/, "");
    return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function Footer() {
    const { i18n } = useTranslation();
    const bn = i18n.language !== "en";

    const [data, setData] = useState<FooterData>(initialData);

    useEffect(() => {
        api<LandingSection[]>("/public/landing")
            .then((rows) => {
                const getContent = (key: string) =>
                    rows.find((row) => row.key === key)?.publishedContent || {};

                setData({
                    branding: getContent("branding"),
                    contact: getContent("contact"),
                    about: getContent("about"),
                    specializations: getContent("specializations"),
                    chambers: getContent("chambers"),
                });
            })
            .catch(() => {});
    }, []);

    const { branding, contact, about, specializations, chambers } = data;

    const doctorName = bn
        ? contact.footerNameBn ||
        branding.nameBn ||
        about.headingBn ||
        "অধ্যাপক ডা. মুহাম্মদ আব্দুল্লাহেল কাফি"
        : contact.footerNameEn ||
        branding.nameEn ||
        about.headingEn ||
        "Professor Dr. Muhammad Abdullahel Kafi";

    const designation = bn
        ? contact.footerDesignationBn ||
        branding.subtitleBn ||
        about.subtitleBn ||
        "গ্যাস্ট্রোএন্টারোলজি বিশেষজ্ঞ"
        : contact.footerDesignationEn ||
        branding.subtitleEn ||
        about.subtitleEn ||
        "Gastroenterology Specialist";

    const logoUrl = getAssetUrl(
        contact.footerLogoUrl || branding.logoUrl || branding.imageUrl,
    );

    const phone = contact.phone || "09666 787801";
    const email = contact.email || "";

    const expertiseItems = Array.isArray(specializations.items)
        ? specializations.items
        : [];

    const chamberItems = Array.isArray(chambers.items)
        ? chambers.items.slice(0, 2)
        : [];

    const chamberHeading = bn
        ? contact.footerChamberHeadingBn || "চেম্বারের তথ্য"
        : contact.footerChamberHeadingEn || "Chamber Information";

    const fallbackAddress = bn
        ? contact.addressBn || "ঢাকা, বাংলাদেশ"
        : contact.addressEn || "Dhaka, Bangladesh";

    const footerInfo = bn
        ? contact.footerInfoBn
        : contact.footerInfoEn;

    const copyright = bn
        ? contact.copyrightBn
        : contact.copyrightEn;

    const currentYear = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="container-shell">
                <div className="footer-top">
                    <div className="footer-main">
                        {/* Doctor information */}
                        <div className="footer-brand">
                            {logoUrl && (
                                <img
                                    src={logoUrl}
                                    alt={`${doctorName} logo`}
                                    className="footer-logo"
                                />
                            )}

                            <h2 className="footer-doctor-name">
                                {doctorName}
                            </h2>

                            <p className="footer-doctor-subtitle">
                                {designation}
                            </p>

                            <div className="footer-expertise">
                                <h3 className="footer-subheading">
                                    {bn
                                        ? "বিশেষজ্ঞতার ক্ষেত্র"
                                        : "Areas of Expertise"}
                                </h3>

                                {expertiseItems.length > 0 ? (
                                    <ul>
                                        {expertiseItems.map(
                                            (
                                                item: Record<string, any>,
                                                index: number,
                                            ) => {
                                                const title = bn
                                                    ? item.titleBn || item.titleEn
                                                    : item.titleEn || item.titleBn;

                                                return title ? (
                                                    <li key={item.id || index}>
                                                        {title}
                                                    </li>
                                                ) : null;
                                            },
                                        )}
                                    </ul>
                                ) : (
                                    <p>
                                        {bn
                                            ? "পরিপাকতন্ত্র, লিভার ও অগ্ন্যাশয় রোগের চিকিৎসা"
                                            : "Digestive system, liver and pancreatic care"}
                                    </p>
                                )}
                            </div>

                            {/* General contact information */}
                            <div className="footer-general-contact">
                                {phone && (
                                    <a
                                        href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                                        className="footer-contact-item"
                                    >
                                        <span className="footer-contact-icon">
                                            <Phone size={17} />
                                        </span>
                                        <span>{phone}</span>
                                    </a>
                                )}

                                {email && (
                                    <a
                                        href={`mailto:${email}`}
                                        className="footer-contact-item"
                                    >
                                        <span className="footer-contact-icon">
                                            <Mail size={17} />
                                        </span>
                                        <span>{email}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Chamber information - right side */}
                        <div className="footer-chambers">
                            <h3 className="footer-heading">
                                {chamberHeading}
                            </h3>

                            {chamberItems.length > 0 ? (
                                <div className="footer-chamber-grid">
                                    {chamberItems.map(
                                        (
                                            item: Record<string, any>,
                                            index: number,
                                        ) => {
                                            const title = bn
                                                ? item.titleBn || item.titleEn
                                                : item.titleEn || item.titleBn;

                                            const address = bn
                                                ? item.descriptionBn ||
                                                item.descriptionEn
                                                : item.descriptionEn ||
                                                item.descriptionBn;

                                            const visitingTime = bn
                                                ? item.metaBn || item.metaEn
                                                : item.metaEn || item.metaBn;

                                            return (
                                                <div
                                                    className="footer-chamber-item"
                                                    key={item.id || index}
                                                >
                                                    {title && (
                                                        <h4>{title}</h4>
                                                    )}

                                                    {address && (
                                                        <div className="footer-contact-item">
                                                            <span className="footer-contact-icon">
                                                                <MapPin size={17} />
                                                            </span>
                                                            <span>{address}</span>
                                                        </div>
                                                    )}

                                                    {visitingTime && (
                                                        <div className="footer-contact-item">
                                                            <span className="footer-contact-icon">
                                                                <Clock size={17} />
                                                            </span>
                                                            <span>{visitingTime}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            ) : (
                                <div className="footer-chamber-grid">
                                    <div className="footer-chamber-item">
                                        <div className="footer-contact-item">
                                            <span className="footer-contact-icon">
                                                <MapPin size={17} />
                                            </span>
                                            <span>{fallbackAddress}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="footer-divider" />

                {/* Footer bottom */}
                <div className="footer-bottom">
                    <div className="footer-bottom-info">
                        {footerInfo && <p>{footerInfo}</p>}
                    </div>

                    <div className="footer-bottom-copyright">
                        <p>
                            {copyright ||
                                `© ${currentYear} ${doctorName}. ${
                                    bn
                                        ? "সর্বস্বত্ব সংরক্ষিত।"
                                        : "All rights reserved."
                                }`}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
