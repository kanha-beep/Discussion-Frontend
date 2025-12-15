import React from "react";

export function DeleteChapterButton({ handleDeleteChapter, chapter }) {
  return (
    <div>
      <button
        className="btn btn-outline-danger btn-sm"
        onClick={() => handleDeleteChapter(chapter._id)}
      >
        Delete
      </button>
    </div>
  );
}
