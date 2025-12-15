import React from "react";

export function SubjectName({ subject }) {
  return (
    <div>
      <h2 className="card-title mb-2">{subject.subject_name}</h2>
    </div>
  );
}
