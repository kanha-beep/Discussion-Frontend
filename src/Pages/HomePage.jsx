import { useContext, useEffect, useState } from "react";
import { api, socket } from "../../api.js";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Loading } from "../Components/Loading.jsx";
import { MainPageHeading } from "../Pages/MainPageHeading.jsx";
import { Hand, TruckElectricIcon } from "lucide-react";
import HomePageLeft from "./HomePageLeft.jsx";
import HomePageMiddle from "./HomePageMiddle.jsx";
import HomePageRight from "./HomePageRight.jsx";
import { UserContext } from "../Components/UserContext.js";
import { useRef } from "react";
import { createPeerConnection } from "../Components/Pc.js";
export default function HomePage() {
  const {
    user,
    filterDiscussion,
    setFilterDiscussion,
    chatOpen,
    setChatOpen,
    mobileChatOpen,
    setMobileChatOpen,
    navigateFn,
  } = useContext(UserContext);

  // const [chatOpen, setChatOpen] = useState(false)
  const [sideChatOpen, setSideChatOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [chatMsg, setChatMsg] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isToken, setIsToken] = useState(true);
  const [chatUsers, setChatUsers] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messagesByChat, setMessagesByChat] = useState({});
  const [showHeroSection, setShowHeroSection] = useState(true);
  // const [allDiscussions, setAllDiscussions] = useState([]);
  // const [chatList, setChatList] = useState([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pcRef = useRef(null);
  const contentRef = useRef(null);
  const isExploringRef = useRef(false);
  // const rtcConfig = {
  //   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  // };
  //start call
  const startCall = async () => {
    setActiveUser(user);
    setShowVideo(true);
    // const res = await api.post(`/discussion/chat/${activeUser._id}`);
    // setActiveChatId(res.data.chatId);
    socket.emit("join-call", { roomId: activeChatId });
    await new Promise((r) => setTimeout(r, 0));
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    mediaStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      await localVideoRef.current.play();
    }
    const pc = createPeerConnection(
      
      (e) => {
        remoteStreamRef.current = e.streams[0];

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
        }
      },
      (candidate) => {
        socket.emit("ice-candidate", { roomId: activeChatId, candidate });
      },
    );
    pcRef.current = pc;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("call-user", {
      roomId: activeChatId,
      offer,
    });
  };
  //receive and answer
  useEffect(() => {
    socket.on("incoming-call", async ({ offer }) => {
      socket.emit("join-call", { roomId: activeChatId });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;
      const pc = new RTCPeerConnection(rtcConfig);
      pcRef.current = pc;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      pc.ontrack = (e) => {
        remoteVideoRef.current.srcObject = e.streams[0];
      };
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            roomId: activeChatId,
            candidate: e.candidate,
          });
        }
      };
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer-call", {
        roomId: activeChatId,
        answer,
      });
    });
    socket.on("call-answered", ({ answer }) => {
      pcRef.current?.setRemoteDescription(answer);
    });
    socket.on("ice-candidate", ({ candidate }) => {
      pcRef.current?.addIceCandidate(candidate);
    });
    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
    };
  }, [activeChatId]);
  //end call
  // const endCall = () => {
  //   if (pcRef.current) {
  //     pcRef.current.getSenders().forEach((sender) => {
  //       sender.track?.stop();
  //     });
  //   }
  //   pcRef.current?.close();
  //   pcRef.current = null;
  //   if (mediaStreamRef.current) {
  //     mediaStreamRef.current.getTracks().forEach((track) => track.stop());
  //     mediaStreamRef.current = null;
  //   }
  //   localVideoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
  //   localVideoRef.current.srcObject = null;
  //   remoteVideoRef.current.srcObject = null;

  //   socket.emit("leave-call", { roomId: activeChatId });
  //   setShowVideo(false);
  // };
  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((s) => s.track?.stop());
      pcRef.current.close();
      pcRef.current = null;
    }

    localVideoRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
    remoteVideoRef.current && (remoteVideoRef.current.srcObject = null);

    socket.emit("leave-call", { roomId: activeChatId });
    setShowVideo(false);
  };

  const getAllDiscussions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/discussion");
      setFilterDiscussion(res?.data?.discussions || []);
      console.log("all discussions: ", res?.data?.discussions);
      setIsToken(true);
    } catch (e) {
      if (e?.response?.status === 400) setIsToken(true);
      console.log(
        "error in getting all classes: ",
        e?.response?.data?.message,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllDiscussions();
  }, []);

  useEffect(() => {
    if (!location.state?.refresh) return;
    getAllDiscussions();
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);
  const handleDeleteDiscussion = async (i) => {
    try {
      console.log("delete: ", i);
      setLoading(TruckElectricIcon);
      const res = await api.delete(`/api/discussion/${i}`);
      // setTimeout(() => getAllDiscussions(), 1000);
      setFilterDiscussion((prev) => prev.filter((d) => d._id !== i));
      // setAllDiscussions((prev) => prev.filter((d) => d._id !== i));
      console.log("delete: ", res);
    } catch (e) {
      console.log("error while deleting: ", e?.response?.data);
      setErrorMsg("Please login First");
      setTimeout(() => navigate("/auth"), 3000);
    } finally {
      setLoading(false);
    }
  };
  const loadFriendships = async () => {
    if (!user?._id) {
      setChatUsers([]);
      setReceivedRequests([]);
      setSentRequests([]);
      return;
    }

    try {
      const res = await api.get("/api/discussion/friendships");
      setChatUsers(res?.data?.friends || []);
      setReceivedRequests(res?.data?.receivedRequests || []);
      setSentRequests(res?.data?.sentRequests || []);
    } catch (e) {
      console.log("error in getting friendships: ", e?.response?.data);
    }
  };

  useEffect(() => {
    if (!user?._id) return;
    loadFriendships();
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;
    socket.emit("register-user", { userId: user._id });
  }, [user?._id]);

  useEffect(() => {
    const handleFriendshipUpdate = () => {
      loadFriendships();
    };

    socket.on("friend-request:received", handleFriendshipUpdate);
    socket.on("friend-request:accepted", handleFriendshipUpdate);

    return () => {
      socket.off("friend-request:received", handleFriendshipUpdate);
      socket.off("friend-request:accepted", handleFriendshipUpdate);
    };
  }, [user?._id]);
  //get messages for active user, like open single chat
  useEffect(() => {
    if (!activeUser) return;
    const fetchMessages = async () => {
      try {
        const res = await api.post(`/api/discussion/chat/${activeUser._id}`);
        // console.log("get message for active user: ", res?.data);
        setActiveChatId(res.data.chatId);
        socket.emit("join-chat", res.data.chatId);
      } catch (e) {
        console.log("error in getting msg of one chat: ", e?.response?.data);
      }
    };

    fetchMessages();
  }, [activeUser]);
  // get all messages
  useEffect(() => {
    const getMessageHistory = async () => {
      if (!activeChatId) return;
      try {
        const res2 = await api.get(
          `/api/discussion/chat/${activeChatId}/messages`,
        );
        setMessagesByChat((prev) => ({
          ...prev,
          [activeChatId]: res2.data.messages,
        }));
      } catch (e) {
        console.log("error in getting message history: ", e?.response?.data);
      }
    };
    getMessageHistory();
  }, [activeChatId]);
  //get all chats of all users
  useEffect(() => {
    const getAllChats = async () => {
      try {
        const res = await api.get("/api/discussion/chats");
        // console.log("all chats: ", res?.data);
      } catch (e) {
        console.log("error in getting all chats: ", e?.response?.data);
      }
    };
    getAllChats();
  }, [activeUser]);

  //save message in state when received from socket
  useEffect(() => {
    const handleNewMessage = (msg) => {
      setMessagesByChat((prev) => ({
        ...prev,
        [msg.chatId]: [...(prev[msg.chatId] || []), msg],
      }));
    };

    socket.on("new-message", handleNewMessage);
    return () => socket.off("new-message", handleNewMessage);
  }, []);
  useEffect(() => {
    // console.log("messages by chat updated: ", messagesByChat);
  }, []);
  const handleSubmitChat = async () => {
    if (!activeUser || !chatMsg.trim()) return;
    try {
      const res = await api.post(
        `/api/discussion/chat/${activeChatId}/message`,
        {
          to: activeUser._id,
          message: chatMsg,
        },
      );
      // console.log("chat message sent: ", res?.data);
      setChatMsg("");
    } catch (e) {
      console.log("error in sending chat message: ", e?.response?.data);
    }
  };

  const handleSendFriendRequest = async (targetUserId) => {
    try {
      await api.post(`/api/discussion/friend-request/${targetUserId}`);
      await loadFriendships();
    } catch (e) {
      console.log("error in sending friend request: ", e?.response?.data);
    }
  };

  const handleAcceptFriendRequest = async (targetUserId) => {
    try {
      await api.post(`/api/discussion/friend-request/${targetUserId}/accept`);
      await loadFriendships();
    } catch (e) {
      console.log("error in accepting friend request: ", e?.response?.data);
    }
  };

  const handleRejectFriendRequest = async (targetUserId) => {
    try {
      await api.post(`/api/discussion/friend-request/${targetUserId}/reject`);
      await loadFriendships();
    } catch (e) {
      console.log("error in rejecting friend request: ", e?.response?.data);
    }
  };

  console.log("chats messages: ", messages);

  const activeMessages =
    activeChatId && Array.isArray(messagesByChat[activeChatId])
      ? messagesByChat[activeChatId]
      : [];

  useEffect(() => {
    console.log("JOINING CHAT WITH ID:", activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    const handleWindowScroll = () => {
      if (isExploringRef.current) return;

      if (!showHeroSection && window.scrollY <= 10) {
        setShowHeroSection(true);
      }
    };

    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [showHeroSection]);

  const handleExploreMore = () => {
    isExploringRef.current = true;
    setShowHeroSection(false);

    setTimeout(() => {
      contentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);

    setTimeout(() => {
      isExploringRef.current = false;
    }, 700);
  };

  if (loading) return <Loading loading={loading} />;
  console.log("active message: ", activeMessages);
  return (
    <>
      <MainPageHeading
        user={user}
        onExploreMore={handleExploreMore}
        isVisible={showHeroSection}
      />
      {/* main div which will have 3 dives */}
      <div
        ref={contentRef}
        className="p-0 overflow-x-hidden"
        style={{ minHeight: "90vh" }}
      >
        {isToken ? (
          <>
            <div className="row">
              {errorMsg !== "" && (
                <div
                  className=" alert alert-info col-3 mx-auto position-fixed top-0 start-50 translate-middle-x mt-3"
                  role="alert"
                  style={{ zIndex: 1050 }}
                >
                  {errorMsg}
                </div>
              )}
            </div>
            <div
              className="d-flex justify-content-center align-items-start gap-[20px]"
              style={{ height: "45vh" }}
            >
              {/* first div - left profile */}
              <HomePageLeft user={user} navigate={navigate} />
              {/* second div - all posts */}
              <HomePageMiddle
                socket={socket}
                navigate={navigate}
                loading={loading}
                handleDeleteDiscussion={handleDeleteDiscussion}
                filterDiscussion={filterDiscussion}
                setFilterDiscussion={setFilterDiscussion}
                startCall={startCall}
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
                showVideo={showVideo}
                endCall={endCall}
                // roomId={roomId}
                activeMessages={activeMessages}
                chatMsg={chatMsg}
                setChatMsg={setChatMsg}
                activeChatId={activeChatId}
                activeUser={activeUser}
              />
              {/* third div - right suggestions */}
              <HomePageRight
                chatOpen={chatOpen}
                activeUser={activeUser}
                chatUsers={chatUsers}
                receivedRequests={receivedRequests}
                sentRequests={sentRequests}
                setActiveUser={setActiveUser}
                activeMessages={activeMessages}
                user={user}
                chatMsg={chatMsg}
                setChatMsg={setChatMsg}
                handleSubmitChat={handleSubmitChat}
                setChatOpen={setChatOpen}
                sideChatOpen={sideChatOpen}
                setSideChatOpen={setSideChatOpen}
                onSendFriendRequest={handleSendFriendRequest}
                onAcceptFriendRequest={handleAcceptFriendRequest}
                onRejectFriendRequest={handleRejectFriendRequest}
              />
            </div>
          </>
        ) : (
          "Please Log In"
        )}
        {false && mobileChatOpen && (
          <div className="mobile-chat d-lg-none">
            {/* HEADER */}
            <div className="mobile-chat-header">
              <button onClick={() => setMobileChatOpen(false)}>←</button>
              <strong>Messages</strong>
            </div>

            {/* CHAT LIST / CHAT WINDOW */}
            <div className="mobile-chat-body">
              {!activeUser &&
                chatUsers.map((u) => (
                  <div
                    key={u._id}
                    className="chat-user"
                    onClick={() => setActiveUser(u)}
                  >
                    {u.email.split("@")[0]}
                  </div>
                ))}

              {activeUser && (
                <>
                  <div className="chat-messages">
                    <button onClick={() => setActiveUser(null)}>Back</button>
                    {activeMessages.map((m) => (
                      <div key={m._id}>
                        <b>
                          {String(m.senderId._id) === String(user._id)
                            ? "You"
                            : m.senderId.email.split("@")[0]}
                        </b>{" "}
                        {m.text}
                      </div>
                    ))}
                  </div>

                  <div className="chat-input">
                    <input
                      value={chatMsg}
                      onChange={(e) => setChatMsg(e.target.value)}
                    />
                    <button onClick={handleSubmitChat}>Send</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {mobileChatOpen && (
          <div className="fixed inset-0 z-[10000] bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_55%,_#172554_100%)] d-lg-none">
            <div className="flex h-full flex-col text-white">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (activeUser) {
                        setActiveUser(null);
                        return;
                      }
                      setMobileChatOpen(false);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg"
                  >
                    <i className="bi bi-arrow-left"></i>
                  </button>
                  <div>
                    <div className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">
                      Messages
                    </div>
                    <div className="text-sm text-slate-200">
                      {activeUser
                        ? activeUser.email.split("@")[0]
                        : "Friends and conversations"}
                    </div>
                  </div>
                </div>
                {!activeUser && (
                  <button
                    onClick={() => setMobileChatOpen(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100"
                  >
                    Close
                  </button>
                )}
              </div>

              {!activeUser ? (
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="mb-4 rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                      Chat List
                    </div>
                    <div className="mt-2 text-sm text-slate-400">
                      Open a friend chat from your current connections.
                    </div>
                  </div>

                  <div className="space-y-3">
                    {chatUsers.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-5 text-sm text-slate-300">
                        No chat friends yet.
                      </div>
                    ) : (
                      chatUsers.map((u) => (
                        <button
                          key={u._id}
                          onClick={() => setActiveUser(u)}
                          className="flex w-full items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-left shadow-[0_14px_28px_rgba(0,0,0,0.15)] transition hover:bg-white/10"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-base font-semibold text-white">
                              {u.name ||
                                [u.firstName, u.lastName]
                                  .filter(Boolean)
                                  .join(" ") ||
                                u.email.split("@")[0]}
                            </div>
                            <div className="truncate text-sm text-slate-400">
                              {u.email}
                            </div>
                          </div>
                          <div className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-200">
                            Open
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="border-b border-white/10 px-4 py-3">
                    <div className="text-base font-semibold text-white">
                      {activeUser?.name ||
                        [activeUser?.firstName, activeUser?.lastName]
                          .filter(Boolean)
                          .join(" ") ||
                        activeUser?.email?.split("@")[0]}
                    </div>
                    <div className="text-sm text-slate-400">
                      {activeUser?.email}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                    {activeMessages.length === 0 ? (
                      <div className="rounded-[24px] border border-dashed border-white/15 bg-white/5 p-5 text-sm text-slate-300">
                        No messages yet. Say hello to start the chat.
                      </div>
                    ) : (
                      activeMessages.map((m) => {
                        const isMine =
                          String(m.senderId._id) === String(user._id);

                        return (
                          <div
                            key={m._id}
                            className={`flex ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[84%] rounded-[22px] px-4 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.16)] ${
                                isMine
                                  ? "bg-cyan-400 text-slate-950"
                                  : "border border-white/10 bg-white/10 text-white backdrop-blur-xl"
                              }`}
                            >
                              <div
                                className={`mb-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                                  isMine ? "text-slate-800/70" : "text-cyan-200"
                                }`}
                              >
                                {isMine ? "You" : m.senderId.email.split("@")[0]}
                              </div>
                              <div className="text-sm leading-6">{m.text}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="border-t border-white/10 bg-slate-950/30 px-4 py-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <input
                        value={chatMsg}
                        onChange={(e) => setChatMsg(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSubmitChat();
                          }
                        }}
                        placeholder="Type your message..."
                        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-cyan-300 focus:bg-white/15"
                      />
                      <button
                        onClick={handleSubmitChat}
                        className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
