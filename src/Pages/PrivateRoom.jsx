import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../../api";
import { createPeerConnection } from "../Components/Pc";
import { useContext } from "react";
import { UserContext } from "../Components/UserContext.js";
import WhiteBoard from "../Pages/WhiteBoard.jsx";
export default function PrivateRoom() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user } = useContext(UserContext);
  const localVideoRef = useRef(null);
  const peersRef = useRef({}); // socketId -> pc
  const localStreamRef = useRef(null);

  const [participants, setParticipants] = useState([]);
  const [chat, setChat] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState("video"); // video | chat
  const [participantCount, setParticipantCount] = useState(0);
  const [waitingUsers, setWaitingUsers] = useState([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    socket.on("room-message", (msg) => setChat((prev) => [...prev, msg]));
    return () => socket.off("room-message");
  }, []);

  const sendMsg = () => {
    if (!text.trim()) return;
    socket.emit("room-message", {
      roomId,
      text,
      sender: {
        id: user._id,
        name: user.email.split("@")[0],
      },
    });
    setText("");
  };

  useEffect(() => {
    if (!roomId || !socket) return;
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      // socket.emit("join-room", { roomId });
      socket.emit("join-room-request", { roomId });
    };
    init();
    // server tells host he is host
    socket.on("host", () => {
      setIsHost(true);
    });

    // server sends waiting list
    socket.on("waiting-users", (users) => {
      setWaitingUsers(users);
    });
    socket.on("admitted", () => {
      socket.emit("join-room", { roomId });
    });
    socket.on("rejected", () => {
      alert("Host rejected");
      navigate("/");
    });
    socket.on("kicked", () => {
      alert("You were kicked");
      navigate("/");
    });
    socket.on("user-joined", ({ socketId }) => {
      createPeer(socketId);
    });

    socket.on("room-offer", async ({ offer, from }) => {
      const pc = createPeer(from, true);
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("room-answer", { to: from, answer });
    });

    socket.on("room-answer", async ({ answer, from }) => {
      await peersRef.current[from]?.setRemoteDescription(answer);
    });

    socket.on("room-ice", ({ candidate, from }) => {
      peersRef.current[from]?.addIceCandidate(candidate);
    });

    socket.on("user-left", (id) => {
      peersRef.current[id]?.close();
      delete peersRef.current[id];
      setParticipants((prev) => prev.filter((s) => s.id !== id));
    });

    return () => {
      socket.off("admitted");
      socket.off("rejected");
      socket.off("kicked");
      socket.off("user-joined");
      socket.off("room-offer");
      socket.off("room-answer");
      socket.off("room-ice");
      socket.off("user-left");
      socket.off("host");
      socket.off("waiting-users");
      socket.emit("leave-room", { roomId });
      Object.values(peersRef.current).forEach((pc) => pc.close());
    };
  }, []);

  const createPeer = (remoteId, isAnswerer = false) => {
    const pc = createPeerConnection(
      (e) => attachRemoteStream(e.streams[0], remoteId),
      (candidate) => socket.emit("room-ice", { to: remoteId, candidate }),
    );

    peersRef.current[remoteId] = pc;

    localStreamRef.current
      .getTracks()
      .forEach((track) => pc.addTrack(track, localStreamRef.current));

    if (!isAnswerer) {
      pc.createOffer().then((offer) => {
        pc.setLocalDescription(offer);
        socket.emit("room-offer", { to: remoteId, offer });
      });
    }

    return pc;
  };

  // const attachRemoteStream = (stream) => {
  //   setParticipants((prev) =>
  //     prev.some((s) => s.id === stream.id) ? prev : [...prev, stream],
  //   );
  // };
  const attachRemoteStream = (stream, socketId) => {
    setParticipants((prev) =>
      prev.some((p) => p.socketId === socketId)
        ? prev
        : [...prev, { stream, socketId }],
    );
  };

  const toggleAudio = () => {
    localStreamRef.current
      .getAudioTracks()
      .forEach((t) => (t.enabled = !t.enabled));
  };

  const toggleVideo = () => {
    localStreamRef.current
      .getVideoTracks()
      .forEach((t) => (t.enabled = !t.enabled));
  };
  console.log("active tab: ", activeTab);
  const endCall = () => {
    // 1. Stop local media tracks (MOST IMPORTANT)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    // 2. Remove video element source
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    // 3. Close all peer connections properly
    Object.values(peersRef.current).forEach((pc) => {
      pc.getSenders()?.forEach((sender) => sender.track?.stop());
      pc.close();
    });

    // 4. Clear peer refs safely
    Object.keys(peersRef.current).forEach((k) => delete peersRef.current[k]);

    // 5. Inform others
    socket.emit("leave-room", { roomId });

    // 6. Reset UI
    setParticipants([]);
    setActiveTab("chat");

    // 7. Navigate AFTER cleanup
    navigate("/", { replace: true });
  };
  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  // useEffect(() => {
  //   let mediaRecorder;
  //   let chunks = [];

  //   navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
  //     mediaRecorder = new MediaRecorder(stream, {
  //       mimeType: "audio/webm;codecs=opus",
  //     });

  //     chunks = [];

  //     mediaRecorder.ondataavailable = (event) => {
  //       if (event.data.size > 0) {
  //         chunks.push(event.data);
  //       }
  //     };

  //     mediaRecorder.onstop = async () => {
  //       try {
  //         const blob = new Blob(chunks, { type: "audio/webm" });
  //       const arrayBuffer = await blob.arrayBuffer();

  //       const res = await fetch("http://localhost:3000/api/discussion/audio", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/octet-stream",
  //         },
  //         body: arrayBuffer,
  //       });

  //       const data = await res.json();
  //       console.log("Response from server:", data);

  //       setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
  //       } catch (error) {
  //         console.error("Error sending audio:", error);
  //       }

  //     };

  //     mediaRecorder.start();

  //     // Stop after 5 seconds
  //     setTimeout(() => {
  //       mediaRecorder.stop();
  //     }, 5000);
  //   });
  // }, []);
  useEffect(() => {
    let stream;
    let stopped = false;

    const recordOnce = () => {
      if (stopped) return;

      let chunks = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: "audio/webm" });

          const res = await fetch(
            "http://localhost:3000/api/discussion/audio",
            {
              method: "POST",
              headers: { "Content-Type": "application/octet-stream" },
              body: blob, // blob is fine; no need arrayBuffer
            },
          );

          const data = await res.json();
          console.log("Response from server:", data);

          setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
        } catch (e) {
          console.log("Upload/whisper error:", e);
        } finally {
          // ✅ Start next recording cycle after this one finishes
          if (!stopped) recordOnce();
        }
      };

      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorder.state === "recording") mediaRecorder.stop();
      }, 5000);
    };

    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordOnce(); // ✅ start first cycle
    })();

    return () => {
      stopped = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);
  return (
    <div className="" style={{ marginTop: "10rem" }}>
      <h1 className="mt-5">Private Room</h1>
      <div className="room-page">
        <div className="room-tabs">
          <button onClick={() => setActiveTab("video")}>Video</button>
          <button onClick={() => setActiveTab("chat")}>Chat</button>
          <button
            className="navbar-brand fw-bold text-white bg-dark"
            onClick={() => setActiveTab("board")}
            style={{ border: 0 }}
          >
            White Board
          </button>
        </div>

        <div
          className="room-page bg-success d-flex"
          style={{ display: activeTab === "video" ? "block" : "none" }}
        >
          <div>
            <video ref={localVideoRef} autoPlay muted />

            {participants.length === 0 && (
              <div className="empty-tile">Waiting for others…</div>
            )}

            {participants.map((s, i) => (
              <div key={s?.socketId}>
                <video
                  key={i}
                  autoPlay
                  ref={(v) => v && (v.srcObject = s?.stream)}
                />
                {isHost && (
                  <button
                    onClick={() =>
                      socket.emit("kick-user", {
                        roomId,
                        socketId: s.socketId,
                        // socketId: Object.keys(peersRef.current).find(
                        //   (id) =>
                        //     peersRef.current[id]?.getReceivers()?.[0]?.track
                        //       ?.id === s.id,
                        // ),

                        // socketId: peersRef.current[s.id],
                      })
                    }
                  >
                    Kick
                  </button>
                )}
              </div>
            ))}

            <button onClick={toggleAudio}>Mute</button>
            <button onClick={toggleVideo}>Camera</button>
            <button
              onClick={endCall}
              style={{ background: "red", color: "white" }}
            >
              End Call
            </button>
          </div>
          <div>
            {isHost && waitingUsers.length > 0 && (
              <div
                style={{ background: "#222", color: "white", padding: "10px" }}
              >
                <h3>Waiting Users</h3>

                {waitingUsers.map((u) => (
                  <div key={u.socketId} style={{ marginBottom: "5px" }}>
                    {u.name}

                    <button
                      onClick={() =>
                        socket.emit("admit-user", {
                          roomId,
                          socketId: u.socketId,
                        })
                      }
                    >
                      Admit
                    </button>

                    <button
                      onClick={() =>
                        socket.emit("reject-user", {
                          roomId,
                          socketId: u.socketId,
                        })
                      }
                    >
                      Reject
                    </button>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "chat" && (
              <div className="room-chat">
                <div className="chat-messages">
                  {chat.map((m, i) => (
                    <div key={i}>
                      <b>{m.sender?.name || "User"}:</b> {m.text}
                    </div>
                  ))}
                  <div className="notes">
                    {messages.map((m, i) => (
                      <div key={i}>
                        <b>{m.role === "user" ? "You" : "Bot"}:</b> {m.text}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="chat-input position-absolute bg-danger"
                  style={{ marginBottom: "2rem" }}
                >
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Message room…"
                  />
                  <button onClick={sendMsg}>Send</button>
                </div>
              </div>
            )}
          </div>
          {activeTab === "board" && <WhiteBoard roomId={roomId} />}
        </div>
      </div>
    </div>
  );
}
