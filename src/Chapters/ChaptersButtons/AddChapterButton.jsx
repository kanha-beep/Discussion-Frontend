import React from "react";

export function AddChapterButton({ handleAddChapter }) {
  return (
    <div>
      {" "}
      <button onClick={handleAddChapter} className="rounded">
        Add Chapter
      </button>
    </div>
  );
}
