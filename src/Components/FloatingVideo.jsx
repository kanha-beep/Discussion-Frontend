import { useEffect, useRef } from "react";
import Draggable from "react-draggable";

function FloatingVideo({ localVideoRef, remoteVideoRef, remoteStreamRef }) {
  const dragRef = useRef(null);
//   useEffect(() => {
//     if (remoteVideoRef.current && remoteStreamRef.current) {
//       remoteVideoRef.current.srcObject = remoteStreamRef.current;
//     }
//   }, []);
  return (
    <Draggable nodeRef={dragRef}>
      <div
        ref={dragRef}
        style={{
          position: "fixed",
          top: 120,
          left: 200,
          zIndex: 9999,
          cursor: "move",
        }}
      >
        <video ref={localVideoRef} autoPlay muted />
        <video ref={remoteVideoRef} autoPlay />
      </div>
    </Draggable>
  );
}
export default FloatingVideo;
