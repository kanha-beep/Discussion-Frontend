import React, { useContext, useEffect, useRef, useState } from "react";
import { api } from "../../api";
import Draggable from "react-draggable";
import FloatingVideo from "../Components/FloatingVideo";
import { UserContext } from "../Components/UserContext.js";
export default function HomePageMiddle({
  filterDiscussion,
  navigate,
  handleDeleteDiscussion,
  startCall,
  localVideoRef,
  remoteVideoRef,
  showVideo,
  loading,
  endCall,
  activeMessages,
  chatMsg,
  setChatMsg,
  activeChatId,
  activeUser,
  socket,
  setFilterDiscussion,
}) {
  const { user } = useContext(UserContext);
  const roomId = activeChatId;
  const [roomLoading, setRoomLoading] = useState(false);
  const getStatusClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "ongoing":
        return "bg-emerald-100 text-emerald-700";
      case "approved":
        return "bg-sky-100 text-sky-700";
      case "rejected":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };
  console.log("show video: ", showVideo);
  const dragRef = useRef(null);
  const [roomCounts, setRoomCounts] = useState({});
  // useEffect(() => {
  //   const id = setInterval(() => {
  //     console.log("1. Got brief:", brief);
  //   }, []);
  //   return () => clearInterval(id);
  // }, [brief]);
  const createRoom = async (roomId, existingRoomId) => {
    setRoomLoading(true);
    console.log("1. create room started: ", roomId, existingRoomId);
    if (existingRoomId) {
      navigate(`/room/${existingRoomId}`);
      return;
    }
    try {
      const res = await api.post(`/api/discussion/room/new`, {
        name: "Room",
        discussionId: roomId,
      });
      const newRoomId = res?.data?._id;
      const newRoom = res?.data;
      console.log("got room id: ", newRoomId);
      setFilterDiscussion((prev) =>
        prev.map((d) => (d._id === roomId ? { ...d, roomId: newRoom } : d)),
      );
      navigate(`/room/${newRoomId}`);
    } catch (e) {
      console.log("error in creating room: ", e?.response?.data);
      alert("room not created: ", e?.response?.data);
    } finally {
      setRoomLoading(false);
    }
  };
  console.log("roomCounts state:", roomCounts);

  useEffect(() => {
    if (!socket || !filterDiscussion?.length) return;

    // listen for count updates
    const handleRoomCount = (count, roomId) => {
      setRoomCounts((prev) => ({
        ...prev,
        [roomId]: count,
      }));
    };

    socket.on("room-users-count", handleRoomCount);

    // join each room once
    const joined = new Set();
    filterDiscussion.forEach((d) => {
      const id = d.roomId?._id;
      if (id && !joined.has(id)) {
        joined.add(id);
        // socket.emit("join-room", { roomId: String(id) });
        socket.emit("watch-room", { roomId: String(id) });
      }
    });

    return () => {
      socket.off("room-users-count", handleRoomCount);
    };
  }, [socket, filterDiscussion]);

  return (
    <div>
      {showVideo && (
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
      )}

      <div
        className="center w-full max-w-full overflow-x-hidden lg:w-[45rem]"
      >
        {/* <div className=" center  w-full  bg-white sm:w-full md:w-[31rem] lg:w-[35rem] lg:bg-green-100"> */}
        {filterDiscussion.map((d) => {
          const isOwner = d.owner === user?._id;
          const isAdmin = user?.roles === "admin";
          const primaryTopic = d?.keywords?.[0] || "Discussion";
          return (
            <div
              className="mx-2 my-4 rounded-[24px] border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.10)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(15,23,42,0.14)] sm:mx-4 sm:my-5 sm:p-5"
              key={d?._id}
            >
              {/* header */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-3">
                <img
                  src="data:image/jpeg;base64,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"
                  alt="demo"
                  className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 text-[22px] font-extrabold capitalize leading-tight text-slate-900">
                    {primaryTopic}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                      {d.keywords.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-start gap-2 sm:ml-auto sm:flex-col sm:items-end">
                  {d.roomId?.isPrivate ? (
                    <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                      Private Room
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                      Members {roomCounts[String(d.roomId?._id)] ?? 0}
                    </span>
                  )}
                  <span
                    className={`${getStatusClass(d?.status)} inline-flex items-center rounded-full px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] whitespace-nowrap`}
                  >
                    {d?.status || "Open"}
                  </span>
                </div>
              </div>

              {/* body */}
              <div className="pt-3">
                <div>
                  <div className="rounded-[20px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4">
                    <pre
                      className="m-0 whitespace-pre-wrap text-sm leading-6 text-slate-600"
                      style={{ margin: 0 }}
                    >
                      {d?.summary?.trim()
                        ? d.summary
                        : "No summary/brief available"}
                    </pre>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-700">
                    {d?.remarks}
                  </p>
                  {/* <div className="mt-4 flex flex-wrap gap-2">
                    {d.keywords.map((keyword, index) => (
                      <span
                        key={`${d?._id}-${keyword}-${index}`}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div> */}
                </div>
              </div>
              {/* footer */}
              <div className="mt-1 flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {new Date(d?.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => createRoom(d._id, d.roomId?._id)}
                    className="min-h-[42px] rounded-[14px] bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    {d.roomId?._id ? "Join" : "Create"}
                  </button>
                  {(isOwner || isAdmin) && (
                    <>
                      <button
                        onClick={() =>
                          navigate(`/discussion-form-edit/${d?._id}`)
                        }
                        className="min-h-[42px] rounded-[14px] border border-indigo-200 bg-indigo-50 px-4 text-sm font-bold text-indigo-900 transition hover:bg-indigo-100"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteDiscussion(d?._id)}
                        className="min-h-[42px] rounded-[14px] border border-rose-200 bg-rose-50 px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                      >
                        {loading ? (
                          <span className="spinner-border spinner-border-sm me-2" />
                        ) : (
                          <i className="bi bi-trash"></i>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
