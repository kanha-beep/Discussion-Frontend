import React from "react";
import FriendsList from "../Components/FriendsList";
import NoChats from "../Components/NoChats";

export default function ChatOpen({
  chatOpen,
  activeUser,
  chatUsers,
  setActiveUser,
  setSideActiveUser,
  setSideChatOpen,
  socket,
  activeChatId,
}) {
  return (
    <div>
      {chatOpen && (
        <div className="mt-5">
          <ul
            className="list-group p-0 border rounded-4 border-dark bg-[#FFFFFF] fixed z-[9999] bottom-[3rem] w-[17.25rem] h-[40rem]"
            style={{ textAlign: "left"}}
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
            <div className="pb-0">
              <div className="input-group mb-2">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  className="form-control border-start-0"
                  placeholder="Search"
                />
                <button className="btn btn-light border-start-0 border-secondary-subtle">
                  <i className="bi bi-sliders"></i>
                </button>
              </div>
              <div className="row mx-auto align-item-center">
                <button className="col-6 bg-transparent border-0 border-bottom border-success text-center fw-bold">
                  Focused
                </button>
                <button className="col-6 pb-2 bg-transparent border-0 text-center fw-bold">
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
    </div>
  );
}
