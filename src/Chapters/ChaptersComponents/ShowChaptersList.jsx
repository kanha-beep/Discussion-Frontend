import React from "react";

export function ShowChaptersList({ch}) {
  return (
    <div>
      <strong>Chapter name: {ch}</strong>
      <ul className="list-disc ml-6 mt-2"></ul>
    </div>
  );
}
