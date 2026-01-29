// pc.js
export const createPeerConnection = (onTrack, onIce) => {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  pc.ontrack = onTrack;
  // pc.ontrack = (e) => {
  //       if (!remoteVideoRef.current.srcObject) {
  //         remoteVideoRef.current.srcObject = e.streams[0];
  //       }
  //     };
  pc.onicecandidate = (e) => {
    if (e.candidate) onIce(e.candidate);
  };

  // pc.onicecandidate = (e) => {
  //   if (e.candidate) {
  //     socket.emit("ice-candidate", {
  //       roomId: activeChatId,
  //       candidate: e.candidate,
  //     });
  //   }
  // };
  return pc;
};
