import React from "react";

export default function SendMessageButton({handleSubmitChat}) {
  return (
    <div>
      {" "}
      <button onClick={handleSubmitChat} className="btn btn-primary ms-2">
        Send
      </button>
    </div>
  );
}
