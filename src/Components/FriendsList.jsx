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
              className="border p-2"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setActiveUser(u);
                setSideActiveUser(u);
                setSideChatOpen(true);
                socket.emit("join-chat", activeChatId);
              }}
            >
              {u.email.split("@")[0]}
            </div>
          </>
        ))}
    </div>
  );
}
