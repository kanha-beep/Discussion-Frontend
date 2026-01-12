import { GraduationCap } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { api } from "../../api";
import { useEffect, useState } from "react";
export default function Navbar({
  isLoggedIn,
  setIsLoggedIn,
  user,
  setFilterDiscussion,
}) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    const res = await api.post("/auth/logout");
    console.log("logout response: ", res?.data);
    setIsLoggedIn(false);
    navigate(`/auth`, { replace: true });
  };
  useEffect(() => {
    const searchKey = async () => {
      try {
        const res = await api.get(`/discussion?search=${search}`);
        console.log("search res: ", res?.data);
        setFilterDiscussion(res?.data?.discussions);
      } catch (e) {
        console.log("search error: ", e?.response?.data?.msg);
      }
    };
    searchKey();
  }, [search]);
  console.log("search: ", search);
  useEffect(() => {
    setLoading(false);
  }, [location?.pathname]);

  return (
    <nav className="my-3">
      <div className="container">
        <div className="row">
          {/* button - heading div */}
          <div className="col-lg-3 col-12 col-md-4">
            <button
              onClick={() => {
                if (location.pathname !== "/") {
                  setLoading(true);
                  navigate("/");
                }
              }}
              className="btn btn-outline-primary me-5"
            >
              <GraduationCap style={{ height: "2rem" }} className="p-0" />
              <span className="ms-2">
                {loading ? "Discussion..." : "Discussion"}
              </span>
            </button>
          </div>
          {/* search div */}
          <div className="col-lg-3 col-12 col-md-4 d-flex align-item-center">
            <input
              placeholder="Search Discussion"
              className="form-control"
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => {
                if (location.pathname === "/discussion-form") {
                  return; // do nothing
                }
                if (location.pathname === "/") {
                  setLoading(true);
                  navigate("/discussion-form", {
                    state: { user, edit: false },
                  });
                } else {
                  navigate("/");
                }
              }}
              className="btn btn-outline-primary ms-2 btn-sm"
              style={{ width: "15rem" }}
            >
              {loading ? "Going to Form..." : "Create Discussion"}
            </button>
          </div>
          {/* notifiction and meeting */}

          {/* login - logout divs and other 3*/}
          <div className="col-6 d-flex justify-content-end">
            <div
              className="mx-auto d-flex border rounded"
              style={{ width: "25rem" }}
            >
              <ul className="d-flex justify-content-around w-100 list-unstyled g-5 m-0 p-0 align-items-center">
                <li>Notifications</li>
                <li>
                  <Link>Meeting</Link>
                </li>
                <li>Messages</li>
              </ul>
            </div>
            {isLoggedIn ? (
              <button
                className="btn btn-outline-danger ms-2"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => navigate("/auth", { state: { login: false } })}
                >
                  Register
                </button>
                <button
                  className="btn btn-outline-danger ms-3"
                  onClick={() => navigate("/auth", { state: { login: true } })}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
