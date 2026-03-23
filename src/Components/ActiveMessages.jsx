import React from "react";

export default function ActiveMessages({
  activeMessages,
  user,
  sideActiveUser,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="text-sm font-semibold text-slate-900">
          {sideActiveUser?.name ||
            sideActiveUser?.email?.split("@")[0] ||
            "Conversation"}
        </div>
        <div className="text-xs text-slate-500">{sideActiveUser?.email}</div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
        {activeMessages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            No messages yet. Start the conversation.
          </div>
        )}
      {sideActiveUser &&
        activeMessages.map((m) => (
          <div
            key={m._id}
            className={`flex ${
              String(m.senderId._id) === String(user._id)
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[82%] rounded-3xl px-4 py-3 shadow-sm ${
                String(m.senderId._id) === String(user._id)
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-900"
              }`}
            >
              <div
                className={`mb-1 text-[11px] font-semibold uppercase tracking-wide ${
                  String(m.senderId._id) === String(user._id)
                    ? "text-cyan-200"
                    : "text-slate-500"
                }`}
              >
                {String(m.senderId._id) === String(user._id)
                  ? "You"
                  : m.senderId.email.split("@")[0]}
              </div>
              <div className="text-sm leading-6">{m.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
