import { useContext } from "react";
import { useRef, useState, useEffect } from "react";
import { SocketContext } from "../Components/SocketContext.js";
export default function Whiteboard({ roomId }) {
  const [tool, setTool] = useState("pen"); // pen | eraser
  const [color, setColor] = useState("black");
  const [size, setSize] = useState(2);
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const socket = useContext(SocketContext);
  const saveBoard = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `whiteboard-${roomId}.png`;
    link.href = canvas.toDataURL("image/png");

    link.click();
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit("join-room", { roomId });

    console.log("joined board room:", roomId);
  }, [socket, roomId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = size; //earlier 2
    ctx.strokeStyle = tool === "eraser" ? "white" : color;
    ctx.lineCap = "round";
    // ctx.strokeStyle = "black";
  }, []);
  console.log("scoket: ", socket);
  const startDraw = (e) => {
    if (!socket) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setDrawing(true);
    socket.emit("board-draw", {
      roomId,
      x,
      y,
      type: "start",
      sender: socket.id,
    });
  };
  const stopDraw = () => {
    socket.emit("board-draw", { roomId, type: "end", sender: socket.id });
    setDrawing(false);
  };

  useEffect(() => {
    if (!socket) return;
    const ctx = canvasRef.current.getContext("2d");
    socket.on("board-draw", ({ x, y, type, sender }) => {
      if (sender === socket.id) return;
      if (type === "start") {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (type === "draw") {
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (type === "end") {
        ctx.closePath();
      }
    });

    return () => socket.off("board-draw");
  }, [socket]);

  const draw = (e) => {
    if (!drawing) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = size;
    ctx.strokeStyle = tool === "eraser" ? "white" : color;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
    socket.emit("board-draw", {
      roomId,
      x,
      y,
      type: "draw", // "start" | "draw" | "end"
      sender: socket.id,
    });
  };
  return (
    <div className="flex flex-col">
      <div className="flex gap-2 justify-center my-2">
        <button onClick={() => setTool("pen")}>Pen</button>
        <button onClick={() => setTool("eraser")}>Eraser</button>

        <input type="color" onChange={(e) => setColor(e.target.value)} />

        <select onChange={(e) => setSize(Number(e.target.value))}>
          <option value="2">Thin</option>
          <option value="5">Medium</option>
          <option value="10">Thick</option>
        </select>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{ border: "1px solid black" }}
        onMouseDown={startDraw}
        onMouseUp={stopDraw}
        onMouseMove={draw}
        onMouseLeave={stopDraw}
      />
      <div className="flex justify-center">
        <button
          className="bg-black text-white rounded-2xl p-2"
          onClick={saveBoard}
        >
          Save Board
        </button>
      </div>
    </div>
  );
}
