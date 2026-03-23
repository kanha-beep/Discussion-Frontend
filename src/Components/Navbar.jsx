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
    setMobileChatOpen,
  } = useContext(UserContext);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [view, setView] = useState(1);

  const [search, setSearch] = useState("");
  const [showNavbarSearch, setShowNavbarSearch] = useState(false);
  const navigate = useNavigate();
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await api.post("/api/auth/logout");
      setIsLoggedIn(false);
      navigate(`/auth`, { replace: true });
    } catch (e) {
      console.log("error logout: ", e?.response?.data?.msg);
      console.log(e.response);
      alert("error logout: " + e?.response?.data?.msg);
    } finally {
      setLogoutLoading(false);
    }
  };
  useEffect(() => {
    const handleScroll = () => {
      setShowNavbarSearch(window.scrollY > 180);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
  return (
    <div className="container-1">
      <nav className="navbar navbar-expand-lg fixed-top bg-dark">
        <div className="container-fluid navbar-shell">
          {/* LEFT: LOGO (always visible) */}
          <button
            className="navbar-brand fw-bold text-white bg-dark"
            onClick={() => navigate("/")}
            style={{ border: 0 }}
          >
            DISCUSSION HUB
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
          <div className="d-none d-lg-flex w-100 align-items-center navbar-desktop">
            {/* SEARCH */}
            {showNavbarSearch && (
              <div className="navbar-search-center">
                <input
                  className="form-control navbar-search-input"
                  placeholder="Search Discussion"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            <div className="ms-auto d-flex align-items-center">
              {/* LINKS */}
              <ul className="navbar-nav d-flex flex-row align-items-center me-3">
                <li className="nav-item text-white">
                  <i className="bi bi-bell fs-5"></i>
                </li>
                <li className="nav-item text-white ms-3">
                  <i className="bi bi-camera-video fs-5"></i>
                </li>
                <li className="nav-item text-white ms-3">
                  <i className="bi bi-chat-dots fs-5"></i>
                </li>
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
            </div>
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
          <button className="btn text-white" onClick={() => setMobileChatOpen(true)}>
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
          <div className="dropdown">
            <button
              className="btn text-white dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-circle fs-5"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button className="dropdown-item">
                  <span><i className="bi bi-person me-2"></i> {user?.email}</span>
                  
                </button>
              </li>

              <li>
                <hr className="dropdown-divider" />
              </li>

              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                >
                  {logoutLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </>
                  )}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
