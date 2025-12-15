import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="my-3">
      <div className="mx-auto d-flex justify-evenly">
        <div className="d-flex items-center space-x-2">
          <button
            onClick={() => navigate("/")}
            className="flex items-center btn btn-outline-primary me-5"
          >
            <GraduationCap className="w-8 h-8 text-gray-800" />
            <span className="">FSS</span>
          </button>
          <div className="me-5">Your Learning Companion</div>
        </div>
        <div className="bg-light">
          {/* <button
            className="btn btn-outline-danger ms-2"
            onClick={() => navigate("/add-chapters")}
          >
            Add Chapters
          </button> */}
        </div>
      </div>
      <hr />
      <hr/>
    </nav>
  );
}
