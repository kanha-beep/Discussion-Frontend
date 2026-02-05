import { GraduationCap } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";

export default function Navbar() {
  const {
    isLoggedIn,
    setIsLoggedIn,
    user,
    setFilterDiscussion,
    chatOpen,
    setMobileChatOpen,
    setShowMsg,
    showMsg,
  } = useContext(UserContext);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [view, setView] = useState(1);

  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false); // ✅ NEW
  const navigate = useNavigate();
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await api.post("/api/auth/logout");
      setIsLoggedIn(false);
      navigate(`/auth`, { replace: true });
    } catch (e) {
      console.log("error logout: ", e?.response?.data);
      alert("error logout: ", e?.response?.data);
    } finally {
      setLogoutLoading(false);
    }
  };
  // 🔥 SCROLL EFFECT
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const searchKey = async () => {
      try {
        const res = await api.get(`/api/discussion?search=${search}`);
        setFilterDiscussion(res?.data?.discussions);
      } catch (e) {
        console.log(e?.response?.data);
      }
    };
    searchKey();
  }, [search]);
  const sendMessage = async (text) => {
    const res = await fetch("http://localhost:3000/api/discussion/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    console.log("resecied in fronted: ", data?.reply);
    setShowMsg(data.reply);
  };
  return (
    <div className="container-1">
      <nav className="navbar navbar-expand-lg fixed-top bg-dark">
        <div className="container-fluid">
          {/* LEFT: LOGO (always visible) */}
          <button
            className="navbar-brand fw-bold text-white bg-dark"
            onClick={() => navigate("/")}
            style={{ border: 0 }}
          >
            DISCUSSION HUB
          </button>
          <button
            className="navbar-brand fw-bold text-white bg-dark"
            onClick={() => navigate("/whiteboard")}
            style={{ border: 0 }}
          >
            White Board
          </button>
          {/* MOBILE ACTIONS (search + chats) */}
          <div className="d-flex d-lg-none ms-auto gap-2">
            {/* Search */}
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => setView(view === "search" ? null : "search")}
            >
              🔍
            </button>
            {/* Chats */}
            <button
              className="btn btn-outline-light btn-sm"
              onClick={() => setMobileChatOpen(true)}
            >
              💬
            </button>
            <button
              className="btn btn-warning btn-sm"
              onClick={() =>
                navigate("/discussion-form", {
                  state: { user, edit: false },
                })
              }
            >
              +
            </button>
          </div>
          {/* COLLAPSIBLE CONTENT (hidden on sm/md) */}
          <div className="d-none d-lg-flex w-100 align-items-center">
            {/* SEARCH */}
            <input
              className="form-control mx-3"
              placeholder="Search Discussion"
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: "300px" }}
            />
            <div className="d-flex">
              <input
                placeholder="Ask Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  sendMessage(question);
                  setQuestion("");
                }}
              >
                Ask
              </button>
            </div>
            {/* LINKS */}
            <ul className="navbar-nav me-auto">
              <li className="nav-item text-white">Notifications</li>
              <li className="nav-item text-white ms-3">Meeting</li>
              <li className="nav-item text-white ms-3">Messages</li>
            </ul>
            {/* ACTION BUTTONS */}
            <button
              className="btn btn-warning me-2"
              onClick={() =>
                navigate("/discussion-form", {
                  state: { user, edit: false },
                })
              }
            >
              Create Discussion
            </button>
            {isLoggedIn ? (
              <button className="btn btn-dark" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <>
                <button
                  className="btn btn-outline-light me-2"
                  onClick={() => navigate("/auth", { state: { login: false } })}
                >
                  Register
                </button>
                <button
                  className="btn btn-light"
                  onClick={() => navigate("/auth", { state: { login: true } })}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="d-lg-none fixed-bottom bg-dark border-top">
        <div className="d-flex justify-content-around py-2 text-white">
          <button className="btn text-white" onClick={() => navigate("/")}>
            <i className="bi bi-house fs-5"></i>
          </button>
          <button className="btn text-white">
            <i className="bi bi-chat-dots fs-5"></i>
          </button>
          <button
            className="btn text-white"
            onClick={() =>
              navigate("/discussion-form", { state: { user, edit: false } })
            }
          >
            +
          </button>

          <button className="btn text-white">
            <i className="bi bi-bell fs-5"></i>
          </button>

          <button className="btn text-white" onClick={handleLogout}>
            {logoutLoading ? (
              <span className="spinner-border spinner-border-sm me-1"></span>
            ) : (
              <i className="bi bi-person-circle fs-5"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
