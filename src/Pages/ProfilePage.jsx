import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { UserContext } from "../Components/UserContext";
import { testApi } from "../Utils/testApi";

const formatMailTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

export default function ProfilePage() {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const initialSection = new URLSearchParams(location.search).get("tab") === "tests" ? "tests" : "mail";
  const [activeSection, setActiveSection] = useState(initialSection);
  const [activeTab, setActiveTab] = useState("inbox");
  const [mailbox, setMailbox] = useState({ inbox: [], sent: [] });
  const [selectedMail, setSelectedMail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [composeForm, setComposeForm] = useState({ toEmail: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [composeMode, setComposeMode] = useState("new");
  const [friendships, setFriendships] = useState({ friends: [], sentRequests: [], receivedRequests: [] });
  const [testDashboard, setTestDashboard] = useState({ tests: [], submissions: [] });
  const [testsLoading, setTestsLoading] = useState(true);

  useEffect(() => {
    const nextSection =
      new URLSearchParams(location.search).get("tab") === "tests" ? "tests" : "mail";
    setActiveSection(nextSection);
  }, [location.search]);

  const activeList = useMemo(
    () => (activeTab === "sent" ? mailbox.sent : mailbox.inbox),
    [activeTab, mailbox],
  );

  const loadMailbox = async () => {
    try {
      setLoading(true);
      const [mailRes, friendshipRes] = await Promise.all([
        api.get("/api/mail"),
        api.get("/api/discussion/friendships"),
      ]);
      const nextMailbox = {
        inbox: mailRes?.data?.inbox || [],
        sent: mailRes?.data?.sent || [],
      };
      setMailbox(nextMailbox);
      setFriendships({
        friends: friendshipRes?.data?.friends || [],
        sentRequests: friendshipRes?.data?.sentRequests || [],
        receivedRequests: friendshipRes?.data?.receivedRequests || [],
      });
      const nextActiveList = activeTab === "sent" ? nextMailbox.sent : nextMailbox.inbox;
      setSelectedMail(nextActiveList[0] || null);
    } catch (error) {
      console.log("error loading mailbox:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const loadTests = async () => {
    try {
      setTestsLoading(true);
      const [tests, submissions] = await Promise.all([
        testApi.getTests(),
        testApi.getSubmissions(
          [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
            user?.email?.split("@")[0] ||
            "",
        ),
      ]);
      setTestDashboard({ tests, submissions });
    } catch (error) {
      console.log("error loading tests:", error?.response?.data || error);
    } finally {
      setTestsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    loadMailbox();
    loadTests();
  }, [user?._id]);

  useEffect(() => {
    if (!activeList.length) {
      setSelectedMail(null);
      return;
    }
    if (!selectedMail || !activeList.some((mail) => mail._id === selectedMail._id)) {
      setSelectedMail(activeList[0]);
    }
  }, [activeList, selectedMail]);

  const switchSection = (section) => {
    setActiveSection(section);
    navigate(`/profile/${user?._id}${section === "tests" ? "?tab=tests" : ""}`);
  };

  const openMail = async (mail) => {
    setSelectedMail(mail);
    if (activeTab === "inbox" && !mail.readByRecipient) {
      try {
        await api.patch(`/api/mail/${mail._id}/read`);
        setMailbox((prev) => ({
          ...prev,
          inbox: prev.inbox.map((item) =>
            item._id === mail._id ? { ...item, readByRecipient: true } : item,
          ),
        }));
      } catch (error) {
        console.log("error marking mail as read:", error?.response?.data || error);
      }
    }
  };

  const handleComposeChange = (e) => {
    const { name, value } = e.target;
    setComposeForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCompose = (mode = "new") => {
    setComposeMode(mode);
    setActiveTab("compose");
    if (mode === "new") {
      setComposeForm({ toEmail: "", subject: "", body: "" });
    }
  };

  const handleReplyMail = () => {
    if (!selectedMail) return;
    setComposeMode("reply");
    setComposeForm({
      toEmail: selectedMail.senderEmail,
      subject: selectedMail.subject?.startsWith("Re:")
        ? selectedMail.subject
        : `Re: ${selectedMail.subject}`,
      body: `\n\n--- Original message ---\nFrom: ${selectedMail.senderEmail}\nSent: ${formatMailTime(
        selectedMail.createdAt,
      )}\n\n${selectedMail.body}`,
    });
    setActiveTab("compose");
  };

  const handleForwardMail = () => {
    if (!selectedMail) return;
    setComposeMode("forward");
    setComposeForm({
      toEmail: "",
      subject: selectedMail.subject?.startsWith("Fwd:")
        ? selectedMail.subject
        : `Fwd: ${selectedMail.subject}`,
      body: `\n\n--- Forwarded message ---\nFrom: ${selectedMail.senderEmail}\nTo: ${selectedMail.recipientEmail}\nSent: ${formatMailTime(
        selectedMail.createdAt,
      )}\n\n${selectedMail.body}`,
    });
    setActiveTab("compose");
  };

  const handleSendMail = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      const res = await api.post("/api/mail/send", composeForm);
      const sentMail = res?.data?.mail;
      setMailbox((prev) => ({
        ...prev,
        sent: sentMail ? [sentMail, ...prev.sent] : prev.sent,
      }));
      setComposeForm({ toEmail: "", subject: "", body: "" });
      setComposeMode("new");
      setActiveTab("sent");
      if (sentMail) setSelectedMail(sentMail);
    } catch (error) {
      alert(error?.response?.data?.msg || "Unable to send mail");
    } finally {
      setSending(false);
    }
  };

  const selectedContact = useMemo(() => {
    if (!selectedMail || !user?._id) return null;
    const isSender = String(selectedMail.sender?._id) === String(user._id);
    return isSender ? selectedMail.recipient : selectedMail.sender;
  }, [selectedMail, user?._id]);

  const selectedContactStatus = useMemo(() => {
    const contactId = String(selectedContact?._id || "");
    if (!contactId) return "none";
    if (friendships.friends.some((item) => String(item._id) === contactId)) return "friend";
    if (friendships.sentRequests.some((item) => String(item._id) === contactId)) return "sent";
    if (friendships.receivedRequests.some((item) => String(item._id) === contactId)) return "received";
    return "none";
  }, [friendships, selectedContact?._id]);

  const sendFriendRequestFromMail = async () => {
    if (!selectedContact?.email) return;
    try {
      await api.post(`/api/discussion/friend-request-by-email`, { email: selectedContact.email });
      await loadMailbox();
    } catch (error) {
      alert(error?.response?.data?.msg || error?.response?.data?.message || "Unable to send friend request");
    }
  };

  const acceptFriendRequestFromMail = async () => {
    if (!selectedContact?.email) return;
    try {
      await api.post(`/api/discussion/friend-request-by-email/accept`, { email: selectedContact.email });
      await loadMailbox();
    } catch (error) {
      alert(error?.response?.data?.msg || error?.response?.data?.message || "Unable to accept request");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 pb-10 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">Profile Center</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            {user?.firstName ? `${user.firstName}'s Workspace` : "Your Workspace"}
          </h1>
          <p className="mt-2 text-sm text-slate-200 sm:text-base">
            Manage platform mail and review your generated and attempted tests.
          </p>
          <div className="mt-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100">
            {user?.email || "No email available"}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <button
                onClick={() => switchSection("mail")}
                className={`mb-2 w-full rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  activeSection === "mail" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Mailbox
              </button>
              <button
                onClick={() => switchSection("tests")}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  activeSection === "tests" ? "bg-amber-500 text-slate-950" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Tests
              </button>

              {activeSection === "mail" && (
                <>
                  <button
                    onClick={() => openCompose("new")}
                    className="mt-4 w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-cyan-500"
                  >
                    Compose Mail
                  </button>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => setActiveTab("inbox")}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        activeTab === "inbox" ? "bg-cyan-50 text-cyan-800" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>Inbox</span>
                      <span>{mailbox.inbox.length}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("sent")}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        activeTab === "sent" ? "bg-cyan-50 text-cyan-800" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>Sent</span>
                      <span>{mailbox.sent.length}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Profile</div>
              <div className="mt-3 text-lg font-bold text-slate-900">
                {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email?.split("@")[0] || "User"}
              </div>
              <div className="mt-1 text-sm text-slate-500">{user?.profession || "Member"}</div>
            </div>
          </aside>

          <section className="rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">
            {activeSection === "tests" ? (
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Tests</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      View your generated papers and the tests you attempted.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate("/tests")}
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      Open Test Center
                    </button>
                    <button
                      onClick={loadTests}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Attempted Tests</h3>
                        <p className="mt-1 text-sm text-slate-500">Marks and attempt history.</p>
                      </div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                        {testDashboard.submissions.length}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {testsLoading ? (
                        <div className="text-sm text-slate-500">Loading attempts...</div>
                      ) : testDashboard.submissions.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                          No attempted tests yet.
                        </div>
                      ) : (
                        testDashboard.submissions.map((submission) => (
                          <div key={submission._id} className="rounded-3xl border border-slate-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-base font-bold text-slate-900">
                                  {submission.test?.title || "Saved Attempt"}
                                </div>
                                <div className="mt-1 text-sm text-slate-500">
                                  {submission.candidateName}
                                </div>
                                <div className="mt-2 text-xs text-slate-400">
                                  {formatMailTime(submission.submittedAt)}
                                </div>
                              </div>
                              <div className="rounded-2xl bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-800">
                                {submission.score}/{submission.test?.totalMarks || 0}
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                              <span className="rounded-full bg-slate-100 px-3 py-1">Correct {submission.summary.correct}</span>
                              <span className="rounded-full bg-slate-100 px-3 py-1">Incorrect {submission.summary.incorrect}</span>
                              <span className="rounded-full bg-slate-100 px-3 py-1">Skipped {submission.summary.skipped}</span>
                              <span className="rounded-full bg-slate-100 px-3 py-1">Review {submission.summary.review}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Generated Tests</h3>
                        <p className="mt-1 text-sm text-slate-500">Papers created from your prompts.</p>
                      </div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                        {testDashboard.tests.length}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {testsLoading ? (
                        <div className="text-sm text-slate-500">Loading tests...</div>
                      ) : testDashboard.tests.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                          No generated tests yet.
                        </div>
                      ) : (
                        testDashboard.tests.map((test) => (
                          <div key={test._id} className="rounded-3xl border border-slate-200 bg-white p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-base font-bold text-slate-900">{test.title}</div>
                                <div className="mt-1 text-sm text-slate-500">
                                  {test.totalQuestions} questions, {test.durationMinutes} min
                                </div>
                                {test.promptSource && (
                                  <div className="mt-2 text-xs text-slate-400">
                                    Prompt: {test.promptSource}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => navigate("/tests", { state: { autoStartTestId: test._id } })}
                                className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
                              >
                                Open
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === "compose" ? (
              <div className="p-6">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-slate-900">Compose</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {composeMode === "reply"
                      ? "Reply to the selected mail."
                      : composeMode === "forward"
                        ? "Forward the selected mail to another user."
                        : "Send mail to another user using their platform email."}
                  </p>
                </div>
                <form className="space-y-4" onSubmit={handleSendMail}>
                  <input
                    name="toEmail"
                    value={composeForm.toEmail}
                    onChange={handleComposeChange}
                    placeholder="To"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  />
                  <input
                    name="subject"
                    value={composeForm.subject}
                    onChange={handleComposeChange}
                    placeholder="Subject"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  />
                  <textarea
                    name="body"
                    value={composeForm.body}
                    onChange={handleComposeChange}
                    placeholder="Write your message..."
                    rows="12"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? "Sending..." : "Send Mail"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("inbox")}
                    className="ml-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid min-h-[70vh] lg:grid-cols-[360px_minmax(0,1fr)]">
                <div className="border-b border-slate-200 lg:border-b-0 lg:border-r">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{activeTab === "inbox" ? "Inbox" : "Sent Mail"}</h2>
                      <p className="text-sm text-slate-500">{activeTab === "inbox" ? "Your received messages" : "Mail you have sent"}</p>
                    </div>
                    <button
                      onClick={loadMailbox}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Refresh
                    </button>
                  </div>

                  <div className="max-h-[70vh] overflow-y-auto">
                    {loading ? (
                      <div className="p-5 text-sm text-slate-500">Loading mail...</div>
                    ) : activeList.length === 0 ? (
                      <div className="p-5 text-sm text-slate-500">No mail in this folder yet.</div>
                    ) : (
                      activeList.map((mail) => (
                        <button
                          key={mail._id}
                          onClick={() => openMail(mail)}
                          className={`w-full border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${
                            selectedMail?._id === mail._id ? "bg-slate-50" : "bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="truncate text-sm font-bold text-slate-900">
                              {activeTab === "inbox" ? mail.sender.name : mail.recipient.name}
                            </div>
                            <div className="text-[11px] font-semibold text-slate-400">
                              {formatMailTime(mail.createdAt)}
                            </div>
                          </div>
                          <div className="mt-1 truncate text-sm font-semibold text-slate-700">{mail.subject}</div>
                          <div className="mt-1 truncate text-xs text-slate-500">{mail.body}</div>
                          {activeTab === "inbox" && !mail.readByRecipient && (
                            <div className="mt-2 inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-700">
                              New
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {selectedMail ? (
                    <div>
                      <div className="border-b border-slate-200 pb-4">
                        <div className="text-2xl font-bold text-slate-900">{selectedMail.subject}</div>
                        <div className="mt-3 space-y-1 text-sm text-slate-500">
                          <div><span className="font-semibold text-slate-700">From:</span> {selectedMail.sender.email}</div>
                          <div><span className="font-semibold text-slate-700">To:</span> {selectedMail.recipient.email}</div>
                          <div><span className="font-semibold text-slate-700">Time:</span> {formatMailTime(selectedMail.createdAt)}</div>
                        </div>
                      </div>

                      <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700">{selectedMail.body}</div>
                      {selectedContact && (
                        <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Mail Contact</div>
                          <div className="mt-2 text-base font-bold text-slate-900">{selectedContact.name}</div>
                          <div className="mt-1 text-sm text-slate-500">{selectedContact.email}</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedContactStatus === "none" && (
                              <button onClick={sendFriendRequestFromMail} className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-500">
                                Send Friend Request
                              </button>
                            )}
                            {selectedContactStatus === "received" && (
                              <button onClick={acceptFriendRequestFromMail} className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500">
                                Accept Friend Request
                              </button>
                            )}
                            {selectedContactStatus === "sent" && (
                              <span className="rounded-2xl bg-amber-100 px-4 py-2.5 text-sm font-bold text-amber-700">Friend Request Sent</span>
                            )}
                            {selectedContactStatus === "friend" && (
                              <span className="rounded-2xl bg-emerald-100 px-4 py-2.5 text-sm font-bold text-emerald-700">Already in your chat list</span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button onClick={handleReplyMail} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Reply</button>
                        <button onClick={handleForwardMail} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Forward</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                      Select a mail to read it here.
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
