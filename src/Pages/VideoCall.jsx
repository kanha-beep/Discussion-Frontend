import React, { useContext, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { UserContext } from "../Components/UserContext.js";
import { SocketContext } from "../Components/SocketContext.js";
import { createPeerConnection } from "../Components/Pc.js";
export default function VideoCall() {
  const socket = useContext(SocketContext);
  const { user, navigateFn } = useContext(UserContext);
  const { activeUserId } = useParams();
  const { state } = useLocation();
  const cardId = state?.cardId;
  const roomId = [user?._id, activeUserId].sort().join("_");
  console.log(`active` + activeUserId + `state` + state + `roomId` + roomId);
  //   socket.emit("join-call", { roomId });
  const startCall = (roomId) => {
    socket.emit("join-call", {
      roomId,
      from: user._id,
      to: activeUserId,
      cardId,
    });
  };
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const pcRef = useRef(null);
  useEffect(() => {
    if (!user?._id || !activeUserId) return;
    startCall(roomId);
  }, [user?._id, activeUserId]);
  const initMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localRef.current && (localRef.current.srcObject = stream);
  };
  useEffect(() => {
    if (!user?._id) return;
    initMedia();
  }, [user?._id]);
  useEffect(() => {
    pcRef.current = createPeerConnection(
      (e) => {
        remoteRef.current.srcObject = e.streams[0];
      },
      (candidate) => {
        socket.emit("ice-candidate", { roomId, candidate });
      },
    );
  }, []);

  const endCall = () => {
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;

    localRef.current?.srcObject?.getTracks().forEach((t) => t.stop());
    remoteRef.current && (remoteRef.current.srcObject = null);

    socket.emit("leave-call", { roomId });
    navigateFn?.("/");
  };

  return (
    <div>
      <h3>Calling...</h3>
      <video ref={localRef} autoPlay muted playsInline style={{ width: 300 }} />
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        style={{ width: 300, height: 200, background: "black" }}
      />
      <video id="remote" autoPlay />
      <button onClick={endCall}>End Call</button>
    </div>
  );
}
