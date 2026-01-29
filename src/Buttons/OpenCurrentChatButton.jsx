import React from "react";

export default function OpenCurrentChatButton({sideChatOpen, setSideChatOpen, chatOpen}) {
  return (
    <div>
      {chatOpen && (
        <div
          className="dropup position-fixed bottom-[0] right-[20rem] w-[23rem]"
          style={{
            textAlign: "center",
            zIndex: 9999,
          }}
        >
          <button
            className="btn btn-primary w-75 dropdown-toggle"
            onClick={() => setSideChatOpen((p) => !p)}
          >
            Current Chat
          </button>
        </div>
      )}
    </div>
  );
}
