import { useContext, useEffect, useState } from "react";
import { api, socket } from "../../api.js";
import { useNavigate, Link } from "react-router-dom";
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
    showMsg,
    navigateFn,
  } = useContext(UserContext);

  // const [chatOpen, setChatOpen] = useState(false)
  const [sideChatOpen, setSideChatOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  // const location = useLocation();
  const [chatMsg, setChatMsg] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isToken, setIsToken] = useState(true);
  const [chatUsers, setChatUsers] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messagesByChat, setMessagesByChat] = useState({});
  // const [allDiscussions, setAllDiscussions] = useState([]);
  // const [chatList, setChatList] = useState([]);
  console.log("active user: ", showMsg);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const pcRef = useRef(null);
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
    // const pc = new RTCPeerConnection(rtcConfig);
    // pcRef.current = pc;
    const pc = createPeerConnection(
      // (e) => {
      //   // if (!remoteVideoRef.current) return;

      //   if (remoteVideoRef.current.srcObject !== e.streams[0]) {
      //     remoteVideoRef.current.srcObject = e.streams[0];
      //   }
      // },
      (e) => {
        // remoteVideoRef.current = e.streams[0];
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

  //get discussion
  useEffect(() => {
    const getAllDiscussions = async () => {
      setLoading(true);
      try {
        const res = await api.get("/discussion");
        setFilterDiscussion(res?.data?.discussions || []);
        console.log("all discussions: ", res?.data?.discussions);
        setLoading(false);
        setIsToken(true);
      } catch (e) {
        if (e?.response?.status === 400) setIsToken(true);
        console.log(
          "error in getting all classes: ",
          e?.response?.data?.message,
        );
        setLoading(false);
      }
    };
    getAllDiscussions();
  }, []);
  const handleDeleteDiscussion = async (i) => {
    try {
      console.log("delete: ", i);
      setLoading(TruckElectricIcon);
      const res = await api.delete(`/discussion/${i}`);
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
  //all users of the platform
  useEffect(() => {
    const getAllUsers = async () => {
      try {
        const res = await api.get("/discussion/all-users");
        setChatUsers(res?.data);
        console.log("all users of the platform: ", res?.data);
      } catch (e) {
        console.log("error in getting all users: ", e?.response?.data);
      }
    };
    getAllUsers();
  }, []);
  //get messages for active user, like open single chat
  useEffect(() => {
    if (!activeUser) return;
    const fetchMessages = async () => {
      try {
        const res = await api.post(`/discussion/chat/${activeUser._id}`);
        console.log("get message for active user: ", res?.data);
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
        const res2 = await api.get(`/discussion/chat/${activeChatId}/messages`);
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
        const res = await api.get("/discussion/chats");
        console.log("all chats: ", res?.data);
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
    console.log("messages by chat updated: ", messagesByChat);
  }, []);
  const handleSubmitChat = async () => {
    if (!activeUser || !chatMsg.trim()) return;
    try {
      const res = await api.post(`/discussion/chat/${activeChatId}/message`, {
        to: activeUser._id,
        message: chatMsg,
      });
      console.log("chat message sent: ", res?.data);
      setChatMsg("");
    } catch (e) {
      console.log("error in sending chat message: ", e?.response?.data);
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
  if (loading) return <Loading loading={loading} />;
  console.log("active message: ", activeMessages);
  return (
    <>
      <MainPageHeading />
      {/* main div which will have 3 dives */}
      <div
        className="p-0 overflow-x-hidden"
        style={{ height: "90vh" }}
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
              className="d-flex justify-content-center gap-[20px]"
              style={{ height: "45vh" }}
            >
              {/* first div - left profile */}
              <HomePageLeft user={user} navigate={navigate} showMsg={showMsg} />
              {/* second div - all posts */}
              <HomePageMiddle
                navigate={navigate}
                loading={loading}
                handleDeleteDiscussion={handleDeleteDiscussion}
                filterDiscussion={filterDiscussion}
                startCall={startCall}
                localVideoRef={localVideoRef}
                remoteVideoRef={remoteVideoRef}
                showVideo={showVideo}
                endCall={endCall}
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
                setActiveUser={setActiveUser}
                socket={socket}
                activeChatId={activeChatId}
                activeMessages={activeMessages}
                user={user}
                chatMsg={chatMsg}
                setChatMsg={setChatMsg}
                handleSubmitChat={handleSubmitChat}
                setChatOpen={setChatOpen}
                sideChatOpen={sideChatOpen}
                setSideChatOpen={setSideChatOpen}
              />
            </div>
          </>
        ) : (
          "Please Log In"
        )}
        {mobileChatOpen && (
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
      </div>
    </>
  );
}
