import React from "react";

export default function OpenChatbotButton({ setChatbotOpen }) {
  return (
    <button
      className="btn btn-primary w-full dropdown-toggle"
      onClick={() => setChatbotOpen((prev) => !prev)}
    >
      <i class="bi bi-robot"></i> Chat
    </button>
  );
}
