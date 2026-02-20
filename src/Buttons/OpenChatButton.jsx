import React from "react";

export default function OpenChatButton({ setChatOpen, setSideChatOpen }) {
  return (
    <div className="overflow-hidden">
      {" "}
      <div
        className="dropup fixed bottom-0 w-[15.5rem] right-6"
        style={{
          textAlign: "center",
          zIndex: 9999,
        }}
      >
        <button
          className="btn btn-primary w-full dropdown-toggle"
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
