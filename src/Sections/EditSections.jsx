import React, { useEffect } from "react";
import { api } from "../../api.js";
import { useLocation, useNavigate } from "react-router-dom";
import { handleChange } from "../Components/HandleChange.js";
import { UpdateSection } from "./SectionsComponents/UpdateSection.js";
import { GetSection } from "./SectionsComponents/GetSection.js";
export default function EditSections() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId, chapterId, sectionId } = location.state || {};
  console.log("EditSections props: ", { subjectId, chapterId, sectionId });
  const [sectionData, setSectionData] = React.useState({
    sectionName: "",
    sectionContent: "",
  });
  useEffect(() => {
    const getSectionData = async () => {
      GetSection(api, subjectId, chapterId, sectionId, setSectionData);
    };
    getSectionData();
  }, []);
  const handleContentUpdate = async (e) => {
    UpdateSection(
      e,
      api,
      subjectId,
      chapterId,
      sectionId,
      sectionData,
      navigate
    );
    console.log("section updated");
  };
  return (
    <div>
      <h1>Edit Sections</h1>
      <form onSubmit={handleContentUpdate}>
        <input
          placeholder="Section Name"
          name="sectionName"
          value={sectionData.sectionName}
          className="form-control my-2"
          onChange={(e) => handleChange(e, setSectionData)}
        />
        <textarea
          rows="20"
          placeholder="Section Content"
          name="sectionContent"
          className="form-control my-2"
          value={sectionData.sectionContent}
          onChange={(e) => handleChange(e, setSectionData)}
        />
        <button className="btn btn-outline-success">Save</button>
      </form>
    </div>
  );
}
