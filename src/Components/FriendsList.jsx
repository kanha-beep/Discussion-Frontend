import React from "react";
export default function FriendsList({
  users,
  mode = "friend",
  setActiveUser,
  setSideActiveUser,
  setSideChatOpen,
  onAcceptRequest,
  onRejectRequest,
  onSendRequest,
}) {
  const getDisplayName = (user) =>
    user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email?.split("@")[0] || "User";

  const renderAction = (user) => {
    if (mode === "search") {
      if (user.relationshipStatus === "friend") {
        return (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Friend
          </span>
        );
      }

      if (user.relationshipStatus === "sent") {
        return (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Request sent
          </span>
        );
      }

      if (user.relationshipStatus === "received") {
        return (
          <div className="flex gap-2">
            <button
              className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
              onClick={(e) => {
                e.stopPropagation();
                onAcceptRequest?.(user._id);
              }}
            >
              Accept
            </button>
          </div>
        );
      }

      return (
        <button
          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          onClick={(e) => {
            e.stopPropagation();
            onSendRequest?.(user._id);
          }}
        >
          Add Friend
        </button>
      );
    }

    if (mode === "received") {
      return (
        <div className="flex gap-2">
          <button
            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
            onClick={(e) => {
              e.stopPropagation();
              onAcceptRequest?.(user._id);
            }}
          >
            Accept
          </button>
          <button
            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
            onClick={(e) => {
              e.stopPropagation();
              onRejectRequest?.(user._id);
            }}
          >
            Reject
          </button>
        </div>
      );
    }

    if (mode === "sent") {
      return (
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Pending
        </span>
      );
    }

    return null;
  };

  return (
    <div className="space-y-2">
      {users.map((u) => (
          <div
            key={u._id}
            className={`flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition ${
              mode === "friend"
                ? "cursor-pointer hover:border-cyan-300 hover:bg-cyan-50/40"
                : "cursor-default"
            }`}
            onClick={() => {
              if (mode !== "friend") return;
              setActiveUser(u);
              setSideActiveUser(u);
              setSideChatOpen(true);
            }}
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-900">
                {getDisplayName(u)}
              </div>
              <div className="truncate text-xs text-slate-500">{u.email}</div>
            </div>
            {renderAction(u)}
          </div>
      ))}
    </div>
  );
}
