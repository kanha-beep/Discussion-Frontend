import React from "react";
import { ArrowLeft } from "lucide-react";
export function GoToAddChapterButton({ navigate, _id }) {
  return (
    <div>
      {" "}
      <button
        onClick={() => navigate("/add-chapters", { state: _id })}
        className="btn btn-outline-danger ms-2"
      >
        {/* <ArrowLeft className="w-5 h-5" /> */}
        <span>Add Chapters</span>
      </button>
    </div>
  );
}
