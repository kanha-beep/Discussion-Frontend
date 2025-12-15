import React from "react";

export  function EditSingleChapterButton({ navigate, subjectId, c }) {
  return (
    <div>
      <button
        onClick={() =>
          navigate(`/subjects/${subjectId}/chapters/${c._id}`, {
            state: {
              subjectId: subjectId,
              chapterId: c._id,
              chapterN: c.chapter_name,
            },
          })
        }
        className="btn btn-outline-success btn-sm"
      >
        Edit
      </button>
    </div>
  );
}
