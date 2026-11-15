
export const API_BASE = (
    import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

export type Role = "SUPER_ADMIN" | "ADMIN";

export type Session = {
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: Role;
    };
};

export type LandingSection = {
    id: string;
    key: string;
    title: string;
    enabled: boolean;
    sortOrder: number;
    draftContent: any;
    publishedContent: any;
};

export type VideoItem = {
    id: string;
    source: "UPLOAD" | "YOUTUBE" | "FACEBOOK" | "EXTERNAL";
    titleBn: string;
    titleEn: string;
    descriptionBn: string;
    descriptionEn: string;
    categoryBn: string;
    categoryEn: string;
    mediaUrl: string;
    thumbnailUrl: string | null;
    captionsUrl?: string | null;
    durationSeconds: number | null;
    status: "DRAFT" | "PUBLISHED";
    featured: boolean;
    sortOrder: number;
};

export async function api<T>(
    path: string,
    options: RequestInit = {},
    token?: string
): Promise<T> {
    const headers = new Headers(options.headers);

    if (
        !(options.body instanceof FormData) &&
        options.body &&
        !headers.has("Content-Type")
    ) {
        headers.set("Content-Type", "application/json");
    }

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    let response: Response;

    try {
        response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers,
        });
    } catch {
        throw new Error(
            "API server is unreachable. Check VITE_API_URL and backend status."
        );
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            Array.isArray(data?.message)
                ? data.message.join(", ")
                : data?.message || `Request failed (${response.status})`
        );
    }

    return data as T;
}
