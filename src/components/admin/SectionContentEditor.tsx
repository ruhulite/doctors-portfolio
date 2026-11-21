
import { useState } from "react";
import { API_BASE, api } from "../../lib/api";

type Props = {
    sectionKey: string;
    value: string;
    onChange: (value: string) => void;
    token: string;
};

type FieldConfig = {
    key: string;
    label: string;
    multiline?: boolean;
};

type ChamberItem = {
    id?: string;
    titleBn: string;
    titleEn: string;
    addressBn: string;
    addressEn: string;
    visitingHoursBn: string;
    visitingHoursEn: string;
    visitingDaysBn: string;
    visitingDaysEn: string;
    appointmentNumber: string;
    descriptionBn?: string;
    descriptionEn?: string;
    metaBn?: string;
    metaEn?: string;
};

const commonFields: FieldConfig[] = [
    { key: "headingBn", label: "Heading (Bangla)" },
    { key: "headingEn", label: "Heading (English)" },
    { key: "subtitleBn", label: "Subtitle (Bangla)" },
    { key: "subtitleEn", label: "Subtitle (English)" },
    { key: "bodyBn", label: "Description (Bangla)", multiline: true },
    { key: "bodyEn", label: "Description (English)", multiline: true },
];

const sectionFields: Record<string, FieldConfig[]> = {
    hero: [],
    stats: [],
    about: commonFields,
    qualifications: commonFields.slice(0, 2),
    specializations: commonFields.slice(2),
    chambers: commonFields.slice(2),
    contact: [
        { key: "footerNameBn", label: "Footer doctor name (Bangla)" },
        { key: "footerNameEn", label: "Footer doctor name (English)" },
        { key: "footerDesignationBn", label: "Footer designation (Bangla)" },
        { key: "footerDesignationEn", label: "Footer designation (English)" },
        { key: "footerChamberHeadingBn", label: "Chamber heading (Bangla)" },
        { key: "footerChamberHeadingEn", label: "Chamber heading (English)" },
        { key: "phone", label: "Phone number" },
        { key: "email", label: "Email address" },
        { key: "addressBn", label: "Address (Bangla)", multiline: true },
        { key: "addressEn", label: "Address (English)", multiline: true },
        { key: "footerInfoBn", label: "Footer description (Bangla)", multiline: true },
        { key: "footerInfoEn", label: "Footer description (English)", multiline: true },
        { key: "copyrightBn", label: "Copyright text (Bangla)" },
        { key: "copyrightEn", label: "Copyright text (English)" },
        { key: "footerLogoUrl", label: "Footer logo URL" },
    ],
    seo: [
        { key: "metaTitleBn", label: "SEO title (Bangla)" },
        { key: "metaTitleEn", label: "SEO title (English)" },
        { key: "metaDescriptionBn", label: "Meta description (Bangla)", multiline: true },
        { key: "metaDescriptionEn", label: "Meta description (English)", multiline: true },
    ],
    videoSection: commonFields.slice(2),
};

const itemFields: FieldConfig[] = [
    { key: "titleBn", label: "Title (Bangla)" },
    { key: "titleEn", label: "Title (English)" },
    { key: "descriptionBn", label: "Description (Bangla)", multiline: true },
    { key: "descriptionEn", label: "Description (English)", multiline: true },
    { key: "metaBn", label: "Additional information (Bangla)" },
    { key: "metaEn", label: "Additional information (English)" },
];

const chamberFields: FieldConfig[] = [
    { key: "titleBn", label: "Chamber name (Bangla)" },
    { key: "titleEn", label: "Chamber name (English)" },
    { key: "addressBn", label: "Address (Bangla)", multiline: true },
    { key: "addressEn", label: "Address (English)", multiline: true },
    { key: "visitingHoursBn", label: "Visiting hours (Bangla)" },
    { key: "visitingHoursEn", label: "Visiting hours (English)" },
    { key: "visitingDaysBn", label: "Visiting days (Bangla)" },
    { key: "visitingDaysEn", label: "Visiting days (English)" },
    { key: "appointmentNumber", label: "Appointment number" },
];

const statsFields: FieldConfig[] = [
    { key: "titleBn", label: "Number / Value (Bangla)" },
    { key: "titleEn", label: "Number / Value (English)" },
    { key: "descriptionBn", label: "Label (Bangla)" },
    { key: "descriptionEn", label: "Label (English)" },
];

const inputClass =
    "w-full rounded-lg border border-line bg-white p-3 text-sm outline-none focus:border-teal";

type HeroSlide = {
    id: string;
    enabled: boolean;
    headingBn: string;
    headingEn: string;
    subtitleBn: string;
    subtitleEn: string;
    bodyBn: string;
    bodyEn: string;
    imageUrl: string;
    ctaTextBn: string;
    ctaTextEn: string;
    ctaUrl: string;
};

function createEmptyHeroSlide(): HeroSlide {
    return {
        id: `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        enabled: true,
        headingBn: "",
        headingEn: "",
        subtitleBn: "",
        subtitleEn: "",
        bodyBn: "",
        bodyEn: "",
        imageUrl: "",
        ctaTextBn: "",
        ctaTextEn: "",
        ctaUrl: "",
    };
}

function getHeroSlides(content: Record<string, any>): HeroSlide[] {
    if (Array.isArray(content.slides)) {
        return content.slides.map(
            (slide: Record<string, any>, index: number) => ({
                ...createEmptyHeroSlide(),
                ...slide,
                id: String(slide.id || `hero-existing-${index}`),
                enabled: slide.enabled !== false,
            }),
        );
    }

    const legacyKeys = [
        "headingBn",
        "headingEn",
        "subtitleBn",
        "subtitleEn",
        "bodyBn",
        "bodyEn",
        "imageUrl",
        "ctaTextBn",
        "ctaTextEn",
        "ctaUrl",
    ];

    const hasLegacyContent = legacyKeys.some((key) => Boolean(content[key]));

    return hasLegacyContent
        ? [
            {
                ...createEmptyHeroSlide(),
                id: "hero-legacy",
                ...Object.fromEntries(
                    legacyKeys.map((key) => [key, content[key] ?? ""]),
                ),
            },
        ]
        : [];
}

function emptyItem() {
    return {
        titleBn: "",
        titleEn: "",
        descriptionBn: "",
        descriptionEn: "",
        metaBn: "",
        metaEn: "",
    };
}

function emptyChamberItem(): ChamberItem {
    return {
        titleBn: "",
        titleEn: "",
        addressBn: "",
        addressEn: "",
        visitingHoursBn: "",
        visitingHoursEn: "",
        visitingDaysBn: "",
        visitingDaysEn: "",
        appointmentNumber: "",
    };
}

function normalizeChamberItem(item: Record<string, any>): ChamberItem {
    return {
        ...emptyChamberItem(),
        ...item,

        // Read older chamber data without losing its existing values.
        addressBn: item.addressBn ?? item.descriptionBn ?? "",
        addressEn: item.addressEn ?? item.descriptionEn ?? "",
        visitingHoursBn: item.visitingHoursBn ?? item.metaBn ?? "",
        visitingHoursEn: item.visitingHoursEn ?? item.metaEn ?? "",
        visitingDaysBn: item.visitingDaysBn ?? "",
        visitingDaysEn: item.visitingDaysEn ?? "",
        appointmentNumber: item.appointmentNumber ?? "",
    };
}

function emptyStatsItem() {
    return {
        titleBn: "",
        titleEn: "",
        descriptionBn: "",
        descriptionEn: "",
    };
}

export function SectionContentEditor({
                                         sectionKey,
                                         value,
                                         onChange,
                                         token,
                                     }: Props) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    let content: Record<string, any>;

    try {
        const parsed = JSON.parse(value || "{}");
        content =
            parsed && typeof parsed === "object" && !Array.isArray(parsed)
                ? parsed
                : {};
    } catch {
        return (
            <div className="grid gap-3">
                <p className="text-sm font-semibold text-red-700">
                    The current content is not valid JSON. Correct it in the
                    advanced editor before continuing.
                </p>
                <textarea
                    spellCheck={false}
                    className="min-h-[300px] w-full rounded-xl border border-line bg-[#102b3a] p-4 font-mono text-sm text-white"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
        );
    }

    function updateField(key: string, nextValue: string) {
        onChange(JSON.stringify({ ...content, [key]: nextValue }, null, 2));
    }

    async function uploadImage(file: File) {
        setUploading(true);
        setUploadError("");

        try {
            const formData = new FormData();
            formData.append("image", file);

            const result = await api<{ imageUrl: string }>(
                "/admin/uploads/image",
                {
                    method: "POST",
                    body: formData,
                },
                token,
            );

            updateField("imageUrl", result.imageUrl);
        } catch (error) {
            setUploadError(
                error instanceof Error
                    ? error.message
                    : "Image upload failed.",
            );
        } finally {
            setUploading(false);
        }
    }

    function updateHeroSlides(slides: HeroSlide[]) {
        onChange(JSON.stringify({ ...content, slides }, null, 2));
    }

    function updateHeroSlide(
        index: number,
        key: keyof HeroSlide,
        nextValue: string | boolean,
    ) {
        const slides = getHeroSlides(content);
        slides[index] = { ...slides[index], [key]: nextValue };
        updateHeroSlides(slides);
    }

    function addHeroSlide() {
        updateHeroSlides([...getHeroSlides(content), createEmptyHeroSlide()]);
    }

    function removeHeroSlide(index: number) {
        const slides = getHeroSlides(content);
        slides.splice(index, 1);
        updateHeroSlides(slides);
    }

    function moveHeroSlide(index: number, direction: -1 | 1) {
        const slides = getHeroSlides(content);
        const target = index + direction;

        if (target < 0 || target >= slides.length) return;

        [slides[index], slides[target]] = [slides[target], slides[index]];
        updateHeroSlides(slides);
    }

    async function uploadHeroSlideImage(index: number, file: File) {
        setUploading(true);
        setUploadError("");

        try {
            const formData = new FormData();
            formData.append("image", file);

            const result = await api<{ imageUrl: string }>(
                "/admin/uploads/image",
                { method: "POST", body: formData },
                token,
            );

            updateHeroSlide(index, "imageUrl", result.imageUrl);
        } catch (error) {
            setUploadError(
                error instanceof Error
                    ? error.message
                    : "Image upload failed.",
            );
        } finally {
            setUploading(false);
        }
    }

    function updateItem(index: number, key: string, nextValue: string) {
        const items = Array.isArray(content.items) ? [...content.items] : [];
        items[index] = { ...items[index], [key]: nextValue };
        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    function addItem() {
        const items = Array.isArray(content.items) ? [...content.items] : [];
        items.unshift(emptyItem());
        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    function removeItem(index: number) {
        const items = Array.isArray(content.items) ? [...content.items] : [];
        items.splice(index, 1);
        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    function updateChamberItem(
        index: number,
        key: string,
        nextValue: string,
    ) {
        const items = Array.isArray(content.items)
            ? content.items.map((item: Record<string, any>) =>
                normalizeChamberItem(item),
            )
            : [];

        const updatedItem = {
            ...items[index],
            [key]: nextValue,
        };

        // Keep legacy fields populated so the current public footer
        // continues to show chamber addresses and visiting hours.
        if (key === "addressBn") {
            updatedItem.descriptionBn = nextValue;
        }

        if (key === "addressEn") {
            updatedItem.descriptionEn = nextValue;
        }

        if (key === "visitingHoursBn") {
            updatedItem.metaBn = nextValue;
        }

        if (key === "visitingHoursEn") {
            updatedItem.metaEn = nextValue;
        }

        items[index] = updatedItem;

        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    function addChamberItem() {
        const items = Array.isArray(content.items)
            ? content.items.map((item: Record<string, any>) =>
                normalizeChamberItem(item),
            )
            : [];

        items.push(emptyChamberItem());
        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    function removeChamberItem(index: number) {
        const items = Array.isArray(content.items)
            ? content.items.map((item: Record<string, any>) =>
                normalizeChamberItem(item),
            )
            : [];

        items.splice(index, 1);
        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    function updateStatsItem(index: number, key: string, nextValue: string) {
        const items = Array.isArray(content.items) ? [...content.items] : [];
        items[index] = { ...items[index], [key]: nextValue };
        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    function addStatsItem() {
        const items = Array.isArray(content.items) ? [...content.items] : [];
        if (items.length >= 3) return;
        items.push(emptyStatsItem());
        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    function removeStatsItem(index: number) {
        const items = Array.isArray(content.items) ? [...content.items] : [];
        items.splice(index, 1);
        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    function updateQualificationItem(
        index: number,
        key: string,
        nextValue: string,
    ) {
        const qualificationItems = Array.isArray(content.qualificationItems)
            ? [...content.qualificationItems]
            : [];

        qualificationItems[index] = {
            ...qualificationItems[index],
            [key]: nextValue,
        };

        onChange(
            JSON.stringify({ ...content, qualificationItems }, null, 2),
        );
    }

    function addQualificationItem() {
        const qualificationItems = Array.isArray(content.qualificationItems)
            ? [...content.qualificationItems]
            : [];

        qualificationItems.unshift(emptyItem());
        onChange(
            JSON.stringify({ ...content, qualificationItems }, null, 2),
        );
    }

    function removeQualificationItem(index: number) {
        const qualificationItems = Array.isArray(content.qualificationItems)
            ? [...content.qualificationItems]
            : [];

        qualificationItems.splice(index, 1);
        onChange(
            JSON.stringify({ ...content, qualificationItems }, null, 2),
        );
    }

    function renderField(field: FieldConfig) {
        const fieldValue = content[field.key] ?? "";

        return (
            <label
                key={field.key}
                className="grid gap-1.5 text-sm font-semibold"
            >
                {field.label}
                {field.multiline ? (
                    <textarea
                        rows={4}
                        className={inputClass}
                        value={String(fieldValue)}
                        onChange={(event) =>
                            updateField(field.key, event.target.value)
                        }
                    />
                ) : (
                    <input
                        className={inputClass}
                        value={String(fieldValue)}
                        onChange={(event) =>
                            updateField(field.key, event.target.value)
                        }
                    />
                )}
            </label>
        );
    }

    function renderChamberField(
        item: ChamberItem,
        index: number,
        field: FieldConfig,
    ) {
        const fieldValue = item[field.key as keyof ChamberItem] ?? "";

        return (
            <label
                key={field.key}
                className="grid gap-1.5 text-sm font-semibold"
            >
                {field.label}
                {field.multiline ? (
                    <textarea
                        rows={3}
                        className={inputClass}
                        value={String(fieldValue)}
                        onChange={(event) =>
                            updateChamberItem(
                                index,
                                field.key,
                                event.target.value,
                            )
                        }
                    />
                ) : (
                    <input
                        className={inputClass}
                        value={String(fieldValue)}
                        onChange={(event) =>
                            updateChamberItem(
                                index,
                                field.key,
                                event.target.value,
                            )
                        }
                    />
                )}
            </label>
        );
    }

    const fields = sectionFields[sectionKey] ?? [];
    const statsItems = Array.isArray(content.items) ? content.items : [];
    const chamberItems: ChamberItem[] = Array.isArray(content.items)
        ? content.items.map((item: Record<string, any>) =>
            normalizeChamberItem(item),
        )
        : [];

    const assetUrl = (path: string) =>
        path.startsWith("http")
            ? path
            : `${API_BASE.replace(/\/api\/?$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;

    return (
        <div className="grid gap-6">
            {fields.length > 0 && (
                <section>
                    <h3 className="mb-4 font-bold text-deep">
                        Section information
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {fields.map(renderField)}
                    </div>
                </section>
            )}

            {sectionKey === "stats" && (
                <section className="grid gap-5">
                    <div>
                        <h3 className="font-bold text-deep">
                            Statistics section
                        </h3>
                        <p className="mt-1 text-xs text-muted">
                            Configure the three statistics displayed below the
                            Hero.
                        </p>
                    </div>

                    <label className="grid gap-2 text-sm font-semibold">
                        Statistics background image
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            disabled={uploading}
                            className="w-full rounded-lg border border-line bg-white p-3 text-sm"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;

                                if (file.size > 5 * 1024 * 1024) {
                                    setUploadError(
                                        "Image must not exceed 5 MB.",
                                    );
                                    event.target.value = "";
                                    return;
                                }

                                void uploadImage(file);
                                event.target.value = "";
                            }}
                        />
                    </label>

                    {content.imageUrl && (
                        <div className="grid gap-2">
                            <img
                                src={assetUrl(String(content.imageUrl))}
                                alt="Statistics background preview"
                                className="max-h-48 w-full rounded-xl border border-line object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => updateField("imageUrl", "")}
                                className="w-fit text-sm font-semibold text-red-700"
                            >
                                Remove background image
                            </button>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                        <div>
                            <h4 className="font-bold text-deep">
                                Statistics entries
                            </h4>
                            <p className="mt-1 text-xs text-muted">
                                {statsItems.length} of 3 entries configured
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addStatsItem}
                            disabled={statsItems.length >= 3}
                            className="rounded-full bg-teal px-4 py-2 text-sm font-bold text-deep disabled:opacity-40"
                        >
                            + Add statistic
                        </button>
                    </div>

                    {statsItems.slice(0, 3).map(
                        (
                            item: Record<string, any>,
                            index: number,
                        ) => (
                            <article
                                key={index}
                                className="grid gap-4 rounded-xl border border-line bg-mist/40 p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold">
                                        Statistic {index + 1}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeStatsItem(index)
                                        }
                                        className="text-sm font-semibold text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {statsFields.map((field) => (
                                        <label
                                            key={field.key}
                                            className="grid gap-1.5 text-sm font-semibold"
                                        >
                                            {field.label}
                                            <input
                                                className={inputClass}
                                                value={String(
                                                    item?.[field.key] ?? "",
                                                )}
                                                onChange={(event) =>
                                                    updateStatsItem(
                                                        index,
                                                        field.key,
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </label>
                                    ))}
                                </div>
                            </article>
                        ),
                    )}

                    {statsItems.length === 0 && (
                        <p className="rounded-lg bg-mist p-4 text-sm text-muted">
                            No statistics configured. Add up to three entries.
                        </p>
                    )}

                    {uploading && (
                        <p className="text-sm text-teal-dark">
                            Uploading image...
                        </p>
                    )}
                    {uploadError && (
                        <p className="text-sm text-red-700">{uploadError}</p>
                    )}
                </section>
            )}

            {sectionKey === "hero" && (
                <section className="grid gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="font-bold text-deep">
                                Hero slides
                            </h3>
                            <p className="mt-1 text-xs text-muted">
                                Manage bilingual text, images and optional
                                buttons.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addHeroSlide}
                            className="rounded-full bg-teal px-4 py-2 text-sm font-bold text-deep"
                        >
                            + Add Hero slide
                        </button>
                    </div>

                    {getHeroSlides(content).map((slide, index) => (
                        <article
                            key={slide.id}
                            className="grid gap-4 rounded-xl border border-line bg-mist/40 p-4"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h4 className="font-bold">
                                    Slide {index + 1}
                                </h4>
                                <div className="flex flex-wrap items-center gap-3">
                                    <label className="flex items-center gap-2 text-sm font-semibold">
                                        <input
                                            type="checkbox"
                                            checked={slide.enabled !== false}
                                            onChange={(event) =>
                                                updateHeroSlide(
                                                    index,
                                                    "enabled",
                                                    event.target.checked,
                                                )
                                            }
                                        />
                                        Enabled
                                    </label>
                                    <button
                                        type="button"
                                        disabled={index === 0}
                                        onClick={() =>
                                            moveHeroSlide(index, -1)
                                        }
                                        className="text-sm font-semibold disabled:opacity-30"
                                    >
                                        Move up
                                    </button>
                                    <button
                                        type="button"
                                        disabled={
                                            index ===
                                            getHeroSlides(content).length - 1
                                        }
                                        onClick={() =>
                                            moveHeroSlide(index, 1)
                                        }
                                        className="text-sm font-semibold disabled:opacity-30"
                                    >
                                        Move down
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeHeroSlide(index)
                                        }
                                        className="text-sm font-semibold text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {(
                                    [
                                        ["headingBn", "Heading (Bangla)"],
                                        ["headingEn", "Heading (English)"],
                                        ["subtitleBn", "Subtitle (Bangla)"],
                                        ["subtitleEn", "Subtitle (English)"],
                                    ] as const
                                ).map(([key, label]) => (
                                    <label
                                        key={key}
                                        className="grid gap-1.5 text-sm font-semibold"
                                    >
                                        {label}
                                        <input
                                            className={inputClass}
                                            value={slide[key] || ""}
                                            onChange={(event) =>
                                                updateHeroSlide(
                                                    index,
                                                    key,
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </label>
                                ))}

                                {(
                                    [
                                        ["bodyBn", "Description (Bangla)"],
                                        ["bodyEn", "Description (English)"],
                                    ] as const
                                ).map(([key, label]) => (
                                    <label
                                        key={key}
                                        className="grid gap-1.5 text-sm font-semibold"
                                    >
                                        {label}
                                        <textarea
                                            rows={4}
                                            className={inputClass}
                                            value={slide[key] || ""}
                                            onChange={(event) =>
                                                updateHeroSlide(
                                                    index,
                                                    key,
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </label>
                                ))}

                                {(
                                    [
                                        ["ctaTextBn", "Button text (Bangla)"],
                                        ["ctaTextEn", "Button text (English)"],
                                        ["ctaUrl", "Button URL"],
                                    ] as const
                                ).map(([key, label]) => (
                                    <label
                                        key={key}
                                        className="grid gap-1.5 text-sm font-semibold"
                                    >
                                        {label}
                                        <input
                                            className={inputClass}
                                            value={slide[key] || ""}
                                            onChange={(event) =>
                                                updateHeroSlide(
                                                    index,
                                                    key,
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </label>
                                ))}
                            </div>

                            <label className="grid gap-2 text-sm font-semibold">
                                Slide image
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    disabled={uploading}
                                    className="w-full rounded-lg border border-line bg-white p-3 text-sm"
                                    onChange={(event) => {
                                        const file =
                                            event.target.files?.[0];
                                        if (!file) return;

                                        if (file.size > 5 * 1024 * 1024) {
                                            setUploadError(
                                                "Image must not exceed 5 MB.",
                                            );
                                            event.target.value = "";
                                            return;
                                        }

                                        void uploadHeroSlideImage(
                                            index,
                                            file,
                                        );
                                        event.target.value = "";
                                    }}
                                />
                            </label>

                            {slide.imageUrl && (
                                <div className="grid gap-2">
                                    <img
                                        src={assetUrl(
                                            String(slide.imageUrl),
                                        )}
                                        alt={`Hero slide ${index + 1} preview`}
                                        className="max-h-56 w-full rounded-xl border border-line object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateHeroSlide(
                                                index,
                                                "imageUrl",
                                                "",
                                            )
                                        }
                                        className="w-fit text-sm font-semibold text-red-700"
                                    >
                                        Remove image
                                    </button>
                                </div>
                            )}
                        </article>
                    ))}

                    {getHeroSlides(content).length === 0 && (
                        <p className="rounded-lg bg-mist p-4 text-sm text-muted">
                            No Hero slides yet. Select Add Hero slide to
                            create the first slide.
                        </p>
                    )}

                    <p className="text-xs text-muted">
                        Accepted image formats: JPEG, PNG, WebP and GIF.
                        Maximum size: 5 MB.
                    </p>
                    {uploading && (
                        <p className="text-sm font-semibold text-teal-dark">
                            Uploading image...
                        </p>
                    )}
                    {uploadError && (
                        <p className="text-sm font-semibold text-red-700">
                            {uploadError}
                        </p>
                    )}
                </section>
            )}

            {sectionKey === "about" && (
                <section className="grid gap-3">
                    <h3 className="font-bold text-deep">
                        Doctor profile image
                    </h3>
                    <label className="grid gap-2 text-sm font-semibold">
                        Select image
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            disabled={uploading}
                            className="w-full rounded-lg border border-line bg-white p-3 text-sm"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;

                                if (file.size > 5 * 1024 * 1024) {
                                    setUploadError(
                                        "Image must not exceed 5 MB.",
                                    );
                                    event.target.value = "";
                                    return;
                                }

                                void uploadImage(file);
                                event.target.value = "";
                            }}
                        />
                    </label>

                    {content.imageUrl && (
                        <div className="grid gap-2">
                            <p className="text-sm font-semibold">
                                Current image preview
                            </p>
                            <img
                                src={assetUrl(String(content.imageUrl))}
                                alt="Doctor profile preview"
                                className="max-h-64 w-full rounded-xl border border-line object-contain"
                            />
                            <button
                                type="button"
                                onClick={() => updateField("imageUrl", "")}
                                className="w-fit text-sm font-semibold text-red-700"
                            >
                                Remove image
                            </button>
                        </div>
                    )}

                    {uploading && (
                        <p className="text-sm font-semibold text-teal-dark">
                            Uploading image...
                        </p>
                    )}
                    {uploadError && (
                        <p className="text-sm font-semibold text-red-700">
                            {uploadError}
                        </p>
                    )}
                </section>
            )}

            {sectionKey === "about" && (
                <section className="grid gap-4 border-t border-line pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="font-bold text-deep">
                                শিক্ষাগত যোগ্যতা / Academic Qualifications
                            </h3>
                            <p className="mt-1 text-xs text-muted">
                                These entries appear inside the Doctor Profile
                                section.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addQualificationItem}
                            className="rounded-full bg-teal px-4 py-2 text-sm font-bold text-deep"
                        >
                            + Add qualification
                        </button>
                    </div>

                    {(
                        Array.isArray(content.qualificationItems)
                            ? content.qualificationItems
                            : []
                    ).map(
                        (
                            item: Record<string, any>,
                            index: number,
                        ) => (
                            <article
                                key={index}
                                className="grid gap-3 rounded-xl border border-line p-4"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <h4 className="font-bold">
                                        Qualification {index + 1}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeQualificationItem(index)
                                        }
                                        className="text-sm font-semibold text-red-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {itemFields.map((field) => (
                                        <label
                                            key={field.key}
                                            className="grid gap-1.5 text-sm font-semibold"
                                        >
                                            {field.label}
                                            {field.multiline ? (
                                                <textarea
                                                    rows={3}
                                                    className={inputClass}
                                                    value={String(
                                                        item?.[field.key] ?? "",
                                                    )}
                                                    onChange={(event) =>
                                                        updateQualificationItem(
                                                            index,
                                                            field.key,
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <input
                                                    className={inputClass}
                                                    value={String(
                                                        item?.[field.key] ?? "",
                                                    )}
                                                    onChange={(event) =>
                                                        updateQualificationItem(
                                                            index,
                                                            field.key,
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </article>
                        ),
                    )}

                    {(!Array.isArray(content.qualificationItems) ||
                        content.qualificationItems.length === 0) && (
                        <p className="rounded-lg bg-mist p-4 text-sm text-muted">
                            No qualifications added yet. Select Add
                            qualification.
                        </p>
                    )}
                </section>
            )}

            {/* Dedicated chamber editor */}
            {sectionKey === "chambers" && (
                <section className="grid gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="font-bold text-deep">
                                Chambers & Visiting Hours
                            </h3>
                            <p className="mt-1 text-xs text-muted">
                                Manage each chamber's address, visiting hours,
                                visiting days and appointment number separately.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addChamberItem}
                            className="rounded-full bg-teal px-4 py-2 text-sm font-bold text-deep"
                        >
                            + Add chamber
                        </button>
                    </div>

                    {chamberItems.map((item, index) => (
                        <article
                            key={item.id || index}
                            className="grid gap-4 rounded-xl border border-line bg-mist/40 p-4"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h4 className="font-bold text-deep">
                                        Chamber {index + 1}
                                    </h4>
                                    <p className="text-xs text-muted">
                                        Enter the details for this chamber.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        removeChamberItem(index)
                                    }
                                    className="text-sm font-semibold text-red-700"
                                >
                                    Remove chamber
                                </button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {chamberFields.map((field) =>
                                    renderChamberField(
                                        item,
                                        index,
                                        field,
                                    ),
                                )}
                            </div>
                        </article>
                    ))}

                    {chamberItems.length === 0 && (
                        <p className="rounded-lg bg-mist p-4 text-sm text-muted">
                            No chambers added yet. Select Add chamber to
                            create your first chamber.
                        </p>
                    )}

                    <p className="text-xs text-muted">
                        The public footer is designed to display two chambers
                        side by side on desktop. You can manage each chamber
                        independently here.
                    </p>
                </section>
            )}

            {["qualifications", "specializations"].includes(sectionKey) && (
                <section>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold text-deep">
                            Content entries
                        </h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="rounded-full bg-teal px-4 py-2 text-sm font-bold text-deep"
                        >
                            + Add entry
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {(Array.isArray(content.items)
                                ? content.items
                                : []
                        ).map(
                            (
                                item: Record<string, any>,
                                index: number,
                            ) => (
                                <article
                                    key={index}
                                    className="rounded-xl border border-line bg-mist/40 p-4"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <h4 className="font-bold">
                                            Entry {index + 1}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeItem(index)
                                            }
                                            className="text-sm font-semibold text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {itemFields.map((field) => (
                                            <label
                                                key={field.key}
                                                className="grid gap-1.5 text-sm font-semibold"
                                            >
                                                {field.label}
                                                {field.multiline ? (
                                                    <textarea
                                                        rows={3}
                                                        className={inputClass}
                                                        value={String(
                                                            item?.[field.key] ??
                                                            "",
                                                        )}
                                                        onChange={(event) =>
                                                            updateItem(
                                                                index,
                                                                field.key,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <input
                                                        className={inputClass}
                                                        value={String(
                                                            item?.[field.key] ??
                                                            "",
                                                        )}
                                                        onChange={(event) =>
                                                            updateItem(
                                                                index,
                                                                field.key,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </article>
                            ),
                        )}

                        {(!Array.isArray(content.items) ||
                            content.items.length === 0) && (
                            <p className="rounded-lg bg-mist p-4 text-sm text-muted">
                                No entries yet. Select Add entry to create one.
                            </p>
                        )}
                    </div>
                </section>
            )}

            {sectionKey === "branding" && (
                <p className="text-sm text-muted">
                    Branding currently has no predefined fields. Use the
                    advanced JSON editor to manage its settings.
                </p>
            )}

            <section className="border-t border-line pt-4">
                <button
                    type="button"
                    onClick={() =>
                        setShowAdvanced((current) => !current)
                    }
                    className="text-sm font-bold text-teal-dark"
                >
                    {showAdvanced
                        ? "Hide advanced JSON editor"
                        : "Show advanced JSON editor"}
                </button>

                {showAdvanced && (
                    <textarea
                        spellCheck={false}
                        aria-label="Advanced section JSON"
                        className="mt-3 min-h-[300px] w-full rounded-xl border border-line bg-[#102b3a] p-4 font-mono text-sm text-white"
                        value={value}
                        onChange={(event) =>
                            onChange(event.target.value)
                        }
                    />
                )}
            </section>
        </div>
    );
}
