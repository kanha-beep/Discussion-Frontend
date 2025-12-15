import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useNavigate } from "react-router-dom";
import StartLearningButton from "./StartLearningButton.jsx";
import SubjectHomeCard from "../Subjects/SubjectHomeCard.jsx";
import { Loading } from "../Components/Loading.jsx";
import { MainPageHeading } from "../Pages/MainPageHeading.jsx";
import { GetAllSubjects } from "../Subjects/SubjectsComponents/GetAllSubjects.js";
export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const getAllSubjects = async () => {
      GetAllSubjects(api, setSubjects, setLoading);
    };
    console.log("got all subjects");
    getAllSubjects();
  }, []);
  if (loading) return <Loading loading={loading} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <MainPageHeading />
      <div className="grid grid-cols-1 grid-sm-5 card">
        {subjects.map((subject) => (
          <div key={subject._id} className="card-item">
            <SubjectHomeCard subject={subject} />
            <div className="bg-gray-50 px-6 py-4 card-body">
              <StartLearningButton navigate={navigate} subject={subject} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
