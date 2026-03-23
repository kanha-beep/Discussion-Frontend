import React, { useEffect, useState } from "react";
import FriendsList from "../Components/FriendsList";
import NoChats from "../Components/NoChats";
import { api } from "../../api";

export default function ChatOpen({
  chatOpen,
  activeUser,
  chatUsers,
  receivedRequests,
  sentRequests,
  setActiveUser,
  setSideActiveUser,
  setSideChatOpen,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRejectFriendRequest,
}) {
  const [view, setView] = useState("focused");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!chatOpen || view !== "other") return;

    const trimmed = search.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await api.get(
          `/api/discussion/users/search?q=${encodeURIComponent(trimmed)}`,
        );
        setSearchResults(res?.data?.users || []);
      } catch (e) {
        console.log("error in searching users: ", e?.response?.data);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [chatOpen, search, view]);

  return (
    <div>
      {chatOpen && (
        <div className="mt-5">
          <div
            className="fixed bottom-20 right-4 z-[9999] flex h-[40rem] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.18)]"
            style={{ textAlign: "left" }}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                  <i className="bi bi-chat-dots-fill"></i>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Messaging
                  </div>
                  <div className="text-xs text-slate-500">
                    Friends, requests, and search
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <i className="bi bi-three-dots-vertical"></i>
                <i className="bi bi-sliders"></i>
              </div>
            </div>
            {/* second div - search - focus - other */}
            <div className="border-b border-slate-200 px-4 py-4">
              <div className="mb-3 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-3">
                <span className="text-slate-400">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  className="w-full border-0 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (view !== "other") setView("other");
                  }}
                />
              </div>
              <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                <button
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    view === "focused"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                  onClick={() => setView("focused")}
                >
                  Focused
                </button>
                <button
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    view === "other"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500"
                  }`}
                  onClick={() => setView("other")}
                >
                  Other
                </button>
              </div>
            </div>
            <div className="h-[31.5rem] overflow-auto bg-slate-50 px-3 py-3">
              {view === "focused" ? (
                <>
                  {!!receivedRequests.length && (
                    <div className="mb-4">
                      <div className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Friend Requests
                      </div>
                      <FriendsList
                        users={receivedRequests}
                        mode="received"
                        setActiveUser={setActiveUser}
                        setSideActiveUser={setSideActiveUser}
                        setSideChatOpen={setSideChatOpen}
                        onAcceptRequest={onAcceptFriendRequest}
                        onRejectRequest={onRejectFriendRequest}
                      />
                    </div>
                  )}
                  {!!sentRequests.length && (
                    <div className="mb-4">
                      <div className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Sent Requests
                      </div>
                      <FriendsList
                        users={sentRequests}
                        mode="sent"
                        setActiveUser={setActiveUser}
                        setSideActiveUser={setSideActiveUser}
                        setSideChatOpen={setSideChatOpen}
                      />
                    </div>
                  )}
                  <div>
                    <div className="mb-2 px-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Friends
                    </div>
                    <FriendsList
                      users={chatUsers}
                      mode="friend"
                      setActiveUser={setActiveUser}
                      setSideActiveUser={setSideActiveUser}
                      setSideChatOpen={setSideChatOpen}
                    />
                    <NoChats
                      activeUser={activeUser}
                      chatUsers={chatUsers}
                      label="No friends added yet"
                    />
                  </div>
                </>
              ) : (
                <div>
                  {searchLoading && (
                    <div className="p-2 text-sm text-slate-500">
                      Searching users...
                    </div>
                  )}
                  {!searchLoading && (
                    <>
                      <FriendsList
                        users={searchResults}
                        mode="search"
                        setActiveUser={setActiveUser}
                        setSideActiveUser={setSideActiveUser}
                        setSideChatOpen={setSideChatOpen}
                        onSendRequest={onSendFriendRequest}
                        onAcceptRequest={onAcceptFriendRequest}
                      />
                      {!search.trim() && (
                        <div className="p-2 text-sm text-slate-500">
                          Search users by name, email, or profession.
                        </div>
                      )}
                      {!!search.trim() && searchResults.length === 0 && (
                        <div className="p-2 text-sm text-slate-500">
                          No users matched your search.
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            {/* <BackButton
                setActiveUser={setActiveUser}
                activeUser={activeUser}
                sideChatOpen={sideChatOpen}
              /> */}
          </div>
        </div>
      )}
    </div>
  );
}
