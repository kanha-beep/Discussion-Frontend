import React from "react";

export default function OpenCurrentChatButton({
  sideChatOpen,
  setSideChatOpen,
  chatOpen,
}) {
  return (
    <div>
      {chatOpen && (
        <div
          className="fixed bottom-4 right-4 z-[9999] w-[min(24rem,calc(100vw-2rem))] md:right-[26rem]"
          style={{
            textAlign: "center",
          }}
        >
          <button
            className="w-full rounded-[18px] bg-cyan-600 px-4 py-3 text-sm font-bold text-white shadow-[0_18px_40px_rgba(8,145,178,0.22)] transition hover:bg-cyan-500"
            onClick={() => setSideChatOpen((p) => !p)}
          >
            Current Chat
          </button>
        </div>
      )}
    </div>
  );
}
