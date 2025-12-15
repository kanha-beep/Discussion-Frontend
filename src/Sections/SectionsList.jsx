import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EditSectionButton } from "./SectionsButtons/EditSectionButton";
import { DeleteSectionButton } from "./SectionsButtons/DeleteSectionButton";

export default function SectionsList({
  sectionsList,
  _id,
  handleDeleteSection,
  setSectionContent,
}) {
  const navigate = useNavigate();
  const [openSectionId, setOpenSectionId] = useState(null);

  useEffect(() => {
    setSectionContent(null);
    setOpenSectionId(null);
  }, [sectionsList]);

  const toggleSection = (sectionId) => {
    if (openSectionId === sectionId) {
      // Close if already open
      setOpenSectionId(null);
      setSectionContent(null);
      return;
    }

    // Open new section
    setOpenSectionId(sectionId);
    const section = sectionsList.find((s) => s._id === sectionId);
    if (section) {
      let formatted = section.section_content
        .map((s) => s.trim())
        .join("<br/><br/>");
      formatted = formatted.replace(/\d+/g, "<b>$&</b>");
      setSectionContent(formatted);
    }
  };
  return (
    <div className="border rounded">
      <h3 className="mb-3 p-2">Sections</h3>
      {sectionsList.length > 0 && (
        <div className="border rounded ps-2 pb-2">
          {/* <ul className=""> */}
          {sectionsList.map((section) => (
            <div key={section._id}>
              <button
                onClick={() => toggleSection(section._id)}
                className={`btn my-2 ${
                  openSectionId === section._id
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
              >
                {section.section_name}
              </button>
              <div className="row rounded" style={{ width: "20rem" }}>
                <div className="col-md-3">
                  <EditSectionButton
                    navigate={navigate}
                    _id={_id}
                    section={section}
                  />
                </div>
                <div className="col-md-3">
                  <DeleteSectionButton
                    handleDeleteSection={handleDeleteSection}
                    section={section}
                  />
                </div>
              </div>
            </div>
          ))}
          {/* </ul> */}
        </div>
      )}
    </div>
  );
}
