import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserContext } from "../Components/UserContext";
import { testApi } from "../Utils/testApi";

const initialState = {
  tests: [],
  submissions: [],
  loading: true,
  error: "",
  candidateName: "",
  generationPrompt:
    "Prepare a 10-question test on presidents topic with mixed difficulty and clear explanations.",
  generating: false,
  activeTest: null,
  currentIndex: 0,
  answers: {},
  timeLeft: 0,
  submission: null,
  resultFilter: "all",
};

const filters = [
  { key: "all", label: "All" },
  { key: "correct", label: "Correct" },
  { key: "incorrect", label: "Incorrect" },
  { key: "skipped", label: "Skipped" },
  { key: "review", label: "Review" },
];

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function buildAnswerState(previous, questionId, nextAnswer) {
  return {
    ...previous,
    [questionId]: {
      ...(previous[questionId] || {}),
      ...nextAnswer,
    },
  };
}

function getPaletteStatus(answer) {
  if (!answer) return "bg-white text-slate-700";
  if (answer.status === "review" || answer.status === "review_answered") {
    return "bg-violet-100 text-violet-800";
  }
  if (answer.selectedOption) {
    return "bg-emerald-100 text-emerald-800";
  }
  return "bg-slate-200 text-slate-700";
}

function matchesFilter(answer, activeFilter) {
  if (activeFilter === "all") return true;
  if (activeFilter === "correct") {
    return answer.status === "correct" || answer.status === "review_correct";
  }
  if (activeFilter === "incorrect") {
    return answer.status === "incorrect" || answer.status === "review_incorrect";
  }
  if (activeFilter === "review") {
    return answer.status.startsWith("review");
  }
  return answer.status === activeFilter;
}

export default function TestPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);
  const stateRef = useRef(initialState);
  const [state, setState] = useState(initialState);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const loadDashboardData = async (candidateName = "") => {
    const [tests, submissions] = await Promise.all([
      testApi.getTests(),
      testApi.getSubmissions(candidateName),
    ]);

    setState((previous) => ({
      ...previous,
      tests,
      submissions,
      loading: false,
    }));
  };

  useEffect(() => {
    if (!user?._id) return;

    const defaultName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      user?.email?.split("@")[0] ||
      "";

    loadDashboardData(defaultName)
      .then(async () => {
        setState((previous) => ({
          ...previous,
          candidateName: previous.candidateName || defaultName,
        }));

        const autoStartTestId = location.state?.autoStartTestId;
        if (autoStartTestId) {
          const test = await testApi.getTest(autoStartTestId);
          setState((previous) => ({
            ...previous,
            candidateName: previous.candidateName || defaultName,
            activeTest: test,
            currentIndex: 0,
            answers: {},
            timeLeft: test.durationMinutes * 60,
            submission: null,
            resultFilter: "all",
          }));
          navigate(location.pathname, { replace: true, state: {} });
        }
      })
      .catch((error) => {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: error?.message || "Unable to load test center",
        }));
      });
  }, [user?._id]);

  useEffect(() => {
    if (!state.activeTest || state.submission) {
      window.clearInterval(timerRef.current);
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setState((previous) => {
        if (previous.timeLeft <= 1) {
          window.clearInterval(timerRef.current);
          return { ...previous, timeLeft: 0 };
        }
        return { ...previous, timeLeft: previous.timeLeft - 1 };
      });
    }, 1000);

    return () => window.clearInterval(timerRef.current);
  }, [state.activeTest, state.submission]);

  useEffect(() => {
    if (state.activeTest && !state.submission && state.timeLeft === 0) {
      submitTest();
    }
  }, [state.timeLeft, state.activeTest, state.submission]);

  const startTest = async (testId) => {
    const test = await testApi.getTest(testId);
    setState((previous) => ({
      ...previous,
      activeTest: test,
      currentIndex: 0,
      answers: {},
      timeLeft: test.durationMinutes * 60,
      submission: null,
      resultFilter: "all",
      error: "",
    }));
  };

  const generateTest = async () => {
    const prompt = state.generationPrompt.trim();
    if (!prompt) {
      setState((previous) => ({ ...previous, error: "Enter a prompt to generate a test" }));
      return;
    }

    try {
      setState((previous) => ({ ...previous, generating: true, error: "" }));
      const createdTest = await testApi.generateTest(prompt);
      await loadDashboardData(stateRef.current.candidateName);
      await startTest(createdTest._id);
      setState((previous) => ({ ...previous, generating: false }));
    } catch (error) {
      setState((previous) => ({
        ...previous,
        generating: false,
        error: error?.message || "Unable to generate test",
      }));
    }
  };

  const selectOption = (questionId, optionKey) => {
    setState((previous) => {
      const existing = previous.answers[questionId];
      const nextStatus =
        existing?.status === "review" || existing?.status === "review_answered"
          ? "review_answered"
          : "answered";

      return {
        ...previous,
        answers: buildAnswerState(previous.answers, questionId, {
          selectedOption: optionKey,
          status: nextStatus,
        }),
      };
    });
  };

  const skipQuestion = (questionId) => {
    setState((previous) => ({
      ...previous,
      answers: buildAnswerState(previous.answers, questionId, {
        selectedOption: null,
        status: "skipped",
      }),
    }));
  };

  const clearResponse = (questionId) => {
    setState((previous) => {
      const existing = previous.answers[questionId];
      const nextStatus =
        existing?.status === "review_answered" || existing?.status === "review"
          ? "review"
          : "skipped";

      return {
        ...previous,
        answers: buildAnswerState(previous.answers, questionId, {
          selectedOption: null,
          status: nextStatus,
        }),
      };
    });
  };

  const markForReview = (questionId) => {
    setState((previous) => {
      const existing = previous.answers[questionId];
      return {
        ...previous,
        answers: buildAnswerState(previous.answers, questionId, {
          selectedOption: existing?.selectedOption || null,
          status: existing?.selectedOption ? "review_answered" : "review",
        }),
      };
    });
  };

  const submitTest = async () => {
    const currentState = stateRef.current;
    if (!currentState.activeTest) return;

    const payload = {
      candidateName: currentState.candidateName,
      answers: currentState.activeTest.questions.map((question) => {
        const answer = currentState.answers[question._id];
        return {
          questionId: question._id,
          selectedOption: answer?.selectedOption || null,
          status: answer?.status || "skipped",
        };
      }),
    };

    const submissionResponse = await testApi.submitTest(currentState.activeTest._id, payload);
    const [submission, submissions] = await Promise.all([
      testApi.getSubmission(submissionResponse.submissionId),
      testApi.getSubmissions(currentState.candidateName),
    ]);

    setState((previous) => ({
      ...previous,
      submission,
      submissions,
      resultFilter: "all",
    }));
  };

  const resetToLanding = async () => {
    window.clearInterval(timerRef.current);
    setState((previous) => ({
      ...previous,
      activeTest: null,
      currentIndex: 0,
      answers: {},
      timeLeft: 0,
      submission: null,
      resultFilter: "all",
    }));
    await loadDashboardData(stateRef.current.candidateName);
  };

  const activeQuestion = state.activeTest?.questions?.[state.currentIndex];
  const activeAnswer = activeQuestion ? state.answers[activeQuestion._id] : null;
  const answeredCount = Object.values(state.answers).filter((item) => item?.selectedOption).length;
  const reviewCount = Object.values(state.answers).filter(
    (item) => item?.status === "review" || item?.status === "review_answered",
  ).length;

  return (
    <main className="min-h-screen bg-[linear-gradient(140deg,_#f8fafc_0%,_#fff7ed_55%,_#eff6ff_100%)] px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {state.error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {state.error}
          </div>
        )}

        {!state.activeTest && !state.submission && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-amber-700">Test Center</div>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Generate a prompt-based test and solve it here.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                Every generated paper stays in your account, and every attempted test is pushed to your profile Tests section and mailbox.
              </p>

              <div className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">Candidate name</label>
                  <input
                    value={state.candidateName}
                    onChange={(e) => setState((previous) => ({ ...previous, candidateName: e.target.value }))}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none focus:border-amber-400 focus:bg-white"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">Test generation prompt</label>
                  <textarea
                    value={state.generationPrompt}
                    onChange={(e) => setState((previous) => ({ ...previous, generationPrompt: e.target.value }))}
                    rows={6}
                    className="w-full rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none focus:border-amber-400 focus:bg-white"
                    placeholder="Prepare a 10-question test on a topic..."
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={generateTest}
                    disabled={state.generating}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {state.generating ? "Generating..." : "Generate Test"}
                  </button>
                  <button
                    onClick={() => loadDashboardData(state.candidateName)}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => navigate(`/profile/${user?._id}?tab=tests`)}
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-800 transition hover:bg-amber-100"
                  >
                    Open Profile Tests
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Attempt History</h2>
                    <p className="mt-1 text-sm text-slate-500">Your completed tests and marks.</p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                    {state.submissions.length}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {state.loading ? (
                    <div className="text-sm text-slate-500">Loading attempts...</div>
                  ) : state.submissions.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      No test attempts yet.
                    </div>
                  ) : (
                    state.submissions.map((submission) => (
                      <div key={submission._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-base font-bold text-slate-900">
                              {submission.test?.title || "Saved Test"}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">{submission.candidateName}</div>
                          </div>
                          <div className="rounded-2xl bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-800">
                            {submission.score}/{submission.test?.totalMarks || 0}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Saved Tests</h2>
                    <p className="mt-1 text-sm text-slate-500">Open any paper you already generated.</p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                    {state.tests.length}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {state.loading ? (
                    <div className="text-sm text-slate-500">Loading tests...</div>
                  ) : state.tests.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      No generated tests yet.
                    </div>
                  ) : (
                    state.tests.map((test) => (
                      <div key={test._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-base font-bold text-slate-900">{test.title}</div>
                            <div className="mt-1 text-sm text-slate-500">
                              {test.totalQuestions} questions, {test.durationMinutes} min
                            </div>
                          </div>
                          <button
                            onClick={() => startTest(test._id)}
                            className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
                          >
                            Start
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {state.activeTest && !state.submission && activeQuestion && (
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Candidate</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{state.candidateName || "Candidate"}</div>
                <div className="mt-5 rounded-3xl bg-amber-50 p-4">
                  <div className="text-sm text-slate-600">Time left</div>
                  <div className="mt-1 text-4xl font-black text-slate-900">{formatTime(state.timeLeft)}</div>
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-3xl font-black text-slate-900">{answeredCount}</div>
                    <div className="text-sm text-slate-500">Answered</div>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <div className="text-3xl font-black text-slate-900">{reviewCount}</div>
                    <div className="text-sm text-slate-500">Review</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-900">Question Palette</h2>
                  <span className="text-sm text-slate-500">{state.activeTest.totalQuestions}</span>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {state.activeTest.questions.map((question, index) => (
                    <button
                      key={question._id}
                      onClick={() => setState((previous) => ({ ...previous, currentIndex: index }))}
                      className={`rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                        state.currentIndex === index ? "border-amber-500" : "border-transparent"
                      } ${getPaletteStatus(state.answers[question._id])}`}
                    >
                      {question.number}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <section className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                    Question {activeQuestion.number}
                  </div>
                  <h1 className="mt-2 text-3xl font-black text-slate-900">{activeQuestion.subject}</h1>
                </div>
                <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                  {activeQuestion.difficulty}
                </span>
              </div>

              <p className="mt-6 text-xl font-semibold leading-9 text-slate-900">{activeQuestion.prompt}</p>

              <div className="mt-6 grid gap-4">
                {activeQuestion.options.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => selectOption(activeQuestion._id, option.key)}
                    className={`flex items-start gap-4 rounded-[24px] border px-5 py-4 text-left transition hover:-translate-y-0.5 ${
                      activeAnswer?.selectedOption === option.key
                        ? "border-amber-500 bg-amber-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900/10 font-bold text-slate-900">
                      {option.key}
                    </span>
                    <span className="text-base leading-7 text-slate-700">{option.text}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => clearResponse(activeQuestion._id)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Clear</button>
                <button onClick={() => skipQuestion(activeQuestion._id)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Skip</button>
                <button onClick={() => markForReview(activeQuestion._id)} className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-500">Mark for Review</button>
                <button onClick={submitTest} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Submit Test</button>
              </div>
            </section>
          </div>
        )}

        {state.submission && (
          <section className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Result Analysis</div>
                  <h1 className="mt-2 text-4xl font-black text-slate-900">{state.submission.test?.title}</h1>
                  <p className="mt-3 text-lg text-slate-600">
                    Score <strong>{state.submission.score}</strong> out of {state.submission.test?.totalMarks || 0}.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={resetToLanding} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Back To Test Center</button>
                  <button onClick={() => navigate(`/profile/${user?._id}?tab=tests`)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Open Profile Tests</button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[28px] bg-emerald-50 p-5"><div className="text-sm text-emerald-800">Correct</div><div className="mt-2 text-4xl font-black text-slate-900">{state.submission.summary.correct}</div></div>
              <div className="rounded-[28px] bg-rose-50 p-5"><div className="text-sm text-rose-800">Incorrect</div><div className="mt-2 text-4xl font-black text-slate-900">{state.submission.summary.incorrect}</div></div>
              <div className="rounded-[28px] bg-slate-100 p-5"><div className="text-sm text-slate-700">Skipped</div><div className="mt-2 text-4xl font-black text-slate-900">{state.submission.summary.skipped}</div></div>
              <div className="rounded-[28px] bg-violet-50 p-5"><div className="text-sm text-violet-800">Review</div><div className="mt-2 text-4xl font-black text-slate-900">{state.submission.summary.review}</div></div>
            </div>

            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setState((previous) => ({ ...previous, resultFilter: filter.key }))}
                  className={`rounded-full px-4 py-3 text-sm font-bold transition ${
                    state.resultFilter === filter.key ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {state.submission.evaluatedAnswers.filter((answer) => matchesFilter(answer, state.resultFilter)).map((answer) => (
                <article key={String(answer.questionId)} className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-bold text-slate-900">Question {answer.questionNumber}</h2>
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">{answer.status}</span>
                  </div>
                  <p className="mt-4 text-lg leading-8 text-slate-900">{answer.prompt}</p>
                  <div className="mt-5 grid gap-3">
                    {answer.options.map((option) => {
                      const isSelected = answer.selectedOption === option.key;
                      const isCorrect = answer.correctOption === option.key;
                      return (
                        <div key={option.key} className={`rounded-3xl border px-4 py-4 ${isCorrect ? "border-emerald-200 bg-emerald-50" : isSelected ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                          <span className="font-bold text-slate-900">{option.key}. </span>
                          <span className="text-slate-700">{option.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-600">
                    <div>Your answer: <strong className="text-slate-900">{answer.selectedOption || "Not answered"}</strong></div>
                    <div>Correct option: <strong className="text-slate-900">{answer.correctOption}</strong></div>
                  </div>
                  <div className="mt-4 rounded-3xl bg-cyan-50 px-4 py-4 text-sm leading-7 text-cyan-900">{answer.explanation}</div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
