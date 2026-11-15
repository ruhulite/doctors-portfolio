
import { useEffect, useState } from "react";
import type React from "react";
import {
 api,
 type Session,
 type LandingSection,
 type VideoItem,
} from "../lib/api";
import { SectionContentEditor } from "../components/admin/SectionContentEditor";

const KEY = "kafi_cms_session";

type VideoSource = "YOUTUBE" | "FACEBOOK" | "EXTERNAL" | "UPLOAD";

type VideoForm = {
 source: VideoSource;
 titleBn: string;
 titleEn: string;
 descriptionBn: string;
 descriptionEn: string;
 categoryBn: string;
 categoryEn: string;
 youtubeUrl: string;
 facebookUrl: string;
 externalUrl: string;
 featured: boolean;
};

const initialVideo: VideoForm = {
 source: "YOUTUBE",
 titleBn: "",
 titleEn: "",
 descriptionBn: "",
 descriptionEn: "",
 categoryBn: "স্বাস্থ্য সচেতনতা",
 categoryEn: "Health Awareness",
 youtubeUrl: "",
 facebookUrl: "",
 externalUrl: "",
 featured: false,
};

export function AdminPage() {
 const [session, setSession] = useState<Session | null>(() => {
  try {
   return JSON.parse(sessionStorage.getItem(KEY) || "null");
  } catch {
   return null;
  }
 });

 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState("");
 const [sections, setSections] = useState<LandingSection[]>([]);
 const [videos, setVideos] = useState<VideoItem[]>([]);
 const [selected, setSelected] = useState("");
 const [editor, setEditor] = useState("{}");
 const [notice, setNotice] = useState("");
 const [tab, setTab] = useState<"content" | "videos" | "users">("content");

 const [admins, setAdmins] = useState<
     Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      active: boolean;
     }>
 >([]);

 const [newAdmin, setNewAdmin] = useState({
  name: "",
  email: "",
  password: "",
  role: "ADMIN",
 });

 const [busy, setBusy] = useState(false);
 const [video, setVideo] = useState<VideoForm>(initialVideo);
 const [file, setFile] = useState<File | null>(null);
 const [thumbnail, setThumbnail] = useState<File | null>(null);
 const [captions, setCaptions] = useState<File | null>(null);
 const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

 async function login(e: React.FormEvent) {
  e.preventDefault();
  setBusy(true);
  setError("");

  try {
   const s = await api<Session>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
   });

   setSession(s);
   sessionStorage.setItem(KEY, JSON.stringify(s));
   setPassword("");
  } catch (e) {
   setError(e instanceof Error ? e.message : "Login failed");
  } finally {
   setBusy(false);
  }
 }

 async function load() {
  if (!session) return;

  try {
   const [s, v] = await Promise.all([
    api<LandingSection[]>("/admin/sections", {}, session.accessToken),
    api<VideoItem[]>("/admin/videos", {}, session.accessToken),
   ]);

   setSections(s);
   setVideos(v);

   if (session.user.role === "SUPER_ADMIN") {
    const u = await api<typeof admins>(
        "/admin/users",
        {},
        session.accessToken
    );
    setAdmins(u);
   }

   if (!selected && s[0]) {
    setSelected(s[0].id);
    setEditor(JSON.stringify(s[0].draftContent, null, 2));
   }
  } catch (e) {
   setError(
       e instanceof Error ? e.message : "Could not load admin data"
   );
  }
 }

 useEffect(() => {
  void load();
 }, [session?.accessToken]);

 function choose(s: LandingSection) {
  setSelected(s.id);
  setEditor(JSON.stringify(s.draftContent, null, 2));
  setNotice("");
 }

 async function saveDraft() {
  if (!session || !selected) return;

  setBusy(true);
  setError("");

  try {
   const content = JSON.parse(editor);

   await api(
       `/admin/sections/${selected}/draft`,
       {
        method: "PUT",
        body: JSON.stringify({ content }),
       },
       session.accessToken
   );

   setNotice("Draft saved. Public content is unchanged.");
   await load();
  } catch (e) {
   setError(
       e instanceof Error ? e.message : "Invalid JSON or save failed"
   );
  } finally {
   setBusy(false);
  }
 }

 async function publish(id: string) {
  if (!session) return;

  setBusy(true);

  try {
   await api(
       `/admin/sections/${id}/publish`,
       { method: "POST" },
       session.accessToken
   );

   setNotice("Section published successfully.");
   await load();
  } catch (e) {
   setError(e instanceof Error ? e.message : "Publish failed");
  } finally {
   setBusy(false);
  }
 }

 async function addVideo(e: React.FormEvent) {
  e.preventDefault();
  if (!session) return;

  setBusy(true);
  setError("");

  try {
   if (video.source === "UPLOAD" && !file && !editingVideoId) {
    throw new Error("Select a video file first.");
   }

   if (editingVideoId) {
    // Existing backend update endpoint edits metadata only.
    await api(
        `/admin/videos/${editingVideoId}`,
        {
         method: "PUT",
         body: JSON.stringify({
          titleBn: video.titleBn,
          titleEn: video.titleEn,
          descriptionBn: video.descriptionBn,
          descriptionEn: video.descriptionEn,
          categoryBn: video.categoryBn,
          categoryEn: video.categoryEn,
          featured: video.featured,
         }),
        },
        session.accessToken
    );

    setEditingVideoId(null);
   } else {
    const form = new FormData();

    Object.entries(video).forEach(([k, v]) => {
     form.append(k, String(v));
    });

    if (file) form.append("video", file);
    if (thumbnail) form.append("thumbnail", thumbnail);
    if (captions) form.append("captions", captions);

    await api(
        "/admin/videos",
        {
         method: "POST",
         body: form,
        },
        session.accessToken
    );
   }

   setNotice("Video saved. Review and publish it when ready.");

   setVideo({ ...initialVideo });
   setFile(null);
   setThumbnail(null);
   setCaptions(null);

   await load();
  } catch (e) {
   setError(e instanceof Error ? e.message : "Video save failed");
  } finally {
   setBusy(false);
  }
 }

 async function videoAction(
     id: string,
     action: "publish" | "unpublish" | "delete"
 ) {
  if (!session) return;

  if (
      action === "delete" &&
      !confirm("Delete this video permanently?")
  ) {
   return;
  }

  try {
   await api(
       `/admin/videos/${id}/${action}`,
       { method: "POST" },
       session.accessToken
   );

   await load();
   setNotice(`Video ${action} complete.`);
  } catch (e) {
   setError(e instanceof Error ? e.message : "Action failed");
  }
 }

 function editVideo(v: VideoItem) {
  setEditingVideoId(v.id);

  setVideo({
   source: v.source,
   titleBn: v.titleBn,
   titleEn: v.titleEn,
   descriptionBn: v.descriptionBn,
   descriptionEn: v.descriptionEn,
   categoryBn: v.categoryBn,
   categoryEn: v.categoryEn,
   youtubeUrl:
       v.source === "YOUTUBE"
           ? v.mediaUrl.startsWith("http")
               ? v.mediaUrl
               : `https://www.youtube.com/watch?v=${v.mediaUrl}`
           : "",
   facebookUrl: v.source === "FACEBOOK" ? v.mediaUrl : "",
   externalUrl: v.source === "EXTERNAL" ? v.mediaUrl : "",
   featured: v.featured,
  });

  setFile(null);
  setThumbnail(null);
  setCaptions(null);
  setError("");
  setNotice("");
 }

 function cancelEdit() {
  setEditingVideoId(null);
  setVideo({ ...initialVideo });
  setFile(null);
  setThumbnail(null);
  setCaptions(null);
 }

 if (!session) {
  return (
      <section className="container-shell section-pad">
       <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-7 shadow-sm">
        <p className="section-kicker">SECURE ACCESS</p>
        <h1 className="text-2xl font-extrabold">Admin Login</h1>

        <p className="mt-2 text-sm text-muted">
         Super Admin and Admin access only.
        </p>

        <form onSubmit={login} className="mt-6 grid gap-4">
         <label className="grid gap-1 text-sm font-semibold">
          Email
          <input
              required
              type="email"
              autoComplete="username"
              className="rounded-lg border border-line p-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
          />
         </label>

         <label className="grid gap-1 text-sm font-semibold">
          Password
          <input
              required
              type="password"
              autoComplete="current-password"
              className="rounded-lg border border-line p-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
          />
         </label>

         {error && (
             <p role="alert" className="text-sm text-red-700">
              {error}
             </p>
         )}

         <button
             disabled={busy}
             className="rounded-full bg-teal px-5 py-3 font-bold text-deep"
         >
          {busy ? "Signing in…" : "Sign in"}
         </button>
        </form>
       </div>
      </section>
  );
 }

 return (
     <section className="container-shell section-pad">
      <div className="flex flex-wrap items-center justify-between gap-3">
       <div>
        <p className="section-kicker">CONTENT MANAGEMENT</p>
        <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
        <p className="text-sm text-muted">
         Signed in as {session.user.name} · {session.user.role}
        </p>
       </div>

       <button
           onClick={() => {
            sessionStorage.removeItem(KEY);
            setSession(null);
           }}
           className="rounded-full border border-line px-4 py-2 text-sm font-bold"
       >
        Sign out
       </button>
      </div>

      <div className="mt-7 flex gap-2">
       <button
           onClick={() => setTab("content")}
           className={`rounded-full px-5 py-2 text-sm font-bold ${
               tab === "content" ? "bg-teal text-deep" : "border border-line"
           }`}
       >
        Landing content
       </button>

       <button
           onClick={() => setTab("videos")}
           className={`rounded-full px-5 py-2 text-sm font-bold ${
               tab === "videos" ? "bg-teal text-deep" : "border border-line"
           }`}
       >
        Videos
       </button>

       {session.user.role === "SUPER_ADMIN" && (
           <button
               onClick={() => setTab("users")}
               className={`rounded-full px-5 py-2 text-sm font-bold ${
                   tab === "users" ? "bg-teal text-deep" : "border border-line"
               }`}
           >
            Admin users
           </button>
       )}
      </div>

      {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
           {error}
          </p>
      )}

      {notice && (
          <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">
           {notice}
          </p>
      )}

      {tab === "users" ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
           <form
               onSubmit={async (e) => {
                e.preventDefault();

                try {
                 await api(
                     "/admin/users",
                     {
                      method: "POST",
                      body: JSON.stringify(newAdmin),
                     },
                     session.accessToken
                 );

                 setNewAdmin({
                  name: "",
                  email: "",
                  password: "",
                  role: "ADMIN",
                 });

                 setNotice("Admin account created.");
                 await load();
                } catch (err) {
                 setError(
                     err instanceof Error
                         ? err.message
                         : "Could not create account"
                 );
                }
               }}
               className="rounded-xl border border-line p-5"
           >
            <h2 className="font-extrabold">Create admin account</h2>

            <label className="mt-3 grid gap-1 text-sm">
             Name
             <input
                 required
                 value={newAdmin.name}
                 onChange={(e) =>
                     setNewAdmin((v) => ({ ...v, name: e.target.value }))
                 }
                 className="rounded-lg border border-line p-3"
             />
            </label>

            <label className="mt-3 grid gap-1 text-sm">
             Email
             <input
                 required
                 type="email"
                 value={newAdmin.email}
                 onChange={(e) =>
                     setNewAdmin((v) => ({ ...v, email: e.target.value }))
                 }
                 className="rounded-lg border border-line p-3"
             />
            </label>

            <label className="mt-3 grid gap-1 text-sm">
             Initial password (minimum 12 characters)
             <input
                 required
                 minLength={12}
                 type="password"
                 value={newAdmin.password}
                 onChange={(e) =>
                     setNewAdmin((v) => ({ ...v, password: e.target.value }))
                 }
                 className="rounded-lg border border-line p-3"
             />
            </label>

            <label className="mt-3 grid gap-1 text-sm">
             Role
             <select
                 value={newAdmin.role}
                 onChange={(e) =>
                     setNewAdmin((v) => ({ ...v, role: e.target.value }))
                 }
                 className="rounded-lg border border-line p-3"
             >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
             </select>
            </label>

            <button className="mt-4 rounded-full bg-teal px-5 py-3 font-bold text-deep">
             Create account
            </button>
           </form>

           <div className="rounded-xl border border-line p-5">
            <h2 className="font-extrabold">Admin accounts</h2>

            <div className="mt-4 grid gap-3">
             {admins.map((u) => (
                 <div key={u.id} className="rounded-lg border border-line p-3">
                  <strong>{u.name}</strong>
                  <p className="text-sm text-muted">
                   {u.email} · {u.role} · {u.active ? "Active" : "Disabled"}
                  </p>
                 </div>
             ))}
            </div>
           </div>
          </div>
      ) : tab === "content" ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
           <aside className="rounded-xl border border-line p-3">
            <h2 className="p-2 font-bold">Landing page sections</h2>

            {sections.map((s) => (
                <button
                    key={s.id}
                    onClick={() => choose(s)}
                    className={`block w-full rounded-lg px-3 py-3 text-left text-sm ${
                        selected === s.id
                            ? "bg-mint font-bold text-teal"
                            : "hover:bg-mist"
                    }`}
                >
                 {s.title}
                 <span className="block text-xs text-muted">
                  {s.enabled ? "Enabled" : "Disabled"} ·{" "}
                  {s.publishedContent ? "Published" : "Not published"}
                </span>
                </button>
            ))}
           </aside>

           <div className="rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
             <h2 className="font-bold">Edit landing page content</h2>

             <div className="flex flex-wrap gap-2">
              <button
                  onClick={() => {
                   window.location.href = "/?preview=1";
                  }}
                  className="rounded-full border border-line px-4 py-2 text-sm font-bold"
              >
               Preview draft
              </button>

              <button
                  onClick={saveDraft}
                  disabled={busy || !selected}
                  className="rounded-full border border-line px-4 py-2 text-sm font-bold"
              >
               Save draft
              </button>

              {session.user.role === "SUPER_ADMIN" && (
                  <button
                      onClick={() => publish(selected)}
                      disabled={busy || !selected}
                      className="rounded-full bg-teal px-4 py-2 text-sm font-bold text-deep"
                  >
                   Publish
                  </button>
              )}
             </div>
            </div>

            <p className="my-3 text-xs leading-6 text-muted">
             Edit the Bangla and English content using individual fields.
             Save your changes as a draft before previewing or publishing.
            </p>

            <SectionContentEditor
                sectionKey={sections.find((s) => s.id === selected)?.key ?? ""}
                value={editor}
                onChange={setEditor}
                token={session.accessToken}
            />
           </div>
          </div>
      ) : (
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.8fr)]">
           <form
               onSubmit={addVideo}
               className="rounded-xl border border-line p-5"
           >
            <h2 className="text-xl font-extrabold">
             {editingVideoId ? "Edit video details" : "Add educational video"}
            </h2>

            <label className="mt-4 grid gap-1 text-sm font-semibold">
             Video source

             <select
                 className="rounded-lg border border-line p-3"
                 value={video.source}
                 disabled={!!editingVideoId}
                 onChange={(e) =>
                     setVideo((v) => ({
                      ...v,
                      source: e.target.value as VideoSource,
                     }))
                 }
             >
              <option value="YOUTUBE">YouTube URL</option>
              <option value="FACEBOOK">Facebook video URL</option>
              <option value="EXTERNAL">External video URL</option>
              <option value="UPLOAD">Upload to hosting server</option>
             </select>

             {editingVideoId && (
                 <span className="text-xs text-muted">
                  Source cannot be changed while editing an existing video.
                </span>
             )}
            </label>

            {video.source === "UPLOAD" ? (
                <label className="mt-3 grid gap-1 text-sm font-semibold">
                 Video file (maximum duration 180 seconds)

                 <input
                     type="file"
                     accept="video/mp4,video/webm,video/quicktime"
                     onChange={(e) => setFile(e.target.files?.[0] || null)}
                     required={!editingVideoId}
                     disabled={!!editingVideoId}
                     className="rounded-lg border border-line p-3"
                 />

                 <span className="text-xs text-muted">
                  Direct uploads must not exceed 180 seconds.
                </span>
                </label>
            ) : video.source === "YOUTUBE" ? (
                <label className="mt-3 grid gap-1 text-sm font-semibold">
                 YouTube video URL

                 <input
                     required
                     type="url"
                     value={video.youtubeUrl}
                     onChange={(e) =>
                         setVideo((v) => ({ ...v, youtubeUrl: e.target.value }))
                     }
                     className="rounded-lg border border-line p-3"
                     placeholder="https://www.youtube.com/watch?v=..."
                 />
                </label>
            ) : video.source === "FACEBOOK" ? (
                <label className="mt-3 grid gap-1 text-sm font-semibold">
                 Facebook video URL

                 <input
                     required
                     type="url"
                     value={video.facebookUrl}
                     onChange={(e) =>
                         setVideo((v) => ({ ...v, facebookUrl: e.target.value }))
                     }
                     className="rounded-lg border border-line p-3"
                     placeholder="https://www.facebook.com/..."
                 />

                 <span className="text-xs text-muted">
                  Use a publicly accessible Facebook video URL.
                </span>
                </label>
            ) : (
                <label className="mt-3 grid gap-1 text-sm font-semibold">
                 External video URL

                 <input
                     required
                     type="url"
                     value={video.externalUrl}
                     onChange={(e) =>
                         setVideo((v) => ({ ...v, externalUrl: e.target.value }))
                     }
                     className="rounded-lg border border-line p-3"
                     placeholder="https://example.com/video.mp4"
                 />

                 <span className="text-xs text-muted">
                  No 180-second limit. Playback depends on the provider
                  supporting video playback or embedding.
                </span>
                </label>
            )}

            <label className="mt-3 grid gap-1 text-sm font-semibold">
             Custom thumbnail (optional)

             <input
                 type="file"
                 accept="image/*"
                 onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                 className="rounded-lg border border-line p-3"
             />
            </label>

            {video.source === "UPLOAD" && (
                <label className="mt-3 grid gap-1 text-sm font-semibold">
                 Captions/subtitles (.vtt, optional)

                 <input
                     type="file"
                     accept=".vtt,text/vtt"
                     onChange={(e) => setCaptions(e.target.files?.[0] || null)}
                     className="rounded-lg border border-line p-3"
                 />
                </label>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
             {(
                 ["titleBn", "titleEn", "categoryBn", "categoryEn"] as const
             ).map((k) => (
                 <label
                     key={k}
                     className="grid gap-1 text-sm font-semibold"
                 >
                  {
                   {
                    titleBn: "Title (Bangla)",
                    titleEn: "Title (English)",
                    categoryBn: "Category (Bangla)",
                    categoryEn: "Category (English)",
                   }[k]
                  }

                  <input
                      required
                      value={video[k]}
                      onChange={(e) =>
                          setVideo((v) => ({ ...v, [k]: e.target.value }))
                      }
                      className="rounded-lg border border-line p-3"
                  />
                 </label>
             ))}
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
             {(["descriptionBn", "descriptionEn"] as const).map((k) => (
                 <label
                     key={k}
                     className="grid gap-1 text-sm font-semibold"
                 >
                  {k === "descriptionBn"
                      ? "Description (Bangla)"
                      : "Description (English)"}

                  <textarea
                      rows={3}
                      value={video[k]}
                      onChange={(e) =>
                          setVideo((v) => ({ ...v, [k]: e.target.value }))
                      }
                      className="rounded-lg border border-line p-3"
                  />
                 </label>
             ))}
            </div>

            <label className="mt-3 flex items-center gap-2 text-sm">
             <input
                 type="checkbox"
                 checked={video.featured}
                 onChange={(e) =>
                     setVideo((v) => ({ ...v, featured: e.target.checked }))
                 }
             />
             Featured video
            </label>

            <button
                disabled={busy}
                className="mt-5 rounded-full bg-teal px-5 py-3 font-bold text-deep"
            >
             {busy
                 ? "Saving…"
                 : editingVideoId
                     ? "Save video changes"
                     : "Save video as draft"}
            </button>

            {editingVideoId && (
                <button
                    type="button"
                    onClick={cancelEdit}
                    className="ml-3 rounded-full border border-line px-5 py-3 text-sm font-bold"
                >
                 Cancel edit
                </button>
            )}
           </form>

           <div className="rounded-xl border border-line p-5">
            <h2 className="text-xl font-extrabold">Video library</h2>

            <div className="mt-4 grid gap-3">
             {videos.map((v) => (
                 <article
                     key={v.id}
                     className="rounded-lg border border-line p-3"
                 >
                  <div className="flex justify-between gap-2">
                   <strong className="text-sm">{v.titleBn}</strong>
                   <span className="text-xs text-muted">{v.status}</span>
                  </div>

                  <p className="mt-1 text-xs text-muted">
                   {v.source}
                   {v.durationSeconds != null &&
                       ` · ${Math.floor(v.durationSeconds / 60)}:${String(
                           v.durationSeconds % 60
                       ).padStart(2, "0")}`}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                   <button
                       onClick={() => editVideo(v)}
                       className="text-xs font-bold text-slate-700"
                   >
                    Edit
                   </button>

                   {v.status === "PUBLISHED" ? (
                       <button
                           onClick={() => videoAction(v.id, "unpublish")}
                           className="text-xs font-bold text-teal"
                       >
                        Unpublish
                       </button>
                   ) : session.user.role === "SUPER_ADMIN" ? (
                       <button
                           onClick={() => videoAction(v.id, "publish")}
                           className="text-xs font-bold text-teal"
                       >
                        Publish
                       </button>
                   ) : (
                       <span className="text-xs text-muted">
                        Draft — Awaiting Super Admin
                      </span>
                   )}

                   <button
                       onClick={() => videoAction(v.id, "delete")}
                       className="text-xs font-bold text-red-700"
                   >
                    Delete
                   </button>
                  </div>
                 </article>
             ))}

             {!videos.length && (
                 <p className="text-sm text-muted">
                  No videos added yet.
                 </p>
             )}
            </div>
           </div>
          </div>
      )}
     </section>
 );
}
