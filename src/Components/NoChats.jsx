import React from "react";

export default function NoChats({ activeUser, chatUsers }) {
  return (
    <div>
      {" "}
      {!activeUser && chatUsers.length === 0 && (
        <div className="text-muted">No chats yet</div>
      )}
    </div>
  );
}
