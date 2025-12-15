import { useState } from "react";
import Navbar from "./Components/Navbar";
import HomePage from "./Pages/HomePage.jsx";
import SubjectPage from "./Subjects/SubjectPage.jsx";
import { Routes, Route } from "react-router-dom";
import AddChapters from "./Chapters/AddChapters.jsx";
import AddSections from "./Sections/AddSections.jsx";
import EditSections from "./Sections/EditSections.jsx";
import EditChapters from "./Chapters/EditChapters.jsx";
function App() {
  const [currentView, setCurrentView] = useState("home");
  const [selectedSubject, setSelectedSubject] = useState(null);

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setCurrentView("subject");
  };

  const handleBackToHome = () => {
    setCurrentView("/");
    setSelectedSubject(null);
  };

  return (
    <div className="" style={{width:"98%"}}>
      <Navbar onHomeClick={handleBackToHome} />

      {currentView === "subject" && selectedSubject && (
        <SubjectPage subject={selectedSubject} onBack={handleBackToHome} />
      )}
      <Routes>
        <Route
          path="/"
          element={<HomePage onSubjectClick={handleSubjectClick} />}
        />
        <Route path="/add-chapters" element={<AddChapters />} />
        {/* <Route path="/add-chapters" element={<AddChapters />} /> */}
        <Route path="/add-sections" element={<AddSections />} />
        <Route path="/subjects/:_id" element={<SubjectPage />} />
        <Route
          path="/subjects/:_id/chapters/:chapterId/sections/:sectionId"
          element={<EditSections />}
        />
        <Route
          path="/subjects/:_id/chapters/:chapterId"
          element={<EditChapters />}
        />
      </Routes>
    </div>
  );
}

export default App;
