import { useEffect, useState } from "react";
import Navbar from "./Components/Navbar";
import HomePage from "./Pages/HomePage.jsx";
import { Routes, Route } from "react-router-dom";
import DiscussionForm from "./DiscussionForm/DiscussionForm.jsx";
import DiscussionFormEdit from "./DiscussionForm/DiscussionFormEdit.jsx"
import ProtectedRoute from "./Pages/ProtectedRoute.jsx";
import Auth from "./Auth/Auth.jsx";
import { api } from "../api.js";
import ProfilePage from "./Pages/ProfilePage.jsx";
function App() {
  const [filterDiscussion, setFilterDiscussion] = useState([]);
  const [userRoles, setUserRoles] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);
  const [msgType, setMsgType] = useState("success");
  const checkAuth = async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    console.log("API_URL: ", API_URL);
    if (API_URL) {
      try {
        console.log("current user starts");
        const res = await api.get("/auth/me");
        console.log("APP: ", res?.data);
        setIsLoggedIn(true);
        setUser(res?.data?.user);
      } catch (e) {
        console.log("error in checkAuth: ", e?.response?.data?.message);
        setIsLoggedIn(false);
      }
    } else {
      console.log("API_URL not found");
      setIsLoggedIn(false);
    }
  };
  useEffect(() => {
    checkAuth();
  }, []);
  return (
    <div style={{ width: "98%" }}>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        filterDiscussion={filterDiscussion}
        setFilterDiscussion={setFilterDiscussion}
        user={user}
      />
      <Routes>
        <Route
          path="/auth"
          element={
            <Auth
              setIsLoggedIn={setIsLoggedIn}
              msg={msg}
              setMsg={setMsg}
              msgType={msgType}
              setMsgType={setMsgType}
              userRoles={userRoles}
              setUserRoles={setUserRoles}
              checkAuth={checkAuth}
            />
          }
        />
        <Route
          path="/"
          element={<HomePage user={user} filterDiscussion={filterDiscussion} setFilterDiscussion={setFilterDiscussion}/>}
        />
        <Route
          path="/discussion-form"
          element={<DiscussionForm user={user} />}
        />
        <Route
          path="/discussion-form-edit/:discussionId"
          element={<DiscussionFormEdit user={user} />}
        />
        <Route
          path="/profile/:profileId"
          element={<ProfilePage user={user} />}
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute setUserRoles={setUserRoles} isLoggedIn={isLoggedIn}>
              <Routes></Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
