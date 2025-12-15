import React from "react";

export function SubjectCard({ subjectName, chaptersCount }) {
  return (
    <div className="rounded border p-3">
      <div className="row">
        <div className="col-md-6">
          <h2 className="display-6">{subjectName}</h2>
        </div>
        <div className="col-md-6 d-flex align-items-center">
          <span>
            No of Chapters: <b className="ms-2">{chaptersCount}</b>
          </span>
        </div>
      </div>
    </div>
  );
}
