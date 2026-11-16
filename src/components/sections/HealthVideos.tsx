
import { useEffect, useRef, useState } from "react";
import { Play, Video, ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../ui/SectionHeading";
import { api, type VideoItem, type LandingSection } from "../../lib/api";

const apiOrigin = (
    import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/api\/?$/, "");

const DESCRIPTION_LIMIT = 160;
const MAX_PUBLIC_VIDEOS = 8;
const CAROUSEL_GAP = 24;
const AUTO_SLIDE_INTERVAL = 5000;

type HealthVideosProps = {
    preview?: boolean;
};

function getYouTubeId(value: string): string | null {
    const input = value.trim();

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

function getThumbnailUrl(thumbnailUrl: string): string {
    return thumbnailUrl.startsWith("/")
        ? `${apiOrigin}${thumbnailUrl}`
        : thumbnailUrl;
}

export function HealthVideos({ preview = false }: HealthVideosProps) {
    const { i18n } = useTranslation();

    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [active, setActive] = useState<string | null>(null);
    const [copy, setCopy] = useState<any>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const [expandedDescriptions, setExpandedDescriptions] = useState<
        Record<string, boolean>
    >({});

    const carouselRef = useRef<HTMLDivElement>(null);

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
            .then((rows) => {
                setVideos(rows);
                setCurrentIndex(0);
                setActive(null);
                setIsPaused(false);

                if (carouselRef.current) {
                    carouselRef.current.scrollLeft = 0;
                }
            })
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

    // Show a maximum of eight videos in the public carousel.
    const visibleVideos = videos.slice(0, MAX_PUBLIC_VIDEOS);

    function toggleDescription(videoId: string) {
        setExpandedDescriptions((previous) => ({
            ...previous,
            [videoId]: !previous[videoId],
        }));
    }

    // Move exactly one video card per click.
    function scrollToVideo(index: number) {
        if (
            index < 0 ||
            index >= visibleVideos.length - 2 ||
            !carouselRef.current
        ) {
            return;
        }

        const carousel = carouselRef.current;
        const firstCard = carousel.firstElementChild as HTMLElement | null;

        if (!firstCard) return;

        const cardWidth = firstCard.getBoundingClientRect().width;
        const scrollDistance = cardWidth + CAROUSEL_GAP;

        setActive(null);
        setCurrentIndex(index);

        carousel.scrollTo({
            left: index * scrollDistance,
            behavior: "smooth",
        });
    }

    function showPrevious() {
        scrollToVideo(currentIndex - 1);
    }

    function showNext() {
        scrollToVideo(currentIndex + 1);
    }

    // Automatically move one video every five seconds.
    // Loop back to the beginning after reaching the last position.
    useEffect(() => {
        if (
            visibleVideos.length <= 3 ||
            active !== null ||
            isPaused
        ) {
            return;
        }

        const maxStartIndex = visibleVideos.length - 3;

        const timer = window.setInterval(() => {
            const nextIndex =
                currentIndex >= maxStartIndex
                    ? 0
                    : currentIndex + 1;

            const carousel = carouselRef.current;
            const firstCard = carousel?.firstElementChild as
                | HTMLElement
                | null;

            if (!carousel || !firstCard) return;

            const cardWidth = firstCard.getBoundingClientRect().width;
            const scrollDistance = cardWidth + CAROUSEL_GAP;

            setCurrentIndex(nextIndex);
            setActive(null);

            carousel.scrollTo({
                left: nextIndex * scrollDistance,
                behavior: "smooth",
            });
        }, AUTO_SLIDE_INTERVAL);

        return () => window.clearInterval(timer);
    }, [
        currentIndex,
        visibleVideos.length,
        active,
        isPaused,
    ]);

    function renderPlayer(video: VideoItem) {
        const title = bn ? video.titleBn : video.titleEn;

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
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                />
            );
        }

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
                            ? "স্বাস্থ্য সচেতনতামূলক ভিডিও"
                            : "Health Awareness Videos"
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

                {visibleVideos.length > 0 ? (
                    <>
                        <div
                            ref={carouselRef}
                            className="mt-8 flex gap-6 overflow-hidden"
                            style={{
                                scrollBehavior: "smooth",
                                scrollSnapType: "x mandatory",
                            }}
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            {visibleVideos.map((video) => {
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
                                            .slice(
                                                0,
                                                DESCRIPTION_LIMIT
                                            )
                                            .trimEnd()}...`
                                        : description;

                                return (
                                    <article
                                        className="health-video-card min-w-0 flex-shrink-0"
                                        key={video.id}
                                        style={{
                                            flexBasis:
                                                "calc((100% - 48px) / 3)",
                                            scrollSnapAlign: "start",
                                        }}
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
                                                            src={getThumbnailUrl(
                                                                video.thumbnailUrl
                                                            )}
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
                                                    <p className="whitespace-pre-line text-sm leading-7 text-muted">
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
                                                            aria-expanded={
                                                                isExpanded
                                                            }
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

                        {visibleVideos.length > 3 && (
                            <div
                                className="mt-6 flex items-center justify-between gap-4"
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                            >
                                <button
                                    type="button"
                                    onClick={showPrevious}
                                    disabled={currentIndex === 0}
                                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-bold transition-colors hover:border-teal hover:bg-mint disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label={
                                        bn ? "আগের ভিডিও" : "Previous video"
                                    }
                                >
                                    <ArrowLeft size={17} />
                                    {bn ? "আগের ভিডিও" : "Previous"}
                                </button>

                                <span
                                    className="text-xs font-semibold text-muted"
                                    aria-live="polite"
                                >
                                    {bn
                                        ? `ভিডিও ${currentIndex + 1}–${Math.min(
                                            currentIndex + 3,
                                            visibleVideos.length
                                        )} / ${visibleVideos.length}`
                                        : `Videos ${currentIndex + 1}–${Math.min(
                                            currentIndex + 3,
                                            visibleVideos.length
                                        )} of ${visibleVideos.length}`}
                                </span>

                                <button
                                    type="button"
                                    onClick={showNext}
                                    disabled={
                                        currentIndex >=
                                        visibleVideos.length - 3
                                    }
                                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-bold transition-colors hover:border-teal hover:bg-mint disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label={
                                        bn ? "পরের ভিডিও" : "Next video"
                                    }
                                >
                                    {bn ? "পরের ভিডিও" : "Next"}
                                    <ArrowRight size={17} />
                                </button>
                            </div>
                        )}
                    </>
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
