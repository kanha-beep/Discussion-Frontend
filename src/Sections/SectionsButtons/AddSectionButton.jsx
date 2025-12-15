import React from "react";

export function AddSectionButton({ navigate, c, subjectId }) {
  return (
    <div>
      <button
        onClick={() =>
          navigate("/add-sections", {
            state: {
              chapterId: c._id,
              chapterName: c.chapter_name,
              subjectId: subjectId,
            },
          })
        }
        className="ms-4 btn btn-outline-secondary btn-sm"
        style={{width:"8rem"}}
      >
        Add Sections
      </button>
    </div>
  );
}
