
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

const commonFields: FieldConfig[] = [
    { key: "headingBn", label: "Heading (Bangla)" },
    { key: "headingEn", label: "Heading (English)" },
    { key: "subtitleBn", label: "Subtitle (Bangla)" },
    { key: "subtitleEn", label: "Subtitle (English)" },
    { key: "bodyBn", label: "Description (Bangla)", multiline: true },
    { key: "bodyEn", label: "Description (English)", multiline: true },
];

const sectionFields: Record<string, FieldConfig[]> = {
    hero: [
        ...commonFields,
        { key: "ctaTextBn", label: "Button text (Bangla)" },
        { key: "ctaTextEn", label: "Button text (English)" },
        { key: "ctaUrl", label: "Button URL" }
    ],
    about: [
        ...commonFields
    ],
    qualifications: commonFields.slice(0, 2),
    experience: commonFields.slice(0, 2),
    specializations: commonFields.slice(0, 2),
    chambers: commonFields.slice(0, 2),
    contact: [
        { key: "headingBn", label: "Heading (Bangla)" },
        { key: "headingEn", label: "Heading (English)" },
        { key: "phone", label: "Phone number" },
        { key: "email", label: "Email address" },
        { key: "addressBn", label: "Address (Bangla)", multiline: true },
        { key: "addressEn", label: "Address (English)", multiline: true },
    ],
    seo: [
        { key: "metaTitleBn", label: "SEO title (Bangla)" },
        { key: "metaTitleEn", label: "SEO title (English)" },
        { key: "metaDescriptionBn", label: "Meta description (Bangla)", multiline: true },
        { key: "metaDescriptionEn", label: "Meta description (English)", multiline: true },
    ],
    videoSection: commonFields.slice(0, 4),
};

const itemFields: FieldConfig[] = [
    { key: "titleBn", label: "Title (Bangla)" },
    { key: "titleEn", label: "Title (English)" },
    { key: "descriptionBn", label: "Description (Bangla)", multiline: true },
    { key: "descriptionEn", label: "Description (English)", multiline: true },
    { key: "metaBn", label: "Additional information (Bangla)" },
    { key: "metaEn", label: "Additional information (English)" },
];

const inputClass =
    "w-full rounded-lg border border-line bg-white p-3 text-sm outline-none focus:border-teal";

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
                    The current content is not valid JSON. Correct it in the advanced
                    editor before continuing.
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

    function updateItem(index: number, key: string, nextValue: string) {
        const items = Array.isArray(content.items) ? [...content.items] : [];
        items[index] = { ...items[index], [key]: nextValue };

        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    function addItem() {
        const items = Array.isArray(content.items) ? [...content.items] : [];
        items.push(emptyItem());

        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    function removeItem(index: number) {
        const items = Array.isArray(content.items) ? [...content.items] : [];
        items.splice(index, 1);

        onChange(JSON.stringify({ ...content, items }, null, 2));
    }

    function renderField(field: FieldConfig) {
        const fieldValue = content[field.key] ?? "";

        return (
            <label key={field.key} className="grid gap-1.5 text-sm font-semibold">
                {field.label}

                {field.multiline ? (
                    <textarea
                        rows={4}
                        className={inputClass}
                        value={String(fieldValue)}
                        onChange={(event) => updateField(field.key, event.target.value)}
                    />
                ) : (
                    <input
                        className={inputClass}
                        value={String(fieldValue)}
                        onChange={(event) => updateField(field.key, event.target.value)}
                    />
                )}
            </label>
        );
    }

    const fields = sectionFields[sectionKey] ?? [];

    return (
        <div className="grid gap-6">
            {fields.length > 0 && (
                <section>
                    <h3 className="mb-4 font-bold text-deep">Section information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {fields.map(renderField)}
                    </div>
                </section>
            )}

            {["hero", "about"].includes(sectionKey) && (
                <section className="grid gap-3">
                    <h3 className="font-bold text-deep">
                        {sectionKey === "hero"
                            ? "Hero section image"
                            : "Doctor profile image"}
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
                                    setUploadError("Image must not exceed 5 MB.");
                                    event.target.value = "";
                                    return;
                                }

                                void uploadImage(file);
                                event.target.value = "";
                            }}
                        />
                    </label>

                    <p className="text-xs text-muted">
                        Accepted formats: JPEG, PNG, WebP and GIF. Maximum size: 5 MB.
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

                    {content.imageUrl && (
                        <div className="grid gap-2">
                            <p className="text-sm font-semibold">Current image preview</p>

                            <img
                                src={
                                    String(content.imageUrl).startsWith("http")
                                        ? content.imageUrl
                                        : `${API_BASE.replace(/\/api\/?$/, "")}${String(content.imageUrl).startsWith("/") ? "" : "/"}${content.imageUrl}`
                                }
                                alt="Section preview"
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
                </section>
            )}

            {["qualifications", "experience", "specializations", "chambers"].includes(
                sectionKey,
            ) && (
                <section>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-bold text-deep">Content entries</h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="rounded-full bg-teal px-4 py-2 text-sm font-bold text-deep"
                        >
                            + Add entry
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {(Array.isArray(content.items) ? content.items : []).map(
                            (item: Record<string, any>, index: number) => (
                                <article
                                    key={index}
                                    className="rounded-xl border border-line bg-mist/40 p-4"
                                >
                                    <div className="mb-4 flex items-center justify-between">
                                        <h4 className="font-bold">Entry {index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
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
                                                        value={String(item?.[field.key] ?? "")}
                                                        onChange={(event) =>
                                                            updateItem(index, field.key, event.target.value)
                                                        }
                                                    />
                                                ) : (
                                                    <input
                                                        className={inputClass}
                                                        value={String(item?.[field.key] ?? "")}
                                                        onChange={(event) =>
                                                            updateItem(index, field.key, event.target.value)
                                                        }
                                                    />
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </article>
                            ),
                        )}

                        {(!Array.isArray(content.items) || content.items.length === 0) && (
                            <p className="rounded-lg bg-mist p-4 text-sm text-muted">
                                No entries yet. Select Add entry to create one.
                            </p>
                        )}
                    </div>
                </section>
            )}

            {sectionKey === "branding" && (
                <p className="text-sm text-muted">
                    Branding currently has no predefined fields. Use the advanced JSON
                    editor to manage its settings.
                </p>
            )}

            <section className="border-t border-line pt-4">
                <button
                    type="button"
                    onClick={() => setShowAdvanced((current) => !current)}
                    className="text-sm font-bold text-teal-dark"
                >
                    {showAdvanced ? "Hide advanced JSON editor" : "Show advanced JSON editor"}
                </button>

                {showAdvanced && (
                    <textarea
                        spellCheck={false}
                        aria-label="Advanced section JSON"
                        className="mt-3 min-h-[300px] w-full rounded-xl border border-line bg-[#102b3a] p-4 font-mono text-sm text-white"
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                    />
                )}
            </section>
        </div>
    );
}
