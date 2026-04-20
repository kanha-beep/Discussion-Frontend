import { useEffect, useMemo, useState } from "react";

const buildShareTargets = (url, title) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const emailBody = encodeURIComponent(`${title}\n\nJoin here: ${url}`);

  return [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: "bi-whatsapp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      className: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/25",
    },
    {
      id: "telegram",
      label: "Telegram",
      icon: "bi-telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      className: "border-sky-400/30 bg-sky-500/15 text-sky-100 hover:bg-sky-500/25",
    },
    {
      id: "x",
      label: "X",
      icon: "bi-twitter-x",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      className: "border-slate-200/20 bg-white/10 text-white hover:bg-white/20",
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: "bi-facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      className: "border-blue-400/30 bg-blue-500/15 text-blue-100 hover:bg-blue-500/25",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: "bi-linkedin",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      className: "border-cyan-400/30 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25",
    },
    {
      id: "email",
      label: "Email",
      icon: "bi-envelope-fill",
      href: `mailto:?subject=${encodedTitle}&body=${emailBody}`,
      className: "border-amber-300/30 bg-amber-400/15 text-amber-100 hover:bg-amber-400/25",
    },
  ];
};

export default function RoomShareModal({
  open,
  onClose,
  shareUrl,
  title = "Join my discussion room",
}) {
  const [copyStatus, setCopyStatus] = useState("Copy link");

  useEffect(() => {
    if (!open) {
      setCopyStatus("Copy link");
      return undefined;
    }

    const onEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  const shareTargets = useMemo(
    () => buildShareTargets(shareUrl, title),
    [shareUrl, title],
  );

  if (!open) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus("Copied");
    } catch (error) {
      console.log("error copying room share link:", error);
      setCopyStatus("Copy failed");
    }
  };

  const useNativeShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({
        title,
        text: title,
        url: shareUrl,
      });
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.log("error using native share:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <button
        aria-label="Close share dialog"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <div className="relative z-[101] w-full max-w-lg rounded-[24px] border border-white/10 bg-slate-950/95 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              Share Room
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Send this video call link
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Anyone with this link can open the room page and request access.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-[18px] border border-white/10 bg-white/5 p-3">
          <div className="break-all text-sm leading-6 text-slate-200">
            {shareUrl}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={copyLink}
            className="rounded-[14px] border border-cyan-300/30 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/25"
          >
            {copyStatus}
          </button>
          {navigator.share && (
            <button
              onClick={useNativeShare}
              className="rounded-[14px] border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Share now
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {shareTargets.map((target) => (
            <a
              key={target.id}
              href={target.href}
              target={target.id === "email" ? undefined : "_blank"}
              rel={target.id === "email" ? undefined : "noreferrer"}
              className={`flex items-center justify-center gap-2 rounded-[14px] border px-4 py-3 text-sm font-semibold transition ${target.className}`}
            >
              <i className={`bi ${target.icon}`}></i>
              {target.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
