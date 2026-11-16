
import { useEffect, useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api, type LandingSection } from "../../lib/api";

type FooterData = Record<string, any>;

export function Footer() {
    const { i18n } = useTranslation();
    const bn = i18n.language !== "en";

    const [data, setData] = useState<FooterData>({});

    useEffect(() => {
        api<LandingSection[]>("/public/landing")
            .then((rows) => {
                const branding =
                    rows.find((row) => row.key === "branding")?.publishedContent || {};

                const contact =
                    rows.find((row) => row.key === "contact")?.publishedContent || {};

                setData({ ...branding, ...contact });
            })
            .catch(() => {});
    }, []);

    const phone = data.phone || "09666 787801";

    const address = bn
        ? data.addressBn || "ঢাকা, বাংলাদেশ"
        : data.addressEn || "Dhaka, Bangladesh";

    const doctorName = bn
        ? data.nameBn || "অধ্যাপক ডা. মুহাম্মদ আব্দুল্লাহেল কাফি"
        : data.nameEn || "Professor Dr. Muhammad Abdullahel Kafi";

    const subtitle = bn
        ? data.subtitleBn || "গ্যাস্ট্রোএন্টারোলজি বিশেষজ্ঞ"
        : data.subtitleEn || "Gastroenterology Specialist";

    const currentYear = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="container-shell">
                <div className="footer-main">
                    <div className="footer-brand">
                        <h2 className="footer-doctor-name">
                            {doctorName}
                        </h2>

                        <p className="footer-doctor-subtitle">
                            {subtitle}
                        </p>
                    </div>

                    <div className="footer-contact">
                        <h3 className="footer-heading">
                            {bn ? "যোগাযোগ" : "Contact Information"}
                        </h3>

                        <div className="footer-contact-list">
                            <a
                                href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                                className="footer-contact-item"
                            >
                                <span className="footer-contact-icon">
                                    <Phone size={17} />
                                </span>
                                <span>{phone}</span>
                            </a>

                            {data.email && (
                                <a
                                    href={`mailto:${data.email}`}
                                    className="footer-contact-item"
                                >
                                    <span className="footer-contact-icon">
                                        <Mail size={17} />
                                    </span>
                                    <span>{data.email}</span>
                                </a>
                            )}

                            <div className="footer-contact-item">
                                <span className="footer-contact-icon">
                                    <MapPin size={17} />
                                </span>
                                <span>{address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>
                        © {currentYear} {doctorName}.{" "}
                        {bn ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
                    </p>
                </div>
            </div>
        </footer>
    );
}
