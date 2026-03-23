import React from "react";

export default function ChatBotButton({
  chatbotInput,
  setChatbotInput,
  handleChatbotSend,
}) {
  return (
    <div className="border-end border-start border-dark d-flex position-fixed bg-white rounded-2 p-2 bottom-[2rem] right-[20.75rem] w-[15.5rem] z-[9999]">
      <input
        className="form-control"
        placeholder="Ask chatbot..."
        value={chatbotInput}
        onChange={(e) => setChatbotInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleChatbotSend();
        }}
      />
      <button className="btn btn-primary ms-2" onClick={handleChatbotSend}>
        Send
      </button>
    </div>
  );
}
