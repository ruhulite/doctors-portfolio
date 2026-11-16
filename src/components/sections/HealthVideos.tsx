
import { useEffect, useState } from "react";
import { Play, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../ui/SectionHeading";
import { api, type VideoItem, type LandingSection } from "../../lib/api";

const apiOrigin = (
    import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/api\/?$/, "");

const DESCRIPTION_LIMIT = 160;

type HealthVideosProps = {
    preview?: boolean;
};

// Supports full YouTube URLs and older records containing only the video ID.
function getYouTubeId(value: string): string | null {
    const input = value.trim();

    // Backward compatibility: a bare YouTube video ID.
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
        return input;
    }

    try {
        const url = new URL(input);
        const hostname = url.hostname.replace(/^www\./, "");

        if (hostname === "youtu.be") {
            return url.pathname.split("/").filter(Boolean)[0] || null;
        }

        if (
            hostname === "youtube.com" ||
            hostname.endsWith(".youtube.com")
        ) {
            const videoId =
                url.searchParams.get("v") ||
                url.pathname.match(
                    /^\/(?:embed|shorts|live)\/([^/?]+)/
                )?.[1];

            return videoId || null;
        }
    } catch {
        return null;
    }

    return null;
}

// Detects common direct video file URLs.
function isDirectVideoUrl(value: string): boolean {
    try {
        const url = new URL(value);

        return /\.(mp4|webm|ogg|ogv|m4v|mov|m3u8)$/i.test(
            url.pathname
        );
    } catch {
        return false;
    }
}

function getVideoUrl(video: VideoItem): string {
    if (video.source === "UPLOAD") {
        return `${apiOrigin}${video.mediaUrl}`;
    }

    return video.mediaUrl;
}

export function HealthVideos({ preview = false }: HealthVideosProps) {
    const { i18n } = useTranslation();

    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [active, setActive] = useState<string | null>(null);
    const [copy, setCopy] = useState<any>({});
    const [expandedDescriptions, setExpandedDescriptions] = useState<
        Record<string, boolean>
    >({});

    useEffect(() => {
        let token: string | undefined;

        if (preview) {
            try {
                const raw = sessionStorage.getItem("kafi_cms_session");
                token = raw ? JSON.parse(raw).accessToken : undefined;
            } catch {
                token = undefined;
            }

            if (!token) {
                setVideos([]);
                setCopy({});
                return;
            }
        }

        const videosPath = preview
            ? "/admin/preview/videos"
            : "/public/videos";

        const landingPath = preview
            ? "/admin/preview/landing"
            : "/public/landing";

        api<VideoItem[]>(videosPath, {}, token)
            .then(setVideos)
            .catch(() => setVideos([]));

        api<LandingSection[]>(landingPath, {}, token)
            .then((rows) => {
                const section = rows.find(
                    (row) => row.key === "videoSection"
                );

                setCopy(
                    preview
                        ? section?.draftContent || {}
                        : section?.publishedContent || {}
                );
            })
            .catch(() => setCopy({}));
    }, [preview]);

    const bn = i18n.language !== "en";

    function toggleDescription(videoId: string) {
        setExpandedDescriptions((previous) => ({
            ...previous,
            [videoId]: !previous[videoId],
        }));
    }

    function renderPlayer(video: VideoItem) {
        const title = bn ? video.titleBn : video.titleEn;

        // YouTube player
        if (video.source === "YOUTUBE") {
            const videoId = getYouTubeId(video.mediaUrl);

            if (!videoId) {
                return (
                    <div className="flex h-full items-center justify-center p-5 text-center text-sm text-muted">
                        {bn
                            ? "YouTube ভিডিও লিংকটি সঠিক নয়।"
                            : "The YouTube video URL is invalid."}
                    </div>
                );
            }

            return (
                <iframe
                    title={title}
                    src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(
                        videoId
                    )}?autoplay=1&rel=0`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                />
            );
        }

        // Facebook video player
        if (video.source === "FACEBOOK") {
            const embedUrl =
                "https://www.facebook.com/plugins/video.php" +
                `?href=${encodeURIComponent(video.mediaUrl)}` +
                "&show_text=false&width=500";

            return (
                <iframe
                    title={title}
                    src={embedUrl}
                    className="h-full w-full"
                    style={{ border: 0, overflow: "hidden" }}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                />
            );
        }

        // Uploaded videos and direct external video files
        if (
            video.source === "UPLOAD" ||
            (video.source === "EXTERNAL" &&
                isDirectVideoUrl(video.mediaUrl))
        ) {
            return (
                <video
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="h-full w-full"
                    src={getVideoUrl(video)}
                    aria-label={title}
                >
                    {video.captionsUrl && (
                        <track
                            kind="captions"
                            src={
                                video.captionsUrl.startsWith("/")
                                    ? `${apiOrigin}${video.captionsUrl}`
                                    : video.captionsUrl
                            }
                            srcLang="bn"
                            label="বাংলা"
                            default
                        />
                    )}

                    {bn
                        ? "আপনার ব্রাউজার ভিডিও প্লেব্যাক সমর্থন করে না।"
                        : "Your browser does not support video playback."}
                </video>
            );
        }

        // Other external URLs are treated as embeddable web pages.
        return (
            <iframe
                title={title}
                src={video.mediaUrl}
                className="h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                loading="lazy"
            />
        );
    }

    return (
        <section id="videos" className="health-videos-section section-pad">
            {preview && (
                <div className="container-shell mb-5">
                    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                        {bn
                            ? "ভিডিও প্রিভিউ — অপ্রকাশিত ভিডিওও এখানে দেখা যাবে"
                            : "Video preview — unpublished videos are visible here"}
                    </div>
                </div>
            )}

            <div className="container-shell">
                <SectionHeading
                    eyebrow={
                        bn ? "স্বাস্থ্য সচেতনতা" : "HEALTH AWARENESS"
                    }
                    title={
                        bn
                            ? copy.headingBn ||
                            "স্বাস্থ্য সচেতনতা ও শিক্ষামূলক ভিডিও"
                            : copy.headingEn ||
                            "Health Awareness & Educational Videos"
                    }
                    description={
                        bn
                            ? copy.subtitleBn ||
                            "স্বাস্থ্য সম্পর্কে নির্ভরযোগ্য তথ্য ও সচেতনতামূলক ভিডিও।"
                            : copy.subtitleEn ||
                            "Educational videos to support informed health awareness."
                    }
                    centered
                />

                {videos.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {videos.map((video) => {
                            const description = bn
                                ? video.descriptionBn
                                : video.descriptionEn;

                            const isLong =
                                description.length > DESCRIPTION_LIMIT;

                            const isExpanded =
                                expandedDescriptions[video.id] || false;

                            const displayedDescription =
                                isLong && !isExpanded
                                    ? `${description
                                        .slice(0, DESCRIPTION_LIMIT)
                                        .trimEnd()}...`
                                    : description;

                            return (
                                <article
                                    className="health-video-card"
                                    key={video.id}
                                >
                                    <div className="health-video-frame">
                                        {active === video.id ? (
                                            renderPlayer(video)
                                        ) : (
                                            <button
                                                type="button"
                                                className="health-video-play"
                                                onClick={() =>
                                                    setActive(video.id)
                                                }
                                                aria-label={`${
                                                    bn
                                                        ? "ভিডিও চালান"
                                                        : "Play video"
                                                }: ${
                                                    bn
                                                        ? video.titleBn
                                                        : video.titleEn
                                                }`}
                                            >
                                                {video.thumbnailUrl && (
                                                    <img
                                                        src={
                                                            video.thumbnailUrl.startsWith(
                                                                "/"
                                                            )
                                                                ? `${apiOrigin}${video.thumbnailUrl}`
                                                                : video.thumbnailUrl
                                                        }
                                                        alt=""
                                                        className="absolute inset-0 h-full w-full object-cover"
                                                    />
                                                )}

                                                <span className="health-video-play-icon relative z-10">
                                                    <Play
                                                        size={24}
                                                        fill="currentColor"
                                                    />
                                                </span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        <span className="health-video-category">
                                            {bn
                                                ? video.categoryBn
                                                : video.categoryEn}
                                        </span>

                                        <h3 className="mt-2 text-lg font-extrabold">
                                            {bn
                                                ? video.titleBn
                                                : video.titleEn}
                                        </h3>

                                        {description && (
                                            <div className="mt-2">
                                                <p className="text-sm leading-7 text-muted whitespace-pre-line">
                                                    {displayedDescription}
                                                </p>

                                                {isLong && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleDescription(
                                                                video.id
                                                            )
                                                        }
                                                        aria-expanded={isExpanded}
                                                        className="mt-2 inline-flex items-center text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700 hover:underline"
                                                    >
                                                        {bn
                                                            ? isExpanded
                                                                ? "কম দেখুন"
                                                                : "আরও দেখুন"
                                                            : isExpanded
                                                                ? "View Less"
                                                                : "View More"}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {video.durationSeconds !== null &&
                                            video.durationSeconds !==
                                            undefined && (
                                                <p className="mt-2 text-xs text-muted">
                                                    {Math.floor(
                                                        video.durationSeconds /
                                                        60
                                                    )}
                                                    :
                                                    {String(
                                                        video.durationSeconds %
                                                        60
                                                    ).padStart(2, "0")}
                                                </p>
                                            )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="health-videos-empty">
                        <span className="health-videos-empty-icon">
                            <Video />
                        </span>

                        <h3>
                            {bn
                                ? "শিক্ষামূলক ভিডিও শীঘ্রই আসছে"
                                : "Educational videos coming soon"}
                        </h3>

                        <p>
                            {bn
                                ? "স্বাস্থ্য সচেতনতামূলক ভিডিও এখানে প্রকাশ করা হবে।"
                                : "Health education videos will be published here."}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
