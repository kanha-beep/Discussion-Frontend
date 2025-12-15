import { useState } from "react";
import { api } from "../../api.js"
import { useNavigate } from "react-router-dom";

export default function AddSubject() {
  const navigate = useNavigate();
  const [subjectName, setSubjectName] = useState("");
  const [chapters, setChapters] = useState([]);
  const [chapterName, setChapterName] = useState("");

  // Submit final subject
  const handleSubmit = async () => {
    if (!subjectName.trim()) return alert("Enter subject name");
    console.log("Submitting subject:", subjectName, chapters);

    try {
      const res = await api.post(`/subjects/${subjectId}/chapters/add-chapters`, {
        name: subjectName,
        chapters: chapters,
      });
      console.log("chapters added done: ", res?.data)
      alert("Subject added successfully");

      // Reset form
      setSubjectName("");
      setChapters([]);
      return navigate("/");
    } catch (err) {
      console.error("Error adding subject:", err?.response?.data?.msg);
      alert("Failed to save subject");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add Subject</h1>

      {/* Subject Name */}
      <select className="w-full border p-3 rounded mb-6" onChange={(e) => setSubjectName(e.target.value)} value={subjectName}>
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
      {/* {Section name} */}
      {/* <input
        type="text"
        placeholder="Section Name"
        value={sectionName}
        onChange={(e) => setSectionName(e.target.value)}
        className="w-full border p-3 rounded mb-3"
      />
      {/* Section Content */}
      {/* <input
        type="text"
        placeholder="Section Content"
        value={sectionContent}
        onChange={(e) => setSectionContent(e.target.value)}
        className="w-full border p-3 rounded mb-3"
      />  */}
      {/* Chapters */}
      {/* <input
        type="text"
        placeholder="Chapters"
        value={chapters}
        onChange={(e) => setChapters(e.target.value)}
        className="w-full border p-3 rounded mb-3"
      /> */}
      {/* Sections */}
      <div className="flex gap-2">
        {/* <input
          type="text"
          placeholder="Sections"
          value={sections}
          onChange={(e) => setSections(e.target.value)}
          className="flex-1 border p-3 rounded"
        /> */}
        {/* <button
          onClick={addSectionContent}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Section_Content
        </button> */}
      </div>

      {/* Show Added Events */}
      {/* <div className="mt-4 space-y-2">
        {sections.map((ev, idx) => (
          <div key={idx} className="p-2 bg-gray-100 rounded">
            {ev.section_name}: {ev.section_content}
          </div>
        ))}
      </div> */}

      {/* Add Chapter */}
      <button
        onClick={addChapter}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Add Chapter
      </button>

      {/* Show Chapters */}
      {chapters.map((ch, index) => (
        <div key={index} className="p-3 border rounded mb-3 bg-gray-50">
          <strong>Chapter name: {ch.chapter_name}</strong>
          <ul className="list-disc ml-6 mt-2">
            {(ch.sections || []).map((sec, i) => (
              <li key={i}>
                <strong>Sections Name:</strong> {sec.section_name} - {" "}
                <strong>Section Content: </strong>
                {sec.section_content}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Save Subject */}
      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-purple-600 text-white py-3 rounded text-lg"
      >
        Save Subject
      </button>
    </div>
  );
}
