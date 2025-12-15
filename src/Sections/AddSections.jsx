import { useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { api } from "../../api.js";
import { handleChange } from "../Components/HandleChange.js";
import { AddSection } from "./SectionsComponents/AddSection.js";
export default function AddSections() {
  const navigate = useNavigate();
  const location = useLocation();
  const { chapterId, chapterName } = location.state || {};
  const subjectId = location.state?.subjectId || "";
  const [sections, setSections] = useState({
    sectionName: "",
    sectionContent: "",
  });
  console.log(
    "chapterId",
    chapterId,
    "chapterName",
    chapterName,
    "subject id",
    subjectId
  );
  const handleAddSections = async (e) => {
    console.log("section adding started from page")
    AddSection(e, sections, api, subjectId, chapterId, setSections, navigate);
    console.log("section added ended on section add page");
  };
  return (
    <div>
      <h1>Add Sections</h1>
      <p>Chapter Name: {chapterName}</p>
      <form onSubmit={handleAddSections}>
        <input
          placeholder="Section Name"
          value={sections.sectionName}
          name="sectionName"
          onChange={(e) => handleChange(e, setSections)}
          className="form-control my-1"
        />
        <textarea
          rows="30"
          cols="30"
          placeholder="Section Content"
          name="sectionContent"
          onChange={(e) => handleChange(e, setSections)}
          value={sections.sectionContent}
          className="form-control my-1"
        />
        <button type="submit" className="btn btn-primary">
          Add Section
        </button>
      </form>
      <button
        className="btn btn-outline-secondary"
        onClick={() => navigate(`/subjects/${subjectId}`)}
      >
        Go back to Subject page
      </button>
      <div>
        <p>Section Name: {sections.sectionName}</p>
        <p>Section Content: {sections.sectionContent}</p>
      </div>
    </div>
  );
}
// setSections((prev) => {
//   const updated = [...prev];
//   updated[0] = {
//     ...updated[0],
//     [name]: value,
//     chapterId: chapterId,
//   };
//   return updated;
// });
