import { useEffect, useState } from "react";

import ChapterList from "../Chapters/ChapterList.jsx";
import SectionsList from "../Sections/SectionsList.jsx";
import SectionsSummary from "../Sections/SectionsSummary.jsx";
// import Timeline from "../Components/Timeline.jsx";
import { DeleteSection } from "../Sections/SectionsComponents/DeleteSection.js";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api.js";
import { EditSection } from "../Sections/SectionsComponents/EditSection.js";
import { GetChapters } from "../Chapters/ChaptersComponents/GetChapters.js";
import { HandleSections } from "../Sections/SectionsComponents/HandleSection.js";
import { HomePageButton } from "../Pages/HomePageButton.jsx";

import { GoToAddChapterButton } from "../Chapters/ChaptersButtons/GoToAddChapterButton.jsx";
import { SubjectCard } from "./SubjectCard.jsx";
export default function SubjectPage() {
  const navigate = useNavigate();
  const { _id } = useParams();
  // console.log("Subject ID from params working:", _id);
  const [subjectName, setSubjectName] = useState("");
  const [chaptersList, setChaptersList] = useState([]);
  const [chaptersCount, setChapterCount] = useState(0);
  const [sectionContent, setSectionContent] = useState(null);

  const [openChapterId, setOpenChapterId] = useState(null);
  const [onClickedSectionId, setOnClickedSectionId] = useState(false);
  // get chapters
  const getChapters = async () => {
    GetChapters(api, _id, setChapterCount, setSubjectName, setChaptersList);
  };
  // get section id to open or close
  const onOpenClose = (sectionId) => {
    // console.log("want this: ", sectionId);
    setOnClickedSectionId(sectionId);
  };
  console.log("got section id: ", onClickedSectionId);
  // open all chapters
  useEffect(() => {
    if (!_id) return;
    const fetchChapters = async () => {
      try {
        await getChapters();
      } catch (err) {
        console.error(err);
      }
    };
    fetchChapters();
  }, [_id]);

  const [sectionsList, setSectionsList] = useState([]);
  // section on off
  const handleSections = async (chapterId) => {
    HandleSections(
      openChapterId,
      chapterId,
      setOpenChapterId,
      setSectionsList,
      api,
      _id
    );
  };
  // add section
  const handleAddSections = () => {};
  // edit section
  const handleEditContent = async (chapterId, sectionId) => {
    EditSection(api, _id, chapterId, sectionId);
    console.log("section deleted");
  };
  // delete section
  const handleDeleteSection = async (chapterId, sectionId) => {
    console.log("start of deleting section");
    DeleteSection(api, _id, chapterId, sectionId, getChapters, setSectionsList);
    console.log("section deleted");
  };
  // true or false
  const onClickId = () => {
    setOnClickedSectionId(!onClickedSectionId);
    console.log("onClickedSectionId: ", onClickedSectionId);
  };
  // console.log("selectedChapter: ", onClickedSectionId);
  return (
    <div className="bg-light">
      <HomePageButton navigate={navigate} />
      <GoToAddChapterButton navigate={navigate} _id={_id} />
      <SubjectCard subjectName={subjectName} chaptersCount={chaptersCount} />
      <div className="mt-2 rounded border">
        <div className="row">
          <div className="col-sm-6 col-md-6 col-lg-4">
            <ChapterList
              handleSections={handleSections}
              chaptersList={chaptersList}
              handleAddSections={handleAddSections}
              subjectId={_id}
            />
          </div>
          <div className="col-sm-12 col-md-6 col-lg-3">
            <SectionsList
              _id={_id}
              handleEditContent={handleEditContent}
              sectionsList={sectionsList}
              onClickId={onClickId}
              handleDeleteSection={handleDeleteSection}
              onOpenClose={onOpenClose}
              sectionContent={sectionContent}
              setSectionContent={setSectionContent}
            />
          </div>
          <div className="col-sm-12 col-md-6 col-lg-3">
            <SectionsSummary
              _id={_id}
              // handleEditContent={handleEditContent}
              sectionsList={sectionsList}
              sectionContent={sectionContent}
              // onClickId={onClickId}
              // handleDeleteSection={handleDeleteSection}
              // onOpenClose={onOpenClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
