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
          className="dropup fixed bottom-0 w-[15.5rem] right-[20rem]"
          style={{
            textAlign: "center",
            zIndex: 9999,
          }}
        >
          <button
            className="btn btn-primary w-full dropdown-toggle"
            onClick={() => setSideChatOpen((p) => !p)}
          >
            Current Chat
          </button>
        </div>
      )}
    </div>
  );
}
