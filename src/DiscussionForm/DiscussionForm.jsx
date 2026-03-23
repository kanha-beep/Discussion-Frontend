import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { UserContext } from "../Components/UserContext.js";

export default function DiscussionForm() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const userEmail = user?.email || "";

  const [disForm, setDisForm] = useState({
    email: userEmail,
    keywords: [],
    remarks: "",
  });
  const [keyList, setKeyList] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userEmail) return;
    setDisForm((prev) => ({
      ...prev,
      email: userEmail,
    }));
  }, [userEmail]);

  const handleAddKeywords = () => {
    const incoming = keyList
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (incoming.length === 0) return;

    setDisForm((prev) => ({
      ...prev,
      keywords: [
        ...prev.keywords,
        ...incoming.filter((keyword) => !prev.keywords.includes(keyword)),
      ],
    }));
    setKeyList("");
  };

  const removeKeyword = (keywordToRemove) => {
    setDisForm((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((keyword) => keyword !== keywordToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!disForm.email) {
      alert("Please wait for your account to load, then try again.");
      return;
    }

    if (disForm.keywords.length === 0) {
      alert("Please add at least one keyword.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/discussion/new", disForm);
      navigate("/", { state: { refresh: true } });
    } catch (error) {
      console.log("error in creating discussion:", error?.response?.data);
      alert(
        error?.response?.data?.msg ||
          error?.response?.data?.message ||
          "Unable to create discussion right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_42%,_#f8fafc_100%)] px-3 pb-28 pt-24 sm:px-6 lg:px-8 lg:pb-12">
      <div className="mx-auto flex w-full max-w-[92vw] flex-col gap-5 sm:max-w-3xl">
        <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[28px] sm:p-8">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5">
            <div className="inline-flex w-fit items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              Discussion Form
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create a new discussion
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Add a focused topic with a few clear keywords so the card, room,
                and bot discussion all start with the right context.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">
                Email
              </label>
              <input
                type="email"
                value={disForm.email}
                readOnly
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
              />
              <p className="text-xs text-slate-500">
                Your logged-in platform email will be used automatically.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-800">
                Keywords
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={keyList}
                  onChange={(e) => setKeyList(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeywords();
                    }
                  }}
                  placeholder="Add keywords, separated by commas"
                  className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
                <button
                  type="button"
                  onClick={handleAddKeywords}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:min-w-[110px]"
                >
                  Add
                </button>
              </div>
              <div className="flex min-h-12 flex-wrap gap-2">
                {disForm.keywords.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    No keywords added yet.
                  </div>
                ) : (
                  disForm.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-800"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-xs text-cyan-800 transition hover:bg-cyan-200"
                      >
                        x
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">
                Remarks
              </label>
              <textarea
                rows="6"
                value={disForm.remarks}
                onChange={(e) =>
                  setDisForm((prev) => ({
                    ...prev,
                    remarks: e.target.value,
                  }))
                }
                placeholder="Write the discussion brief, angle, or context you want people and bots to discuss."
                required
                className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-[linear-gradient(135deg,_#0891b2_0%,_#1d4ed8_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(29,78,216,0.2)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating..." : "Create Discussion"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
