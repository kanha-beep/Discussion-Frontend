import React, { useState } from "react";
import SendMessageButton from "../Buttons/SendMessageButton";
import OpenCurrentChatButton from "../Buttons/OpenCurrentChatButton";
import ActiveMessages from "../Components/ActiveMessages";
import OpenChatButton from "../Buttons/OpenChatButton";
import Advertisement from "../Components/Advertisement";
import SideChats from "../Components/SideChats";
import ChatOpen from "./ChatOpen.jsx";
import BackButton from "../Buttons/BackButton";
export default function HomePageRight({
  chatOpen,
  activeUser,
  chatUsers,
  setActiveUser,
  socket,
  activeChatId,
  activeMessages,
  user,
  chatMsg,
  setChatMsg,
  handleSubmitChat,
  setChatOpen,
  sideChatOpen,
  setSideChatOpen,
}) {
  const [sideActiveUser, setSideActiveUser] = useState(null);
  return (
    <div className="">
      {/* <div className="right-side d-none d-lg-block lg:bg-green-100 lg:w-[15rem] md:bg-green-500 md:w-[15rem]"> */}
      <div className="right-side w-full d-none d-lg-block bg-white sm:w-full md:w-[14rem] md:mr-[2rem] md:bg-green-500 lg:w-[15rem] lg:mr-[4rem] lg:bg-green-100">
        {/* advt */}
        <Advertisement />
        <ChatOpen
          chatOpen={chatOpen}
          activeUser={activeUser}
          chatUsers={chatUsers}
          setActiveUser={setActiveUser}
          setSideActiveUser={setSideActiveUser}
          setSideChatOpen={setSideChatOpen}
          socket={socket}
          activeChatId={activeChatId}
        />
        {/* open chats button */}
        <OpenChatButton
          setChatOpen={setChatOpen}
          setSideChatOpen={setSideChatOpen}
        />
        <div>
          {/* side chat */}
          <SideChats
            sideActiveUser={sideActiveUser}
            sideChatOpen={sideChatOpen}
            activeMessages={activeMessages}
            user={user}
            chatMsg={chatMsg}
            setChatMsg={setChatMsg}
            handleSubmitChat={handleSubmitChat}
            chatOpen={chatOpen}
          />
          <OpenCurrentChatButton
            sideChatOpen={sideChatOpen}
            setSideChatOpen={setSideChatOpen}
            chatOpen={chatOpen}
          />
        </div>
      </div>
    </div>
  );
}
