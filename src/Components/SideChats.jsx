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
        <>
          <div
            className="border position-fixed bg-[#FFFFFF] rounded-top-4 rounded-bottom-0 p-2 bottom-[2.5rem] right-[20rem] w-[15.5rem] border-dark"
            style={{ height: "30rem", overflowY: "auto" }}
          >
            <ActiveMessages
              activeMessages={activeMessages}
              user={user}
              sideActiveUser={sideActiveUser}
            />
          </div>
          {/* message box send */}
          <div className="border-end border-start border-dark d-flex position-fixed bg-white rounded-2 p-2 bottom-[2rem] right-[20rem] w-[15.5rem]">
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
