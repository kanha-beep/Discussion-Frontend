import React from "react";
import ActiveMessages from "./ActiveMessages.jsx";
import SendMessageButton from "../Buttons/SendMessageButton";

export default function SideChats({
  sideActiveUser,
  sideChatOpen,
  activeMessages,
  user,
  chatMsg,
  setChatMsg,
  handleSubmitChat,
  chatOpen,
}) {
  console.log("get messages: ", activeMessages);
  return (
    <div className="relative">
      {sideActiveUser && chatOpen && sideChatOpen && (
        <div
          className="fixed bottom-14 right-4 z-[9999] flex h-[36rem] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] md:right-[26rem]"
        >
          <div className="min-h-0 flex-1 overflow-hidden">
            <ActiveMessages
              activeMessages={activeMessages}
              user={user}
              sideActiveUser={sideActiveUser}
            />
          </div>
          <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
            <input
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmitChat();
                }
              }}
              placeholder="Type a message..."
            />
            <SendMessageButton handleSubmitChat={handleSubmitChat} />
          </div>
        </div>
      )}
    </div>
  );
}
