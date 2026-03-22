import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../../api";
import { createPeerConnection } from "../Components/Pc";
import { useContext } from "react";
import { UserContext } from "../Components/UserContext.js";
import WhiteBoard from "../Pages/WhiteBoard.jsx";
export default function PrivateRoom() {
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user, brief, setBrief } = useContext(UserContext);
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
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };
  useEffect(() => {
    const join = () => {
      // console.log("JOINING BOT ROOM:", roomId);
      socket.emit("join-room", { roomId, user: user?._id || "guest" });
      // console.log("BOT JOINED GUEST")
    };

    if (socket.connected) join(); // ✅ important
    socket.on("connect", join);
    // console.log("JOINED")
    return () => socket.off("connect", join);
  }, [roomId, user]);
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
    socket.on("room-message", (msg) => {
      speak(msg.text);
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
    function playNextAudio() {
      if (isPlaying || audioQueue.length === 0) return;

      const url = audioQueue.shift();
      const audio = new Audio(url);

      isPlaying = true;

      audio.onended = () => {
        isPlaying = false;
        playNextAudio();
      };

      audio.play().catch((e) => console.log(e));
    }
    let audioQueue = [];
    let isPlaying = false;
    socket.on("bot-voice", (data) => {
      console.log("1. Got bot voice: ", data?.audio_url);
      console.log("2. Got bot name: ", data?.bot);
      // console.log("3. Got bot text Summary: ", data?.text)
      if (!data.audio_url || data.audio_url.endsWith("/audio/")) return; // skip empty
      // const fullUrl = `http://127.0.0.1:8000${data.audio_url}`;
      audioQueue.push(data?.audio_url);
      if (!isPlaying) {
        playNextAudio(); // ✅ only start when idle
      }
      console.log("Media queue: ", audioQueue);
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
  // console.log("active tab: ", activeTab);
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
            `${import.meta.env.VITE_API_URL}/api/discussion/audio`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
                "x-room-id": roomId,
              },
              body: blob, // blob is fine; no need arrayBuffer
            },
          );

          const data = await res.json();
          // console.log("RAW DATA:", data);
          // console.log("audio_url:", data?.audio_url);
          // console.log("brief:", data?.brief);
          // console.log("bot:", data?.bot);
          if (data?.brief) {
            setBrief(data?.brief);
            // console.log("Response from server:", data?.brief);
            localStorage.setItem("brief", data.brief);
          }
          // console.log("audio starts");
          const audio = new Audio("http://127.0.0.1:8000" + data.audio_url);
          console.log("Playing audio from URL:", audio.src, data.audio_url);
          // audio.oncanplay = () => audio.play()
          document.addEventListener(
            "click",
            () => {
              audio.play();
            },
            { once: true },
          );

          setErrorMsg(data.msg || "");
          setMessages((prev) => {
            const filtered = prev.filter((msg) => msg.bot !== "bot.summary");
            return [...filtered, { bot: "bot.summary", text: data.reply }];
          });

          // setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
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
  const lastSummary = messages.findLast((m) => m.bot === "bot.summary")?.text;
  function downloadSummary(text) {
    if (!text) return;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    a.click();

    URL.revokeObjectURL(url);
  }
  return (
    <div className="mt-[5rem] min-h-screen">
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      {participants.length === 0 && (
        <div className="bg-light font-bold mb-2">Waiting for others…</div>
      )}
      <div className="room-page">
        <div className=" flex justify-around mb-1">
          <button
            className="btn btn-primary"
            onClick={() => setActiveTab("video")}
          >
            Video
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setActiveTab("chat")}
          >
            Chat
          </button>
          <button
            className="navbar-brand fw-bold btn btn-secondary text-white"
            onClick={() => setActiveTab("board")}
            style={{ border: 0 }}
          >
            White Board
          </button>
          <button
            className="btn btn-primary"
            onClick={() => downloadSummary(lastSummary)}
          >
            Download Summary
          </button>
        </div>

        <div
          className="room-page bg-light d-flex"
          style={{ display: activeTab === "video" ? "block" : "none" }}
        >
          <div>
            <video ref={localVideoRef} autoPlay muted />

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
            <div className="flex gap-5 items-center">
              <button onClick={toggleAudio}>
                <i className="bi bi-mic-mute"></i>
              </button>
              <button onClick={toggleVideo}>
                <i className="bi bi-camera"></i>
              </button>
              <button onClick={endCall} className="btn btn-danger h-[2.5rem]">
                <i className="bi bi-telephone-x-fill"></i>
              </button>
            </div>
          </div>
          {activeTab === "chat" && (
            <div className="room-chat">
              <div className="chat-messages">
                {chat.map((m, i) => (
                  <div key={i}>
                    <b>{m.sender?.name || "User"}:</b> {m.text}
                  </div>
                ))}
                <div className="notes" style={{ whiteSpace: "pre-wrap" }}>
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
          <div>
            {isHost && waitingUsers.length > 0 && (
              <div
                style={{ background: "#222", color: "white", padding: "10px" }}
              >
                <span className="bg-gray-300/20 p-2 inline italic">
                  Waiting
                </span>
                {waitingUsers.map((u) => (
                  <div key={u.socketId} className="mb-[5px] mt-1">
                    {u.name}

                    <button
                      onClick={() =>
                        socket.emit("admit-user", {
                          roomId,
                          socketId: u.socketId,
                        })
                      }
                    >
                      <span className="btn btn-success mt-1">Admit</span>
                    </button>

                    <button
                      onClick={() =>
                        socket.emit("reject-user", {
                          roomId,
                          socketId: u.socketId,
                        })
                      }
                    >
                      <span className="btn btn-danger ml-2 mt-1">Reject</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {activeTab === "board" && <WhiteBoard roomId={roomId} />}
        </div>
      </div>
    </div>
  );
}

// let currentAudio = null;

// socket.on("bot-voice", ({ audio_url }) => {
//   if (currentAudio) currentAudio.pause();

//   const audio = new Audio(audio_url);
//   currentAudio = audio;

//   audio.oncanplaythrough = () => {
//     audio.play().catch((e) => console.log(e));
//   };
// });
// socket.on("bot-voice", ({ audio_url }) => {
//   console.log("audio: ", audio_url);
//   let audio = new Audio(audio_url);
//   console.log("final audio received");
//   audio.oncanplaythrough = () => {
//     audio.play().catch((e) => console.log(e));
//   };
//   // audio.play().catch((e) => console.log("Autoplay blocked:", e));
// });
