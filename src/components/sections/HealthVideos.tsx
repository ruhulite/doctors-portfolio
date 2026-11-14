
import { useState } from "react";
import { Play, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SectionHeading } from "../ui/SectionHeading";

type HealthVideo = {
  id: string;
  youtubeId: string;
  titleKey: string;
  descriptionKey: string;
  categoryKey: string;
};

const healthVideos: HealthVideo[] = [
  // Add your YouTube videos here.
  {
    id: "digestive-health",
    youtubeId: "Q1Qp790pIuc",
    titleKey: "videos.items.digestiveTitle",
    descriptionKey: "videos.items.digestiveDescription",
    categoryKey: "videos.categories.digestive",
  },
  {
    id: "liver-health",
    youtubeId: "GAt0F0J9d4s",
    titleKey: "videos.items.liverTitle",
    descriptionKey: "videos.items.liverDescription",
    categoryKey: "videos.categories.liver",
  },
  {
    id: "healthy-lifestyle",
    youtubeId: "-MAbkUcrdc4",
    titleKey: "videos.items.lifestyleTitle",
    descriptionKey: "videos.items.lifestyleDescription",
    categoryKey: "videos.categories.lifestyle",
  },
];

export function HealthVideos() {
  const { t } = useTranslation();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="health-videos-section">
      <div className="container-shell section-pad">
        <SectionHeading
          eyebrow={t("videos.eyebrow")}
          title={t("videos.title")}
          description={t("videos.description")}
          centered
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {healthVideos.map((video) => (
            <article key={video.id} className="health-video-card">
              <div className="health-video-player">
                {activeVideo === video.id ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                    title={t(video.titleKey)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <button
                    type="button"
                    className="health-video-thumbnail"
                    onClick={() => setActiveVideo(video.id)}
                    aria-label={`${t("videos.play")} ${t(video.titleKey)}`}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                      alt={t(video.titleKey)}
                      loading="lazy"
                    />
                    <span className="health-video-play">
                      <Play size={25} fill="currentColor" />
                    </span>
                  </button>
                )}
              </div>

              <div className="p-5">
                <span className="health-video-category">
                  {t(video.categoryKey)}
                </span>

                <h3 className="mt-3 text-lg font-extrabold text-ink">
                  {t(video.titleKey)}
                </h3>

                <p className="mt-2 text-sm leading-7 text-muted">
                  {t(video.descriptionKey)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-9 text-center">
          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noreferrer"
            className="health-video-channel"
          >
            <Youtube size={19} />
            {t("videos.visitChannel")}
          </a>
        </div>

        <p className="mt-6 text-center text-xs leading-6 text-muted">
          {t("videos.disclaimer")}
        </p>
      </div>
    </section>
  );
}
