import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, socket } from "../../api";
import { createPeerConnection } from "../Components/Pc";
import { UserContext } from "../Components/UserContext.js";
import WhiteBoard from "../Pages/WhiteBoard.jsx";
import RoomShareModal from "../Components/RoomShareModal.jsx";

const tabBaseClass =
  "rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200";

const getTabClass = (activeTab, tab) =>
  `${tabBaseClass} ${
    activeTab === tab
      ? "border-cyan-300 bg-cyan-300 text-slate-950"
      : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
  }`;

export default function PrivateRoom() {
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { user, brief, setBrief } = useContext(UserContext);
  const localVideoRef = useRef(null);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const recorderStreamRef = useRef(null);
  const userMicEnabledRef = useRef(true);
  const hasRequestedAdmissionRef = useRef(false);
  const hasJoinedSocketRoomRef = useRef(false);
  const hasExitedRoomRef = useRef(false);
  const isRoomClosingRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const voiceAnimationFrameRef = useRef(null);
  const chunkSpeechDetectedRef = useRef(false);
  const audioQueueRef = useRef([]);
  const isPlayingAudioRef = useRef(false);
  const pendingAudioRef = useRef(null);
  const pendingSpeechRef = useRef(null);
  const activePlaybackBotRef = useRef(null);
  const mutedBotsRef = useRef({
    "bot.moderator": false,
    "bot.assistant": false,
    all: false,
  });
  const botSpeakerTimeoutRef = useRef(null);
  const speechVoicesRef = useRef([]);
  const recordResumeAtRef = useRef(0);
  const mediaRecorderRef = useRef(null);
  const userInterruptingRef = useRef(false);
  const loudSpeechFramesRef = useRef(0);

  const getFallbackVoice = (botId) => {
    const availableVoices = speechVoicesRef.current || [];
    if (!availableVoices.length) return null;

    const preferredNames =
      botId === "bot.moderator"
        ? ["zira", "aria", "samantha", "female", "woman"]
        : ["david", "mark", "alex", "male", "man"];

    const matchedVoice = availableVoices.find((voice) =>
      preferredNames.some((term) => voice.name?.toLowerCase().includes(term)),
    );

    return matchedVoice || availableVoices[0] || null;
  };

  const speakBotFallback = (bot, message, onDone) => {
    if (!message || !window.speechSynthesis) return;
    const activeMuteState = mutedBotsRef.current || {};
    if (activeMuteState.all || activeMuteState[bot]) {
      onDone?.();
      return;
    }

    const spokenMessage = String(message)
      .replace(/^Krishna:\s*/i, "")
      .replace(/^Ram:\s*/i, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(spokenMessage || message);
    utterance.rate = bot === "bot.moderator" ? 0.88 : 1.0;
    utterance.pitch = bot === "bot.moderator" ? 0.82 : 1.08;
    utterance.volume = 1;
    const selectedVoice = getFallbackVoice(bot);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.onend = () => {
      pendingSpeechRef.current = null;
      activePlaybackBotRef.current = null;
      onDone?.();
    };
    utterance.onerror = () => {
      pendingSpeechRef.current = null;
      activePlaybackBotRef.current = null;
      onDone?.();
    };
    pendingSpeechRef.current = utterance;
    activePlaybackBotRef.current = bot;
    window.speechSynthesis.speak(utterance);
  };

  const [participants, setParticipants] = useState([]);
  const [chat, setChat] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [activeTab, setActiveTab] = useState("video");
  const [waitingUsers, setWaitingUsers] = useState([]);
  const [roomRefreshVersion, setRoomRefreshVersion] = useState(0);
  const [roomRefreshLoading, setRoomRefreshLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [activeBotSpeaker, setActiveBotSpeaker] = useState(null);
  const [roomMeta, setRoomMeta] = useState(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [transcriptSearchLoading, setTranscriptSearchLoading] = useState(false);
  const [transcriptSearchResult, setTranscriptSearchResult] = useState(null);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [botDispatchState, setBotDispatchState] = useState({
    active: false,
    text: "",
    startedAt: null,
  });
  const [botDispatchSeconds, setBotDispatchSeconds] = useState(0);
  const [mutedBots, setMutedBots] = useState({
    "bot.moderator": false,
    "bot.assistant": false,
    all: false,
  });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const chatbotBaseUrl =
    import.meta.env.VITE_CHATBOT_URL || "http://127.0.0.1:8000";
  const shareRoomUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/${roomId}`
      : "";
  const isShareHost =
    String(roomMeta?.host?._id || roomMeta?.host || "") === String(user?._id || "");
  const isRoomOwner =
    String(roomMeta?.host?._id || roomMeta?.host || "") === String(user?._id || "") ||
    String(roomMeta?.discussion?.owner?._id || roomMeta?.discussion?.owner || "") ===
      String(user?._id || "");

  useEffect(() => {
    if (!window.speechSynthesis) return;

    const syncVoices = () => {
      speechVoicesRef.current = window.speechSynthesis.getVoices() || [];
    };

    syncVoices();
    window.speechSynthesis.onvoiceschanged = syncVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const botCards = [
    {
      id: "bot.moderator",
      label: "Krishna",
      subtitle: "AI Co-host",
      accent: "from-cyan-400/30 via-sky-400/10 to-slate-950",
      ring: "ring-cyan-300/70 shadow-[0_0_35px_rgba(34,211,238,0.45)]",
      badge: "bg-cyan-400/15 text-cyan-100 border-cyan-300/30",
    },
    {
      id: "bot.assistant",
      label: "Ram",
      subtitle: "AI Co-host",
      accent: "from-emerald-400/30 via-teal-400/10 to-slate-950",
      ring: "ring-emerald-300/70 shadow-[0_0_35px_rgba(52,211,153,0.4)]",
      badge: "bg-emerald-400/15 text-emerald-100 border-emerald-300/30",
    },
  ];

  const activateBotSpeaker = (botId) => {
    if (!botId) return;
    setActiveBotSpeaker(botId);
    if (botSpeakerTimeoutRef.current) {
      window.clearTimeout(botSpeakerTimeoutRef.current);
    }
    botSpeakerTimeoutRef.current = window.setTimeout(() => {
      setActiveBotSpeaker(null);
    }, 3200);
  };

  const clearBotDispatchState = () => {
    setBotDispatchState({ active: false, text: "", startedAt: null });
    setBotDispatchSeconds(0);
  };

  const stopBotPlayback = ({ resumeDelayMs = 600 } = {}) => {
    pendingAudioRef.current?.pause?.();
    pendingAudioRef.current = null;
    pendingSpeechRef.current = null;
    audioQueueRef.current = [];
    isPlayingAudioRef.current = false;
    activePlaybackBotRef.current = null;
    setActiveBotSpeaker(null);
    loudSpeechFramesRef.current = 0;
    recordResumeAtRef.current = Date.now() + resumeDelayMs;
    window.speechSynthesis?.cancel();
  };

  const showBotDispatchState = (message) => {
    setBotDispatchState({
      active: true,
      text: message,
      startedAt: Date.now(),
    });
  };

  useEffect(() => {
    if (!botDispatchState.active || !botDispatchState.startedAt) {
      setBotDispatchSeconds(0);
      return;
    }

    const updateElapsed = () => {
      setBotDispatchSeconds(
        Math.max(
          0,
          Math.floor((Date.now() - botDispatchState.startedAt) / 1000),
        ),
      );
    };

    updateElapsed();
    const intervalId = window.setInterval(updateElapsed, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [botDispatchState.active, botDispatchState.startedAt]);

  const toggleBotMute = (botId) => {
    setMutedBots((prev) => {
      const next = {
        ...prev,
        [botId]: !prev[botId],
      };
      mutedBotsRef.current = next;

      if ((botId === "all" && next.all) || (next[botId] && activePlaybackBotRef.current === botId)) {
        pendingAudioRef.current?.pause?.();
        pendingAudioRef.current = null;
        pendingSpeechRef.current = null;
        window.speechSynthesis?.cancel();
        isPlayingAudioRef.current = false;
        activePlaybackBotRef.current = null;
        setActiveBotSpeaker(null);
        loudSpeechFramesRef.current = 0;
      }

      socket.emit("set-bot-mute", {
        botId,
        muted: next[botId],
      });

      return next;
    });
  };

  const areAllBotsMuted = mutedBots.all;

  const startVoiceMeter = (stream) => {
    if (!stream) return;

    if (voiceAnimationFrameRef.current) {
      cancelAnimationFrame(voiceAnimationFrameRef.current);
      voiceAnimationFrameRef.current = null;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      if (audioContextRef.current?.state === "closed") {
        audioContextRef.current = null;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.82;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 160) * 100));

        if (normalized > 10) {
          chunkSpeechDetectedRef.current = true;
        }

        const botIsTalking =
          isPlayingAudioRef.current ||
          !!activePlaybackBotRef.current ||
          audioQueueRef.current.length > 0;

        if (botIsTalking && normalized >= 28) {
          loudSpeechFramesRef.current += 1;
        } else {
          loudSpeechFramesRef.current = 0;
        }

        if (
          botIsTalking &&
          loudSpeechFramesRef.current >= 6 &&
          !userInterruptingRef.current
        ) {
          userInterruptingRef.current = true;
          loudSpeechFramesRef.current = 0;
          showBotDispatchState(
            `Listening to your interruption, ${
              user?.firstName || user?.email?.split("@")[0] || "User"
            }...`,
          );
          stopBotPlayback({ resumeDelayMs: 0 });

          if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
            return;
          }
        }

        setVoiceLevel(normalized);
        voiceAnimationFrameRef.current = requestAnimationFrame(tick);
      };

      tick();
    } catch (error) {
      console.log("error starting voice meter:", error);
    }
  };

  const stopVoiceMeter = () => {
    if (voiceAnimationFrameRef.current) {
      cancelAnimationFrame(voiceAnimationFrameRef.current);
      voiceAnimationFrameRef.current = null;
    }
    analyserRef.current = null;
    setVoiceLevel(0);
  };

  const resolveBotSpeaker = (payload) => {
    const directBot = payload?.bot;
    if (directBot === "bot.moderator" || directBot === "bot.assistant") {
      return directBot;
    }

    const senderName =
      payload?.sender?.name ||
      payload?.sender?.label ||
      payload?.sender ||
      "";
    const normalizedSender = String(senderName).toLowerCase();
    if (
      normalizedSender.includes("krishna") ||
      normalizedSender.includes("botmoderator")
    ) {
      return "bot.moderator";
    }
    if (
      normalizedSender.includes("ram") ||
      normalizedSender.includes("botassistant")
    ) {
      return "bot.assistant";
    }

    const textValue = String(payload?.text || "");
    if (textValue.startsWith("Krishna:")) return "bot.moderator";
    if (textValue.startsWith("Ram:")) return "bot.assistant";

    return null;
  };

  const getSenderName = (sender) => {
    if (!sender) return "User";
    if (sender.name) return sender.name;

    const fullName = [sender.firstName, sender.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return fullName || sender.email?.split("@")[0] || "User";
  };

  useEffect(() => {
    socket.on("room-message", (msg) => setChat((prev) => [...prev, msg]));
    return () => socket.off("room-message");
  }, []);

  const sendMsg = () => {
    if (!text.trim()) return;
    const messageText = text.trim();
    const senderName = user?.email?.split("@")[0] || "User";
    stopBotPlayback();
    socket.emit("room-message", {
      roomId,
      text: messageText,
      sender: {
        id: user._id,
        name: senderName,
      },
    });
    setText("");
    showBotDispatchState(`Sending your message to Krishna and Ram to discuss, ${senderName}...`);

    fetch(`${chatbotBaseUrl}/podcast/interrupt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_id: roomId,
        text: messageText,
        user_name: senderName,
        topic: roomMeta?.discussion?.keywords || [],
      }),
    })
      .catch((error) => {
        console.log("error sending text interruption to bots:", error);
        clearBotDispatchState();
      });
  };

  const loadRoomMeta = async () => {
    try {
      const res = await api.get(`/api/discussion/room/${roomId}`);
      setRoomMeta(res?.data || null);
    } catch (error) {
      console.log("error loading room meta:", error?.response?.data || error);
    }
  };

  const loadRoomMessages = async () => {
    try {
      const res = await api.get(`/api/discussion/room/${roomId}/messages`);
      setChat(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      if (error?.response?.status === 403) {
        setChat([]);
        return;
      }
      console.log("error loading room messages:", error?.response?.data || error);
    }
  };

  const ensurePodcastRunning = async (keywords = []) => {
    try {
      await fetch(`${chatbotBaseUrl}/podcast/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: roomId,
          topic: keywords,
        }),
      });
    } catch (error) {
      console.log("error ensuring podcast start:", error);
    }
  };

  const togglePrivateRoom = async () => {
    try {
      setPrivacyLoading(true);
      const res = await api.patch(`/api/discussion/room/${roomId}/privacy`);
      setRoomMeta(res?.data?.room || null);
    } catch (error) {
      console.log("error toggling room privacy:", error?.response?.data || error);
      alert(error?.response?.data?.msg || "Unable to update room privacy");
    } finally {
      setPrivacyLoading(false);
    }
  };

  const refreshPrivateRoomView = async () => {
    try {
      setRoomRefreshLoading(true);
      hasRequestedAdmissionRef.current = false;
      hasJoinedSocketRoomRef.current = false;
      setParticipants([]);
      setWaitingUsers([]);
      setActiveBotSpeaker(null);
      clearBotDispatchState();
      stopBotPlayback({ resumeDelayMs: 0 });
      await Promise.all([loadRoomMeta(), loadRoomMessages()]);
      setRoomRefreshVersion((prev) => prev + 1);
    } catch (error) {
      console.log("error refreshing private room view:", error);
    } finally {
      setRoomRefreshLoading(false);
    }
  };

  const searchDiscussionTranscript = async () => {
    const query = transcriptSearch.trim();
    if (!query || !roomMeta?.discussion?._id) return;

    try {
      setTranscriptSearchLoading(true);
      const res = await api.post(
        `/api/discussion/${roomMeta.discussion._id}/search-transcript`,
        { query },
      );
      setTranscriptSearchResult(res?.data || null);
    } catch (error) {
      console.log("error searching discussion transcript:", error?.response?.data || error);
      setTranscriptSearchResult({
        verified: false,
        message: error?.response?.data?.msg || "Could not search the discussion transcript right now.",
        matches: [],
      });
    } finally {
      setTranscriptSearchLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    loadRoomMeta();
    loadRoomMessages();
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !roomMeta?.discussion?.keywords?.length) return;
    ensurePodcastRunning(roomMeta.discussion.keywords);
  }, [roomId, roomMeta?.discussion?.keywords]);

  useEffect(() => {
    mutedBotsRef.current = mutedBots;
    Object.entries(mutedBots).forEach(([botId, muted]) => {
      socket.emit("set-bot-mute", { botId, muted });
    });
  }, [mutedBots]);

  useEffect(() => {
    if (!roomId || !socket || !user?._id) return;

    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;
      setIsMicMuted(!stream.getAudioTracks()[0]?.enabled);
      setIsCameraOff(!stream.getVideoTracks()[0]?.enabled);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      startVoiceMeter(stream);

      if (!hasRequestedAdmissionRef.current) {
        hasRequestedAdmissionRef.current = true;
        socket.emit("join-room-request", {
          roomId,
          userId: user._id,
        });
      }
    };

    init();

    socket.on("host", () => {
      setIsHost(true);
    });

    socket.on("waiting-users", (users) => {
      setWaitingUsers(users);
    });

    socket.on("admitted", () => {
      if (hasJoinedSocketRoomRef.current) return;
      hasJoinedSocketRoomRef.current = true;
      socket.emit("join-room", { roomId, user: user._id });
      window.setTimeout(() => {
        loadRoomMeta();
        loadRoomMessages();
      }, 350);
    });

    socket.on("rejected", () => {
      hasExitedRoomRef.current = true;
      alert("Host rejected");
      navigate("/");
    });

    socket.on("room-full", ({ message }) => {
      hasExitedRoomRef.current = true;
      alert(message || "Private room is full. Maximum 4 participants allowed.");
      navigate("/", { replace: true });
    });

    socket.on("kicked", () => {
      hasExitedRoomRef.current = true;
      alert("You were kicked");
      navigate("/");
    });

    socket.on("room-closed", (payload = {}) => {
      hasExitedRoomRef.current = true;
      isRoomClosingRef.current = true;
      window.speechSynthesis?.cancel();
      pendingAudioRef.current?.pause?.();
      pendingAudioRef.current = null;
      pendingSpeechRef.current = null;
      audioQueueRef.current = [];
      isPlayingAudioRef.current = false;

      localStreamRef.current?.getTracks()?.forEach((track) => track.stop());
      localStreamRef.current = null;

      Object.values(peersRef.current).forEach((pc) => pc.close());
      Object.keys(peersRef.current).forEach((key) => delete peersRef.current[key]);
      setParticipants([]);

      navigate(payload.feedbackPath || `/discussion/${payload.discussionId}/feedback`, {
        replace: true,
        state: {
          roomClosed: true,
          discussionId: payload.discussionId,
          roomId,
        },
      });
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
      setParticipants((prev) => prev.filter((s) => s.socketId !== id));
    });

    const playNextAudio = () => {
      if (isPlayingAudioRef.current || audioQueueRef.current.length === 0) return;

      const nextItem = audioQueueRef.current.shift();
      const url = nextItem?.audio_url;
      const bot = nextItem?.bot;
      const message = nextItem?.text;
      const activeMuteState = mutedBotsRef.current || {};
      recordResumeAtRef.current = Date.now() + 1200;

      if (!url) {
        isPlayingAudioRef.current = true;
        activePlaybackBotRef.current = bot;
        setActiveBotSpeaker(bot);
        speakBotFallback(bot, message, () => {
          isPlayingAudioRef.current = false;
          activePlaybackBotRef.current = null;
          setActiveBotSpeaker(null);
          playNextAudio();
        });
        return;
      }

      const audio = new Audio(url);
      if (activeMuteState.all || activeMuteState[bot]) {
        isPlayingAudioRef.current = false;
        pendingAudioRef.current = null;
        activePlaybackBotRef.current = null;
        recordResumeAtRef.current = Date.now() + 400;
        playNextAudio();
        return;
      }
      pendingAudioRef.current = audio;
      isPlayingAudioRef.current = true;
      activePlaybackBotRef.current = bot;
      setActiveBotSpeaker(bot);

      audio.onended = () => {
        isPlayingAudioRef.current = false;
        pendingAudioRef.current = null;
        activePlaybackBotRef.current = null;
        setActiveBotSpeaker(null);
        recordResumeAtRef.current = Date.now() + 400;
        playNextAudio();
      };

      audio.onerror = (event) => {
        console.log("bot audio failed to load:", url, event);
        pendingAudioRef.current = null;
        activePlaybackBotRef.current = null;
        setActiveBotSpeaker(null);
        speakBotFallback(bot, message, () => {
          isPlayingAudioRef.current = false;
          activePlaybackBotRef.current = null;
          setActiveBotSpeaker(null);
          playNextAudio();
        });
      };

      audio.play().catch((error) => {
        console.log("bot audio autoplay blocked:", error);
        pendingAudioRef.current = null;
        activePlaybackBotRef.current = null;
        setActiveBotSpeaker(null);
        speakBotFallback(bot, message, () => {
          isPlayingAudioRef.current = false;
          activePlaybackBotRef.current = null;
          setActiveBotSpeaker(null);
          playNextAudio();
        });
      });
    };

    const unlockPendingAudio = () => {
      if (!pendingAudioRef.current) {
        playNextAudio();
        return;
      }

      pendingAudioRef.current.play().catch((error) => {
        console.log("bot audio resume failed:", error);
      });
    };

    socket.on("bot-voice", (data) => {
      if (data?.bot === "bot.summary") return;
      if (!data?.text && !data?.audio_url) return;
      clearBotDispatchState();
      audioQueueRef.current.push(data);
      if (!isPlayingAudioRef.current) {
        playNextAudio();
      }
    });

    window.addEventListener("click", unlockPendingAudio);
    window.addEventListener("keydown", unlockPendingAudio);

    return () => {
      socket.off("admitted");
      socket.off("rejected");
      socket.off("room-full");
      socket.off("kicked");
      socket.off("user-joined");
      socket.off("room-offer");
      socket.off("room-answer");
      socket.off("room-ice");
      socket.off("user-left");
      socket.off("host");
      socket.off("waiting-users");
      socket.off("bot-voice");
      socket.off("room-closed");
      if (botSpeakerTimeoutRef.current) {
        window.clearTimeout(botSpeakerTimeoutRef.current);
        botSpeakerTimeoutRef.current = null;
      }
      stopVoiceMeter();
      stopBotPlayback();
      window.removeEventListener("click", unlockPendingAudio);
      window.removeEventListener("keydown", unlockPendingAudio);
      if (!hasExitedRoomRef.current && hasJoinedSocketRoomRef.current) {
        socket.emit("leave-room", { roomId });
      }
      hasRequestedAdmissionRef.current = false;
      hasJoinedSocketRoomRef.current = false;
      Object.values(peersRef.current).forEach((pc) => pc.close());
    };
  }, [navigate, roomId, roomRefreshVersion, user?._id]);

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

  const applyMicEnabledState = (enabled) => {
    userMicEnabledRef.current = enabled;

    localStreamRef.current?.getAudioTracks()?.forEach((track) => {
      track.enabled = enabled;
    });

    recorderStreamRef.current?.getAudioTracks()?.forEach((track) => {
      track.enabled = enabled;
    });

    setIsMicMuted(!enabled);
  };

  const toggleAudio = () => {
    applyMicEnabledState(!userMicEnabledRef.current);
  };

  const toggleVideo = () => {
    localStreamRef.current
      ?.getVideoTracks()
      .forEach((t) => {
        t.enabled = !t.enabled;
        setIsCameraOff(!t.enabled);
      });
  };

  const endCall = () => {
    hasExitedRoomRef.current = true;
    isRoomClosingRef.current = true;
    stopBotPlayback();
    fetch(`${chatbotBaseUrl}/podcast/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_id: roomId }),
    }).catch((error) => {
      console.log("error stopping podcast:", error);
    });

    window.speechSynthesis?.cancel();
    pendingAudioRef.current?.pause?.();
    pendingAudioRef.current = null;
    pendingSpeechRef.current = null;
    audioQueueRef.current = [];
    isPlayingAudioRef.current = false;
    activePlaybackBotRef.current = null;
    clearBotDispatchState();
    stopVoiceMeter();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    if (recorderStreamRef.current) {
      recorderStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      recorderStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    Object.values(peersRef.current).forEach((pc) => {
      pc.getSenders()?.forEach((sender) => sender.track?.stop());
      pc.close();
    });

    Object.keys(peersRef.current).forEach((k) => delete peersRef.current[k]);

    socket.emit("leave-room", { roomId });
    hasJoinedSocketRoomRef.current = false;

    setParticipants([]);
    setActiveTab("chat");

    navigate("/", { replace: true });
  };

  const closeRoomForEveryone = async () => {
    try {
      isRoomClosingRef.current = true;
      const notes =
        brief ||
        lastSummary ||
        roomMeta?.discussion?.summary ||
        "Discussion notes are being prepared by the system.";

      await api.post(`/api/discussion/room/${roomId}/close`, {
        notes,
        imageUrls: [],
      });
    } catch (error) {
      isRoomClosingRef.current = false;
      console.log("error closing room:", error?.response?.data || error);
      alert(error?.response?.data?.msg || "Unable to close room right now.");
    }
  };

  useEffect(() => {
    return () => {
      isRoomClosingRef.current = true;
      stopVoiceMeter();
      audioContextRef.current?.close?.().catch?.(() => {});
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      recorderStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "video") return;

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play?.().catch(() => {});
    }
  }, [activeTab, participants.length]);

  useEffect(() => {
    let stream;
    let stopped = false;

    const recordOnce = () => {
      if (stopped) return;

      let chunks = [];
      chunkSpeechDetectedRef.current = false;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          if (mediaRecorderRef.current === mediaRecorder) {
            mediaRecorderRef.current = null;
          }

          if (stopped || isRoomClosingRef.current) {
            return;
          }

          const isUserInterrupting = userInterruptingRef.current;
          const shouldIgnoreChunk =
            !isUserInterrupting &&
            (isPlayingAudioRef.current ||
              !!activePlaybackBotRef.current ||
              Date.now() < recordResumeAtRef.current);

          if (shouldIgnoreChunk) {
            userInterruptingRef.current = false;
            clearBotDispatchState();
            return;
          }

          if (!chunkSpeechDetectedRef.current) {
            userInterruptingRef.current = false;
            clearBotDispatchState();
            return;
          }

          showBotDispatchState(
            `Sending your message to Krishna and Ram to discuss, ${
              user?.firstName || user?.email?.split("@")[0] || "User"
            }...`,
          );

          stopBotPlayback();

          const blob = new Blob(chunks, { type: "audio/webm" });

          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/discussion/audio`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
                "x-room-id": roomId,
                "x-user-name":
                  user?.firstName || user?.email?.split("@")[0] || "User",
              },
              body: blob,
            },
          );

          const data = await res.json();

          if (data?.roomClosed || isRoomClosingRef.current) {
            clearBotDispatchState();
            return;
          }

          if (data?.brief) {
            setBrief(data.brief);
            localStorage.setItem("brief", data.brief);
          }

          setErrorMsg(data.msg || "");
        } catch (e) {
          console.log("Upload/whisper error:", e);
          userInterruptingRef.current = false;
          clearBotDispatchState();
        } finally {
          userInterruptingRef.current = false;
          if (!stopped && !isRoomClosingRef.current) recordOnce();
        }
      };

      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorder.state === "recording") mediaRecorder.stop();
      }, 5000);
    };

    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      recorderStreamRef.current = stream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = userMicEnabledRef.current;
      });
      recordOnce();
    })();

    return () => {
      stopped = true;
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (recorderStreamRef.current === stream) {
        recorderStreamRef.current = null;
      }
    };
  }, [roomId, setBrief, user?.email, user?.firstName]);

  const lastSummary = messages.findLast((m) => m.bot === "bot.summary")?.text;
  const voiceBars = Array.from({ length: 12 }, (_, index) => {
    const threshold = (index + 1) * 7;
    return voiceLevel >= threshold;
  });

  const waitingLabel =
    participants.length === 0 ? "Waiting for others..." : null;
  const roomMessages = chat.filter((m) => m?.text);
  const summaryItems = messages.filter((m) => m?.text);
  const transcriptSearchPanel = (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">
          Verify discussion
        </h2>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
          Live search
        </span>
      </div>

      <p className="mb-3 text-sm leading-6 text-slate-300">
        Check whether a line or idea was actually said during the current discussion, so anyone can verify context before reacting.
      </p>

      <div className="flex flex-col gap-3">
        <input
          className="min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white/10"
          value={transcriptSearch}
          onChange={(e) => setTranscriptSearch(e.target.value)}
          placeholder='Example: "Did anyone say AI should compare both sides?"'
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              searchDiscussionTranscript();
            }
          }}
        />
        <button
          onClick={searchDiscussionTranscript}
          disabled={transcriptSearchLoading || !transcriptSearch.trim()}
          className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {transcriptSearchLoading ? "Searching..." : "Verify now"}
        </button>
      </div>

      {transcriptSearchResult && (
        <div className="mt-4 space-y-3">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              transcriptSearchResult.verified
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                : "border-amber-400/20 bg-amber-400/10 text-amber-100"
            }`}
          >
            {transcriptSearchResult.message}
          </div>

          {Array.isArray(transcriptSearchResult.matches) &&
            transcriptSearchResult.matches.length > 0 && (
              <div className="space-y-2">
                {transcriptSearchResult.matches.slice(0, 4).map((match, index) => (
                  <div
                    key={`${match.senderName || "speaker"}-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                  >
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {match.senderName || "Participant"}
                    </div>
                    <div>{match.text}</div>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );

  const quickMessagePanel = (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">
          Message the bots
        </h2>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
          Text fallback
        </span>
      </div>

      <p className="mb-3 text-sm leading-6 text-slate-300">
        If your audio is not recognized, type here and Krishna and Ram will continue the discussion from your message.
      </p>

      <div className="flex flex-col gap-3">
        <textarea
          className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white/10"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type what you want the bots to respond to..."
        />
        <button
          onClick={sendMsg}
          disabled={!text.trim()}
          className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send to Krishna and Ram
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] px-4 pb-8 pt-24 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {errorMsg && (
          <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 shadow-lg shadow-rose-950/20">
            {errorMsg}
          </div>
        )}

        <section className="overflow-hidden rounded-[30px] border border-white/10 bg-slate-900/55 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="flex flex-col gap-5 border-b border-white/10 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80">
                Private Room
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Modern collaboration cockpit
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
                Video, chat, whiteboard, and live notes in one responsive room.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Room ID: {roomId}
                </span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                  {participants.length + 1} active
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {roomMeta?.isPrivate ? "Private room" : "Public room"}
                </span>
                {isHost && (
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-amber-200">
                    Host controls enabled
                  </span>
                )}
                {waitingLabel && (
                  <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-sky-100">
                    {waitingLabel}
                  </span>
                )}
                {botDispatchState.active && (
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-amber-100">
                    {botDispatchState.text}
                    {botDispatchSeconds > 0 ? ` (${botDispatchSeconds}s)` : ""}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className={getTabClass(activeTab, "video")}
                onClick={() => setActiveTab("video")}
              >
                Video
              </button>
              <button
                className={getTabClass(activeTab, "chat")}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
              <button
                className={getTabClass(activeTab, "board")}
                onClick={() => setActiveTab("board")}
              >
                Whiteboard
              </button>
              <button
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={refreshPrivateRoomView}
                disabled={roomRefreshLoading}
              >
                {roomRefreshLoading ? "Refreshing..." : "Refresh View"}
              </button>
              <button
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={togglePrivateRoom}
                disabled={!isRoomOwner || privacyLoading}
              >
                {privacyLoading
                  ? "Updating..."
                    : roomMeta?.isPrivate
                    ? "Make Public"
                    : "Make Private"}
              </button>
              {isShareHost && (
                <button
                  className="rounded-full border border-cyan-300/30 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/25"
                  onClick={() => setShareModalOpen(true)}
                >
                  Share room link
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              {activeTab === "video" && (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 xl:justify-items-start 2xl:grid-cols-4">
                    <div className="relative h-[5rem] w-full overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/80 sm:h-[14rem] xl:h-[10rem] xl:w-[10rem]">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="h-full w-full bg-slate-950 object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/95 to-transparent px-4 py-3">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            You
                          </div>
                          <div className="text-xs text-slate-300">
                            {voiceLevel > 8 ? "Speaking live" : "Local preview"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 items-end gap-1 rounded-full border border-cyan-400/20 bg-slate-950/65 px-2 py-1">
                            {voiceBars.map((isActive, index) => (
                              <span
                                key={index}
                                className={`w-1 rounded-full transition-all duration-100 ${
                                  isActive ? "bg-cyan-300" : "bg-white/20"
                                }`}
                                style={{ height: `${8 + index * 2}px` }}
                              />
                            ))}
                          </div>
                          <span className="rounded-full border border-emerald-400/15 bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-200">
                            {voiceLevel > 8 ? `${voiceLevel}%` : "Live"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {botCards.map((botCard) => {
                      const isSpeaking = activeBotSpeaker === botCard.id;
                      const isMuted = mutedBots.all || mutedBots[botCard.id];

                      return (
                        <div
                          key={botCard.id}
                          className={`relative h-[5rem] w-full overflow-hidden rounded-[24px] border bg-gradient-to-br ${botCard.accent} sm:h-[14rem] xl:h-[10rem] xl:w-[10rem] ${
                            isSpeaking
                              ? `ring-2 ${botCard.ring} border-white/30`
                              : "border-white/10"
                          }`}
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_45%)]" />
                          <div className="relative flex h-full flex-col justify-between p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-base font-semibold text-white">
                                  {botCard.label}
                                </div>
                                <div className="text-xs text-slate-300">
                                  {botCard.subtitle}
                                </div>
                              </div>
                              <span
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                  botCard.badge
                                }`}
                              >
                                {isMuted
                                  ? "Muted"
                                  : isSpeaking
                                    ? "Speaking"
                                    : "Listening"}
                              </span>
                            </div>

                            <div className="flex items-end justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-3 w-3 rounded-full ${
                                    isSpeaking
                                      ? "animate-pulse bg-white shadow-[0_0_18px_rgba(255,255,255,0.95)]"
                                      : "bg-white/40"
                                  }`}
                                />
                                <span className="text-xs font-medium text-slate-200">
                                  {isMuted
                                    ? "Audio muted here"
                                    : isSpeaking
                                      ? "Live response"
                                      : "Waiting for turn"}
                                </span>
                              </div>
                              <button
                                onClick={() => toggleBotMute(botCard.id)}
                                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                                  isMuted
                                    ? "border-rose-300/30 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30"
                                    : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                                }`}
                              >
                                {isMuted ? "Unmute" : "Mute"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {participants.map((participant, index) => (
                      <div
                        key={participant.socketId || index}
                        className="relative h-[20rem] w-full overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/80 sm:h-[12rem] xl:h-[10rem] xl:w-[10rem]"
                      >
                        <video
                          autoPlay
                          playsInline
                          className="h-[20rem] w-full bg-slate-950 object-cover"
                          ref={(videoNode) =>
                            videoNode && (videoNode.srcObject = participant.stream)
                          }
                        />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-slate-950/95 to-transparent px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-white">
                              Participant {index + 1}
                            </div>
                            <div className="text-xs text-slate-300">
                              {participant.socketId?.slice(0, 8)}
                            </div>
                          </div>
                          {isHost && (
                            <button
                              className="rounded-full border border-rose-400/20 bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/25"
                              onClick={() =>
                                socket.emit("kick-user", {
                                  roomId,
                                  socketId: participant.socketId,
                                })
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-white/10 bg-slate-950/40 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white">
                        Bot audio controls
                      </div>
                      <div className="text-xs text-slate-300">
                        Mute Krishna, Ram, or both together without stopping the discussion.
                      </div>
                    </div>
                    <button
                      onClick={() => toggleBotMute("all")}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        areAllBotsMuted
                          ? "border-rose-300/30 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30"
                          : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {areAllBotsMuted ? "Unmute Both Bots" : "Mute Both Bots"}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 rounded-[24px] border border-white/10 bg-slate-950/50 p-3">
                    <button
                      onClick={toggleAudio}
                      className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                        isMicMuted
                          ? "border-rose-400/20 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25"
                          : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                      }`}
                    >
                      <i
                        className={`bi ${
                          isMicMuted ? "bi-mic-mute-fill" : "bi-mic-fill"
                        }`}
                      ></i>
                      {isMicMuted ? "Muted" : "Mic On"}
                    </button>
                    <button
                      onClick={toggleVideo}
                      className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                        isCameraOff
                          ? "border-amber-400/20 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25"
                          : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                      }`}
                    >
                      <i
                        className={`bi ${
                          isCameraOff ? "bi-camera-video-off-fill" : "bi-camera-video-fill"
                        }`}
                      ></i>
                      {isCameraOff ? "Camera Off" : "Camera On"}
                    </button>
                    <button
                      onClick={endCall}
                      className="flex items-center gap-2 rounded-full bg-rose-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                    >
                      <i className="bi bi-telephone-x-fill"></i>
                      Leave room
                    </button>
                    {isRoomOwner && (
                      <button
                        onClick={closeRoomForEveryone}
                        className="flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/15 px-3.5 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/25"
                      >
                        <i className="bi bi-door-closed-fill"></i>
                        Close room
                      </button>
                    )}
                  </div>
                </>
              )}

              {activeTab === "chat" && (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
                  <div className="flex min-h-[68vh] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-white">
                    <div className="border-b border-slate-200 px-5 py-4">
                      <h2 className="text-lg font-semibold text-slate-900">
                        Room conversation
                      </h2>
                      <p className="text-sm text-slate-500">
                        Same chat flow as your friend messages, expanded for the full room.
                      </p>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4 sm:px-5">
                      {roomMessages.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                          No room messages yet.
                        </div>
                      ) : (
                        roomMessages.map((message, index) => {
                          const isMine =
                            String(message.sender?.id) === String(user?._id);

                          return (
                            <div
                              key={`${message.sender?.id || "user"}-${index}`}
                              className={`flex ${
                                isMine ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[82%] rounded-3xl px-4 py-3 shadow-sm ${
                                  isMine
                                    ? "bg-slate-900 text-white"
                                    : "border border-slate-200 bg-white text-slate-900"
                                }`}
                              >
                                <div
                                  className={`mb-1 text-xs font-semibold ${
                                  isMine ? "text-cyan-200" : "text-slate-500"
                                  }`}
                                >
                                  {isMine ? "You" : getSenderName(message.sender)}
                                </div>
                                <div className="text-sm leading-6">
                                  {message.text}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Message the room..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              sendMsg();
                            }
                          }}
                        />
                        <button
                          onClick={sendMsg}
                          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 overflow-y-auto rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                        AI Notes
                      </h3>
                      {lastSummary && (
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
                          Updated
                        </span>
                      )}
                    </div>
                    {summaryItems.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                        Summary and bot notes will appear here during the session.
                      </div>
                    ) : (
                      summaryItems.map((message, index) => (
                        <div
                          key={`${message.bot || "bot"}-${index}`}
                          className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-3"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
                            {message.bot || "Bot"}
                          </div>
                          <div className="text-sm text-slate-100">
                            {message.text}
                          </div>
                        </div>
                      ))
                    )}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                      The room notes stay beside chat so the conversation area can stay wide and message-focused.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "board" && (
                <div className="h-[18rem] overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/50 p-2 sm:h-[22rem] sm:p-4 xl:h-[20rem]">
                  <WhiteBoard roomId={roomId} />
                </div>
              )}
            </div>

            <aside className="space-y-4">
              {quickMessagePanel}

              {transcriptSearchPanel}

              <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white">
                    Room pulse
                  </h2>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                    {participants.length + 1} visible
                  </span>
                </div>

                <div className="space-y-3 text-sm text-slate-300">
                  <div className="rounded-2xl bg-white/5 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Host
                    </div>
                    <div className="mt-1 font-medium text-white">
                      {isHost
                        ? "You are managing this room"
                        : "Host is reviewing access"}
                      </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Privacy Control
                    </div>
                    <div className="mt-1 font-medium text-white">
                      {isRoomOwner
                        ? "You can change this room between public and private"
                        : "Only the room owner can change privacy"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Room Mode
                    </div>
                    <div className="mt-1 font-medium text-white">
                      {roomMeta?.isPrivate
                        ? "Private room enabled. User plus Krishna and Ram are always present first"
                        : "Public room enabled. The room starts with you, Krishna, and Ram"}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Summary
                    </div>
                    <div className="mt-1 text-slate-200">
                      {brief ||
                        lastSummary ||
                        "No summary yet. Keep talking and the room summary will show up here."}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white">
                    Waiting room
                  </h2>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                    {waitingUsers.length}
                  </span>
                </div>

                {isHost && waitingUsers.length > 0 ? (
                  <div className="space-y-3">
                    {waitingUsers.map((waitingUser) => (
                      <div
                        key={waitingUser.socketId}
                        className="rounded-2xl border border-white/10 bg-white/5 p-3"
                      >
                        <div className="text-sm font-semibold text-white">
                          {waitingUser.name}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="flex-1 rounded-xl bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                            onClick={() =>
                              socket.emit("admit-user", {
                                roomId,
                                socketId: waitingUser.socketId,
                              })
                            }
                          >
                            Admit
                          </button>
                          <button
                            className="flex-1 rounded-xl bg-rose-500/90 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                            onClick={() =>
                              socket.emit("reject-user", {
                                roomId,
                                socketId: waitingUser.socketId,
                              })
                            }
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                    {isHost
                      ? "No one is waiting right now."
                      : "Only the host can admit people into the room."}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      </div>
      <RoomShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareUrl={shareRoomUrl}
        title={`${roomMeta?.discussion?.keywords?.[0] || "Discussion"} video call`}
      />
    </div>
  );
}
