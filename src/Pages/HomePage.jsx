import { useEffect, useState } from "react";
import { api } from "../../api.js";
import { useLocation, useNavigate } from "react-router-dom";
import { Loading } from "../Components/Loading.jsx";
import { MainPageHeading } from "../Pages/MainPageHeading.jsx";
import { Hand, TruckElectricIcon } from "lucide-react";
export default function HomePage({
  user,
  filterDiscussion,
  setFilterDiscussion,
}) {
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isToken, setIsToken] = useState(true);
  const [allDiscussions, setAllDiscussions] = useState([]);
  const [chatList, setChatList] = useState(false);
  const [sortOrder, setSortOrder] = useState(1);
  const getAllDiscussions = async () => {
    setLoading(true);
    try {
      setLoading(true);
      const res = await api.get(`/discussion?sort=${sortOrder}`);
      console.log("got all classes to render: ", res?.data?.discussions || []);
      setFilterDiscussion(res?.data?.discussions);
      setLoading(false);
      setIsToken(true);
    } catch (e) {
      if (e?.response?.status === 400) setIsToken(true);
      console.log("error in getting all classes: ", e?.response?.data?.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllDiscussions();
  }, [sortOrder]);

  console.log("token: ", location?.state?.refresh);
  if (loading) return <Loading loading={loading} />;
  const handleDeleteDiscussion = async (i) => {
    try {
      console.log("delete: ", i);
      setLoading(TruckElectricIcon);
      const res = await api.delete(`/discussion/${i}`);
      // setTimeout(() => getAllDiscussions(), 1000);
      setFilterDiscussion((prev) => prev.filter((d) => d._id !== i));
      // setAllDiscussions((prev) => prev.filter((d) => d._id !== i));
      console.log("delete: ", res);
    } catch (e) {
      console.log("error while deleting: ", e?.response?.data);
      setErrorMsg("Please login First");
      setTimeout(() => navigate("/auth"), 3000);
    } finally {
      setLoading(false);
    }
  };
  console.log("sort number: ", sortOrder);
  return (
    <>
      <MainPageHeading />
      {/* main div which will have 3 dives */}
      <div className="dropdown my-2">
        <button
          className="btn btn-secondary dropdown-toggle"
          data-bs-toggle="dropdown"
        >
          Sort
        </button>
        <ul className="dropdown-menu">
          <li>
            <button className="dropdown-item" onClick={() => setSortOrder(-1)}>
              Sort by Newest
            </button>
          </li>
          <li>
            <button className="dropdown-item" onClick={() => setSortOrder(1)}>
              Sort by Oldest
            </button>
          </li>
        </ul>
      </div>

      {/* <select
        className="form-select"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      >
        <option value={-1} className="dropdown-item">
          Sort by Newest
        </option>
        <option value={1} className="dropdown-item">
          Sort by Oldest
        </option>
      </select> */}
      <div className="p-0 m-0" style={{ height: "100vh" }}>
        {isToken ? (
          <>
            <div className="row">
              {errorMsg !== "" && (
                <div
                  className=" alert alert-info col-3 mx-auto position-fixed top-0 start-50 translate-middle-x mt-3"
                  role="alert"
                  style={{ zIndex: 1050 }}
                >
                  {errorMsg}
                </div>
              )}
            </div>
            <div className="row " style={{ height: "100vh" }}>
              {/* first div - left profile */}
              <div className="col-md-2 col-12 col-lg-3 border rounded px-0">
                <ul className="list-group">
                  <li className="list-group-item">Name: {user?.firstName}</li>
                  {/* <li className="list-group-item">
                    Profession: {user?.profession}
                  </li> */}
                  <li className="list-group-item text-truncate">
                    Email: {user?.email}
                  </li>
                  <button
                    onClick={() => navigate(`/profile/${user?._id}`)}
                    className="btn btn-outline-primary"
                  >
                    <span className="ms-2">Go to profile</span>
                  </button>
                </ul>
              </div>
              {/* second div - all posts */}
              <div
                style={{ height: "100vh", overflowY: "auto" }}
                className="col-md-8 col-12 col-lg-6 border rounded"
              >
                {filterDiscussion.map((d) => (
                  <div className="card my-2 p-0" key={d?._id}>
                    {/* header */}
                    <div className="card-header d-flex justify-content-between">
                      <span>By: {d?.email}</span>
                      <span className="badge bg-primary rounded-pill">
                        {d?.status || "Open"}
                      </span>
                    </div>
                    {/* body */}
                    <div className="card-body border">
                      <div className="card-title d-flex">
                        <span className="flex-shrink-0">
                          Discussion Topics:
                        </span>
                        <span className="flex-grow-1 ms-2">
                          {/* {d?.keywords.map((k) => k + " , ")}{" "} */}
                          {d.keywords.join(", ")}
                        </span>
                      </div>
                      <p className="card-text">{d?.remarks}</p>
                    </div>
                    {/* footer */}
                    <div className="card-footer d-flex justify-content-between">
                      <span className="badge bg-warning d-flex align-items-center">
                        {new Date(d?.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                      <div>
                        <button
                          onClick={() =>
                            navigate(`/discussion-form-edit/${d?._id}`)
                          }
                          className="btn btn-light me-3"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteDiscussion(d?._id)}
                          className="btn btn-danger"
                        >
                          {loading ? (
                            <span className="spinner-border spinner-border-sm me-2" />
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
                          {/* <div className="alert alert-danger alert-heading">Please login</div> */}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* third div - right suggestions */}
              <div className=" col-md-2 col-12 col-lg-3 border rounded px-0 ">
                {/* advt */}
                <ul className="list-group p-0">
                  <li className="list-group-item">Suggestion 1</li>
                  <li className="list-group-item">Suggestion 2</li>
                  <li className="list-group-item">Suggestion 3</li>
                </ul>
                {chatList && (
                  <div className=" mt-3">
                    <ul
                      className="list-group gap-3"
                      style={{ bottom: "3rem", width: "23rem" }}
                    >
                      <li className="list-group-item">Chat 1</li>
                      <li className="list-group-item">Chat 2</li>
                      <li className="list-group-item">Chat 3</li>

                      <li className="list-group-item">Chat 1</li>
                      <li className="list-group-item">Chat 2</li>
                      <li className="list-group-item">Chat 3</li>
                    </ul>
                  </div>
                )}
                {/* chats button */}
                <div
                  className="bg-danger dropup"
                  style={{
                    position: "absolute",
                    bottom: "0",
                    width: "23.5rem",
                    textAlign: "center",
                    zIndex: 2000,
                  }}
                >
                  <button
                    className="btn btn-primary w-100 dropdown-toggle"
                    // data-bs-toggle="dropdown"
                    // aria-expanded="false"
                    onClick={() => setChatList(!chatList)}
                  >
                    Open Chats
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          "Please Log In"
        )}
      </div>
    </>
  );
}
