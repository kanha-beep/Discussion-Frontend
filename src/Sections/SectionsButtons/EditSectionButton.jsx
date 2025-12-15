import React from "react";

export function EditSectionButton({ navigate, _id, section }) {
  return (
    <div>
      <button
        onClick={() =>
          navigate(
            `/subjects/${_id}/chapters/${section?.chapter_of_section}/sections/${section?._id}`,
            {
              state: {
                subjectId: _id,
                chapterId: section?.chapter_of_section,
                sectionId: section?._id,
              },
            }
          )
        }
        className="btn btn-outline-secondary btn-sm"
      >
        Edit
      </button>
    </div>
  );
}
