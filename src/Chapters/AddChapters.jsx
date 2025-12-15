import React from "react";
import { useState } from "react";
import { api } from "../../api";
import { useLocation, useNavigate } from "react-router-dom";
import { AddChapterToList } from "./ChaptersComponents/AddChapterToList.js";
import { AddChapter } from "./ChaptersComponents/AddChapter.js";
import { ShowChaptersList } from "./ChaptersComponents/ShowChaptersList.jsx";
import {SaveChapterButton} from "./ChaptersButtons/SaveChapterButton.jsx"
import {AddChapterButton} from "./ChaptersButtons/AddChapterButton.jsx"
export default function AddChapters() {
  const navigate = useNavigate();
  const location = useLocation();
  const subjectId = location.state;
  console.log("got subject id for api: ", subjectId);
  const [chaptersList, setChaptersList] = useState([]);
  const [subjectName, setSubjectName] = useState("");
  const [chapterName, setChapterName] = useState("");
  // add chapter to list
  const handleAddChapter = () => {
    AddChapterToList(
      chapterName,
      setChaptersList,
      chaptersList,
      setChapterName
    );
    console.log("chapter added");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    AddChapter(
      chaptersList,
      api,
      subjectId,
      setChaptersList,
      setChapterName,
      navigate
    );
    console.log("chapters submitted");
  };
  return (
    <div>
      <h1>Add Chapters</h1>
      {/* Subject Name */}
      <form onSubmit={handleSubmit}>
        <select
          className="w-full border p-3 rounded mb-6"
          onChange={(e) => setSubjectName(e.target.value)}
          value={subjectName}
        >
          <option value="">Select Subject</option>
          <option value="mathematics">Mathematics</option>
          <option value="science">Science</option>
          <option value="history">History</option>
          <option value="english">English</option>
          <option value="arts">Arts</option>
          <option value="music">Music</option>
        </select>
        {/* Chapter Name */}
        <input
          type="text"
          placeholder="Chapter Name"
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
          className="w-full border p-3 rounded mb-3"
        />
       <AddChapterButton handleAddChapter={handleAddChapter}/>
        {chaptersList.map((ch, index) => (
          <div key={index} className="p-3 border rounded mb-3 bg-gray-50">
            <ShowChaptersList ch={ch} />
          </div>
        ))}
        <SaveChapterButton />
      </form>
    </div>
  );
}
