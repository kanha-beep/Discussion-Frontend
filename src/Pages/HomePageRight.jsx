import React, { useState } from "react";
import SendMessageButton from "../Buttons/SendMessageButton";
import OpenCurrentChatButton from "../Buttons/OpenCurrentChatButton";
import ActiveMessages from "../Components/ActiveMessages";
import OpenChatButton from "../Buttons/OpenChatButton";
import BackButton from "../Buttons/BackButton";
import NoChats from "../Components/NoChats";
import FriendsList from "../Components/FriendsList";
import Advertisement from "../Components/Advertisement";
import SideChats from "../Components/SideChats";

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
    <div>
      <div className=" right-side d-none d-lg-block me-3">
        {/* advt */}
        <Advertisement />
        {chatOpen && (
          <div className="mt-5">
            <ul
              className="list-group p-0 border border-dark bg-white fixed z-[9999] bottom-[3rem] w-[17.25rem] right-[3.5rem] h-[40rem]"
              style={{ textAlign: "left" }}
            >
              {" "}
              <div className="p-2 border-bottom row">
                {/* photo and message */}
                <div className="col-7 d-flex">
                  <div className="border w-[1.5rem] rounded-circle">
                    <img alt="" />
                  </div>
                  <div className="ms-2 text-[1rem] fw-bold">Messaging</div>
                </div>
                {/* right options */}
                <div className="col-5 d-flex justify-content-end">
                  <i class="bi bi-three-dots-vertical"></i>
                  <i class="bi bi-chat-dots"></i>
                </div>
              </div>
              {/* second div - search - focus - other */}
              <div className="p-2 pb-0">
                <input className="form-control" />
                <div className="row border-bottom">
                  <button className="col-6 mt-2 mb-2 bg-transparent border-0 text-center fw-bold">
                    Focused
                  </button>
                  <button className="col-6 mt-2 mb-2 bg-transparent border-0 text-center fw-bold">
                    Other
                  </button>
                </div>
              </div>
              <FriendsList
                activeUser={activeUser}
                chatUsers={chatUsers}
                setActiveUser={setActiveUser}
                setSideActiveUser={setSideActiveUser}
                setSideChatOpen={setSideChatOpen}
                socket={socket}
                activeChatId={activeChatId}
              />
              <NoChats activeUser={activeUser} chatUsers={chatUsers} />
              {/* <BackButton
                setActiveUser={setActiveUser}
                activeUser={activeUser}
                sideChatOpen={sideChatOpen}
              /> */}
            </ul>
          </div>
        )}
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
