import React from "react";

export default function OpenChatButton({ setChatOpen, setSideChatOpen }) {
  return (
    <div>
      {" "}
      <div
        className="dropup fixed bottom-[0] w-[23.5rem]"
        style={{
          textAlign: "center",
          zIndex: 9999,
        }}
      >
        <button
          className="btn btn-primary w-75 dropdown-toggle"
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
