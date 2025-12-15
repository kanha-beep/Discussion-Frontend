import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AddSectionButton } from "../Sections/SectionsButtons/AddSectionButton.jsx";
import { EditSingleChapterButton } from "./ChaptersButtons/EditSingleChapterButton.jsx";
import { DeleteChapterButton } from "./ChaptersButtons/DeleteChapterButton.jsx";
import { DeleteChapter } from "../Chapters/ChaptersComponents/DeleteChapter.js";
import { api } from "./../../api.js";
export default function ChapterList({
  chaptersList,
  handleSections,
  subjectId,
}) {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  useEffect(() => {
    setChapters(chaptersList);
  }, [chaptersList]);

  const handleDeleteChapter = async (chapterId) => {
    console.log("delete started");
    await DeleteChapter(api, chapterId, setChapters);
    console.log("chapter deleted");
  };
  return (
    <div className="border rounded p-2">
      <h3 className="mb-4">Chapters</h3>
      {chapters.map((c) => (
        <div key={c._id} className="border rounded p-1 my-2">
          <div className="d-flex flex-column gap-2">
            <div className="">
              <button
                className="btn btn-primary"
                onClick={() => handleSections(c._id)}
              >
                {c?.chapter_name}
              </button>
            </div>
            {/* navigation buttons like edit delete etc */}
            <div className="row gap-1 rounded" style={{ width: "20rem" }}>
              <div className="col-md-2">
                <EditSingleChapterButton
                  navigate={navigate}
                  subjectId={subjectId}
                  c={c}
                />
              </div>
              <div className="col-md-2">
                <DeleteChapterButton
                  handleDeleteChapter={handleDeleteChapter}
                  chapter={c}
                />
              </div>
              <div className="col-md-2">
                <AddSectionButton
                  navigate={navigate}
                  c={c}
                  subjectId={subjectId}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

{
  //   const moveChapter = (fromIndex, toIndex) => {
  //   const updatedChapters = [...chapters];
  //   const [movedChapter] = updatedChapters.splice(fromIndex, 1);
  //   updatedChapters.splice(toIndex, 0, movedChapter);
  //   setChapters(updatedChapters);
  // };
  /* <button
                onClick={() => moveChapter(index, 0)}
                className="btn btn-outline-info btn-sm"
                title="Move to top"
              >
                ↑
              </button>
              <button
                onClick={() => moveChapter(index, chapters.length - 1)}
                className="btn btn-outline-info btn-sm"
                title="Move to bottom"
              >
                ↓
              </button> */
}
