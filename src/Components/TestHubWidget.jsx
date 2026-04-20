import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { testApi } from "../Utils/testApi";

export default function TestHubWidget() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(
    "Prepare a test on world presidents with mixed difficulty and clear explanations.",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    const cleanedPrompt = prompt.trim();
    if (!cleanedPrompt) {
      setError("Enter a prompt to generate a test.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const createdTest = await testApi.generateTest(cleanedPrompt);
      navigate("/tests", {
        state: {
          autoStartTestId: createdTest?._id,
          generatedFromWidget: true,
        },
      });
    } catch (err) {
      setError(err?.response?.data?.msg || err?.message || "Unable to generate test.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-[28px] border border-amber-200 bg-[linear-gradient(145deg,_#fff7ed_0%,_#fffbeb_100%)] p-4 shadow-[0_16px_40px_rgba(120,53,15,0.12)]">
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
        AI Test Lab
      </div>
      <h3 className="mt-2 text-xl font-extrabold text-slate-900">
        Generate a test from your prompt
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Your marks and attempted tests will also appear in Profile under Tests.
      </p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        className="mt-4 w-full rounded-3xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-500"
        placeholder="Prepare a 10-question test on any topic..."
      />

      {error && (
        <div className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate And Start"}
        </button>
        <button
          onClick={() => navigate("/tests")}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-white"
        >
          Open Test Center
        </button>
      </div>
    </div>
  );
}
