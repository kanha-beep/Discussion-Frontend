import { useContext, useEffect } from "react";
import Navbar from "./Components/Navbar";
import HomePage from "./Pages/HomePage.jsx";
import { Routes, Route } from "react-router-dom";
import DiscussionForm from "./DiscussionForm/DiscussionForm.jsx";
import DiscussionFormEdit from "./DiscussionForm/DiscussionFormEdit.jsx";
import ProtectedRoute from "./Pages/ProtectedRoute.jsx";
import Auth from "./Auth/Auth.jsx";
import { api } from "../api.js";
import ProfilePage from "./Pages/ProfilePage.jsx";
import { UserContext } from "./Components/UserContext.js";
import WhiteBoard from "./Pages/WhiteBoard.jsx";
import WhiteBoard3D from "./Pages/WhiteBoard3D.jsx";
import VideoCall from "./Pages/VideoCall.jsx";
import PrivateRoom from "./Pages/PrivateRoom.jsx";
function App() {
  const {
    showMsg,
    setShowMsg,
    chatOpen,
    setChatOpen,
    filterDiscussion,
    setFilterDiscussion,
    userRoles,
    setUserRoles,
    mobileChatOpen,
    setMobileChatOpen,
    isLoggedIn,
    setIsLoggedIn,
    msg,
    setMsg,
    user,
    setUser,
    msgType,
    setMsgType,
  } = useContext(UserContext);
  const checkAuth = async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    if (API_URL) {
      try {
        const res = await api.get("/api/auth/me");
        setIsLoggedIn(true);
        setUser(res?.data?.user);
        console.log("Logged in User: ", res?.data?.user?._id);
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
  // console.log("chat open: ", showMsg);
  return (
    <div style={{ width: "98%" }} className="mx-auto">
      <Navbar filterDiscussion={filterDiscussion} setChatOpen={setChatOpen} />

      <Routes>
        <Route path="/whiteboard" element={<WhiteBoard />} />
        <Route path="/whiteboard-3d" element={<WhiteBoard3D />} />
        <Route path="/auth" element={<Auth checkAuth={checkAuth} />} />
        <Route path="/user/:userId" element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/discussion-form" element={<DiscussionForm />} />
        <Route
          path="/discussion-form-edit/:discussionId"
          element={<DiscussionFormEdit />}
        />
        <Route path="/profile/:profileId" element={<ProfilePage />} />
        <Route path="/call/:activeUserId" element={<VideoCall />} />
        <Route path="/room/:roomId" element={<PrivateRoom />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Routes></Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
