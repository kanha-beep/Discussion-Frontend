import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";
import { UserContext } from "../Components/UserContext.js";

const initialForm = {
  aboutUser: "",
  engagementRating: 5,
  partnerRating: 5,
  comments: "",
  wantsNotesPdfEmail: false,
};

export default function RoomFeedback() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { discussionId } = useParams();
  const { user } = useContext(UserContext);
  const [discussion, setDiscussion] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadDiscussion = async () => {
      try {
        const res = await api.get(`/api/discussion/${discussionId}`);
        setDiscussion(res?.data?.discussion || null);
      } catch (error) {
        console.log("error loading feedback discussion:", error?.response?.data || error);
      } finally {
        setLoading(false);
      }
    };

    loadDiscussion();
  }, [discussionId]);

  const otherMembers = useMemo(() => {
    const recipients = discussion?.closurePackage?.noteRecipients || discussion?.users || [];
    const owner = discussion?.owner ? [discussion.owner] : [];
    const members = [...owner, ...recipients];
    return members.filter(
      (member) => String(member?._id || member) !== String(user?._id || ""),
    );
  }, [discussion?.closurePackage?.noteRecipients, discussion?.users, discussion?.owner, user?._id]);

  useEffect(() => {
    if (!otherMembers.length || form.aboutUser) return;
    setForm((prev) => ({ ...prev, aboutUser: String(otherMembers[0]?._id || "") }));
  }, [form.aboutUser, otherMembers]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await api.post(`/api/discussion/${discussionId}/feedback`, form);
      navigate("/", { replace: true });
    } catch (error) {
      console.log("error submitting room feedback:", error?.response?.data || error);
      alert(error?.response?.data?.msg || "Unable to submit feedback right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const summaryText =
    discussion?.closurePackage?.notes ||
    discussion?.summary ||
    "The room has been closed. Notes will be delivered by the system.";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#111827_50%,_#020617_100%)] px-4 pb-10 pt-24 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.05fr)_360px]">
        <section className="rounded-[28px] border border-white/10 bg-slate-900/60 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/80">
              Room Closed
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
              Share feedback before we wrap this discussion
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              The host has ended the room. Everyone is redirected here so we can capture feedback,
              record who wants the notes PDF by email, and keep the session summary together.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Feedback about
              </label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                value={form.aboutUser}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, aboutUser: event.target.value }))
                }
              >
                {otherMembers.length === 0 ? (
                  <option value="">No other participant available</option>
                ) : (
                  otherMembers.map((member) => {
                    const label =
                      [member.firstName, member.lastName].filter(Boolean).join(" ").trim() ||
                      member.email;
                    return (
                      <option key={member._id} value={member._id} className="text-slate-900">
                        {label}
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Other user feedback
                </span>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                  value={form.partnerRating}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      partnerRating: Number(event.target.value),
                    }))
                  }
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value} className="text-slate-900">
                      {value} / 5
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">
                  Discussion engagement
                </span>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-300"
                  value={form.engagementRating}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      engagementRating: Number(event.target.value),
                    }))
                  }
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value} className="text-slate-900">
                      {value} / 5
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Notes for the team
              </label>
              <textarea
                rows="5"
                className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300"
                placeholder="What worked well, what could improve, and anything useful to keep with the notes."
                value={form.comments}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, comments: event.target.value }))
                }
              />
            </div>

            <label className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/5 px-4 py-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-amber-300"
                checked={form.wantsNotesPdfEmail}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    wantsNotesPdfEmail: event.target.checked,
                  }))
                }
              />
              <span>
                <span className="block text-sm font-semibold text-white">
                  Email me the notes PDF
                </span>
                <span className="mt-1 block text-sm text-slate-300">
                  We will record this preference so the system can send the notes package to your
                  email. System-generated room-close messages are set to delete after 7 days.
                </span>
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={submitting || loading}
                className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit feedback"}
              </button>
              <button
                type="button"
                className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                onClick={() => navigate("/", { replace: true })}
              >
                Skip for now
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-slate-900/60 p-5 backdrop-blur-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Session Summary
            </div>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-200">
              {loading ? "Loading room details..." : summaryText}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-900/60 p-5 backdrop-blur-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Delivery
            </div>
            <div className="mt-3 space-y-3 text-sm text-slate-300">
              <p>Notes are prepared from the room summary stored on the server.</p>
              <p>All room-close messages are marked for automatic deletion after 7 days.</p>
              <p>
                {state?.roomClosed
                  ? "You were redirected here because the host closed the room."
                  : "You can still leave feedback here after the room closes."}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
