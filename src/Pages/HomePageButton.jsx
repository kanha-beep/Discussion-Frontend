import React from "react";
import { ArrowLeft } from "lucide-react";
export function HomePageButton({ navigate }) {
  return (
    <div>
      <button
        onClick={() => navigate("/")}
        className="btn btn-outline-secondary flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Subjects</span>
      </button>
    </div>
  );
}
