import React from "react";

export default function BackButton({
  setActiveUser,
  activeUser,
  sideChatOpen,
}) {
  return (
    <div>
      {activeUser && (
        <>
          <div className="d-flex justify-content-between">
            <strong>{activeUser.email.split("@")[0]}</strong>
            <button
              onClick={() => setActiveUser(null)}
              className="btn btn-primary btn-sm"
            >
              ← Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
