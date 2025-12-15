import * as LucideIcons from "lucide-react";
import { SubjectName } from "./SubjectsComponents/SubjectName.jsx";
import { SubjectDescription } from "./SubjectsComponents/SubjectDescription.jsx";

// const colorClasses = {
//   amber: "bg-amber-50 border-amber-200 hover:border-amber-300 text-amber-900",
//   emerald:
//     "bg-emerald-50 border-emerald-200 hover:border-emerald-300 text-emerald-900",
//   blue: "bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-900",
//   rose: "bg-rose-50 border-rose-200 hover:border-rose-300 text-rose-900",
// };

// const iconColorClasses = {
//   amber: "text-amber-600",
//   emerald: "text-emerald-600",
//   blue: "text-blue-600",
//   rose: "text-rose-600",
// };

export default function SubjectHomeCard({ subject, onClick }) {
  // const IconComponent = LucideIcons[subject.icon] || LucideIcons.BookOpen;
  // const cardColor = colorClasses[subject.color] || colorClasses.blue;
  // const iconColor = iconColorClasses[subject.color] || iconColorClasses.blue;
  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:scale-105`}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`p-4 rounded-full`}>
          {/* <IconComponent className="w-8 h-8" /> */}
        </div>
        <div className="p-6">
          <SubjectName subject={subject} />
          <SubjectDescription subject={subject} />
        </div>
      </div>
    </button>
  );
}
