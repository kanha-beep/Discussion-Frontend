import React from "react";

export default function NoChats({ activeUser, chatUsers, label = "No chats yet" }) {
  return (
    <div>
      {" "}
      {!activeUser && chatUsers.length === 0 && (
        <div className="text-muted p-3">{label}</div>
      )}
    </div>
  );
}
