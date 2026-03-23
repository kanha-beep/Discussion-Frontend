import React from "react";

export default function SendMessageButton({handleSubmitChat}) {
  return (
    <div>
      <button
        onClick={handleSubmitChat}
        className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Send
      </button>
    </div>
  );
}
