import React from "react";

export default function StartLearningButton({ navigate, subject }) {
  return (
    <div>
      <button
        className="btn btn-outline-success"
        onClick={() => navigate(`/subjects/${subject._id}`)}
      >
        Start Learning →
      </button>
    </div>
  );
}
