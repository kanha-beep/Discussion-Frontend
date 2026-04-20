import React, { useContext, useState } from "react";
import { api } from "../../api";
import OpenCurrentChatButton from "../Buttons/OpenCurrentChatButton";
import OpenChatButton from "../Buttons/OpenChatButton";
import Advertisement from "../Components/Advertisement";
import SideChats from "../Components/SideChats";
import ChatOpen from "./ChatOpen.jsx";
import { UserContext } from "../Components/UserContext.js";
import ChatBotButton from "../Buttons/ChatBotButton.jsx";
import OpenChatbotButton from "../Buttons/OpenChatbotButton.jsx";
import TestHubWidget from "../Components/TestHubWidget.jsx";
export default function HomePageRight({
  chatOpen,
  activeUser,
  chatUsers,
  receivedRequests,
  sentRequests,
  setActiveUser,
  activeMessages,
  user,
  chatMsg,
  setChatMsg,
  handleSubmitChat,
  setChatOpen,
  sideChatOpen,
  setSideChatOpen,
  onSendFriendRequest,
  onAcceptFriendRequest,
  onRejectFriendRequest,
}) {
  const { chatbotOpen, setChatbotOpen, chatbotMessages, setChatbotMessages } =
    useContext(UserContext);
  const [sideActiveUser, setSideActiveUser] = useState(null);
  const [chatbotInput, setChatbotInput] = useState("");

  const handleChatbotSend = async () => {
    if (!chatbotInput.trim()) return;

    const userMessage = chatbotInput;
    setChatbotMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);
    setChatbotInput("");

    try {
      const res = await api.post("/api/discussion/chatbot", {
        message: userMessage,
      });
      setChatbotMessages((prev) => [
        ...prev,
        { role: "bot", text: res?.data?.reply || "No response received." },
      ]);
    } catch (e) {
      setChatbotMessages((prev) => [
        ...prev,
        { role: "bot", text: "Something went wrong. Please try again." },
      ]);
    }
  };

  return (
    <div>
      {/* <div className="right-side d-none d-lg-block lg:bg-green-100 lg:w-[15rem] md:bg-green-500 md:w-[15rem]"> */}
      <div className="right-side self-start w-full d-none d-lg-block bg-white sm:w-full md:w-[14rem] md:mr-[2rem] md:bg-green-500 lg:w-[22rem] lg:mr-[4rem] lg:bg-green-100">
        {/* advt */}
        <Advertisement />
        <TestHubWidget />
        <ChatOpen
          chatOpen={chatOpen}
          activeUser={activeUser}
          chatUsers={chatUsers}
          receivedRequests={receivedRequests}
          sentRequests={sentRequests}
          setActiveUser={setActiveUser}
          setSideActiveUser={setSideActiveUser}
          setSideChatOpen={setSideChatOpen}
          onSendFriendRequest={onSendFriendRequest}
          onAcceptFriendRequest={onAcceptFriendRequest}
          onRejectFriendRequest={onRejectFriendRequest}
        />
        {chatbotOpen && (
          <>
            <div
              className="border position-fixed bg-white rounded-top-4 rounded-bottom-0 p-2 bottom-[2.5rem] right-[20.75rem] w-[15.5rem] border-dark z-[9999]"
              style={{ height: "30rem", overflowY: "auto" }}
            >
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <div className="fw-bold">
                  <i className="bi bi-robot me-2"></i>
                  Chatbot
                </div>
                <button
                  className="btn btn-sm btn-light"
                  onClick={() => setChatbotOpen(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="d-flex flex-column gap-2">
                {chatbotMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`p-2 rounded-3 ${
                      message.role === "user"
                        ? "align-self-end bg-primary text-white"
                        : "align-self-start bg-light text-dark"
                    }`}
                    style={{ maxWidth: "85%", whiteSpace: "pre-wrap" }}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
            </div>
            <ChatBotButton
              chatbotInput={chatbotInput}
              setChatbotInput={setChatbotInput}
              handleChatbotSend={handleChatbotSend}
            />
          </>
        )}
        {/* open chats button */}
        <OpenChatButton
          setChatOpen={setChatOpen}
          setSideChatOpen={setSideChatOpen}
        />
        <div
          className="dropup fixed bottom-0 w-[15.5rem] right-[20.75rem]"
          style={{
            textAlign: "center",
            zIndex: 9999,
          }}
        >
          <OpenChatbotButton setChatbotOpen={setChatbotOpen} />
        </div>
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
