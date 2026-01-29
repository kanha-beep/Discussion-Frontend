import React from "react";

export default function ActiveMessages({
  activeMessages,
  user,
  sideActiveUser,
}) {
  // const filtered = activeMessages.filter(
  //   (m) =>
  //     m.senderId._id === sideActiveUser._id ||
  //     m.receiverId._id === sideActiveUser._id,
  // );
  return (
    <div>
      {sideActiveUser?.email}
      {sideActiveUser &&
        activeMessages.map((m) => (
          <>
            <div key={m._id}>
              <b>
                {String(m.senderId._id) === String(user._id)
                  ? "You"
                  : m.senderId.email.split("@")[0]}
              </b>{" "}
              {m.text}
            </div>
          </>
        ))}
    </div>
  );
}
