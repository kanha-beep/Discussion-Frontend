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
    <div>
      {sideActiveUser && chatOpen && sideChatOpen && (
        <>
          <div
            className="border position-fixed bg-white rounded-2 p-2 bottom-[1rem] right-[22.75rem] w-[17.5rem]"
            style={{ height: "30rem", overflowY: "auto" }}
          >
            <ActiveMessages
              activeMessages={activeMessages}
              user={user}
              sideActiveUser={sideActiveUser}
            />
          </div>
          {/* message box send */}
          <div className="border d-flex position-fixed bg-white rounded-2 p-2 bottom-[2rem] right-[22.75rem] w-[17.5rem]">
            <input
              className="form-control"
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
            />
            <SendMessageButton handleSubmitChat={handleSubmitChat} />
          </div>
        </>
      )}
    </div>
  );
}
