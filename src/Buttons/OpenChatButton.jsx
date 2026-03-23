import React from "react";

export default function OpenChatButton({ setChatOpen, setSideChatOpen }) {
  return (
    <div className="overflow-hidden">
      <div
        className="fixed bottom-4 right-4 z-[9999] w-[min(24rem,calc(100vw-2rem))]"
        style={{
          textAlign: "center",
        }}
      >
        <button
          className="w-full rounded-[18px] bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
          onClick={() => {
            setChatOpen((p) => !p);
            // setSideChatOpen((p) => !p);
          }}
        >
          Open Chats
        </button>
      </div>
    </div>
  );
}
