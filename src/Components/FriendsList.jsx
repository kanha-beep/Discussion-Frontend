import React from "react";

export default function FriendsList({
  activeUser,
  chatUsers,
  setActiveUser,
  setSideActiveUser,
  setSideChatOpen,
  socket,
  activeChatId,
}) {
  return (
    <div>
      {" "}
      {chatUsers.map((u) => (
        <>
          {" "}
          {/* my fiends list */}
          <div
            key={u._id}
            className="border p-2 h-[3rem] align-item-center"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setActiveUser(u);
              setSideActiveUser(u);
              setSideChatOpen(true);
              socket.emit("join-chat", activeChatId);
            }}
          >
            <span>{u.email.split("@")[0]}</span>
          </div>
        </>
      ))}
    </div>
  );
}
