import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api";

export default function EditChapters() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId, chapterId, chapterN } = location.state || {};
  console.log("EditSections props: ", { subjectId, chapterId, chapterN });
  const [chapterName, setChapterName] = React.useState(chapterN);
  // useEffect(() => {
  //   const getChapterData = async () => {
  //     try {
  //       const res = await api.get(
  //         `/subjects/${subjectId}/chapters/${chapterId}`
  //       );
  //       console.log("chapter data for editing: ", res?.data);
  //       // setChapterName(res?.data);
  //     } catch (err) {
  //       console.error("Error fetching section data: ", err?.response?.data);
  //     }
  //   };
  //   getChapterData();
  // }, []);
  const handleChapterDataUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(
        `/subjects/${subjectId}/chapters/${chapterId}/edit`,
        {
          chapterName: chapterName,
        }
      );
      console.log("chapter updated successfully: ", res?.data);
      navigate(`/subjects/${subjectId}`);
    } catch (err) {
      console.error("Error updating section: ", err?.response?.data);
    }
  };
  console.log("chapterName: ", chapterName);
  return (
    <div>
      <h1>Edit Chapter</h1>
      <form onSubmit={handleChapterDataUpdate}>
        <input
          placeholder="Chapter Name"
          name="chapterName"
          value={chapterName}
          className="form-control my-2"
          onChange={(e) => setChapterName(e.target.value)}
        />
        <button className="btn btn-outline-success">Save</button>
      </form>
    </div>
  );
}
