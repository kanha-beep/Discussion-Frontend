import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { api } from "../../api.js";
import { useNavigate, useParams } from "react-router-dom";
import { handleChange } from "../Components/HandleChange.js";
import { UserContext } from "../Components/UserContext.js";
export default function DiscussionFormEdit() {
  const {user} = useContext(UserContext)
  const { discussionId } = useParams();
  const [disForm, setDisForm] = useState({
    email: "",
    keywords: [],
    remarks: "",
  });
  const getSingleDiscussion = async () => {
    try {
      console.log("discussion id: ", discussionId);
      const res = await api.get(`/api/discussion/${discussionId}`);
      setDisForm(res?.data?.discussion);
      console.log("single discussion: ", res?.data?.discussion);
    } catch (e) {
      console.log("error in single discussion: ", e?.response?.data?.msg);
    }
  };
  useEffect(() => {
    if (!discussionId) return;
    getSingleDiscussion();
  }, [discussionId]);

  const [keyList, setKeyList] = useState([]);
  const navigate = useNavigate();

  const inputBox = "form-control rounded-3 form-control-lg";
  const labelBox = "form-label fw-semibold";
  const HandleChange = (e) => {
    handleChange(e, setDisForm);
  };
  console.log("form ready: ", disForm);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(`/api/discussion/${discussionId}/edit`, disForm);
      console.log("response: ", response?.data?.discussion);
      navigate("/", { state: { refresh: true } });
    } catch (error) {
      console.log("error: ", error?.response?.data?.message);
    }
  };
  const handleAddKeywords = () => {
    const incoming = keyList
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    setDisForm((prev) => ({
      ...prev,
      keywords: [
        ...prev.keywords,
        ...incoming.filter((k) => !prev.keywords.includes(k)),
      ],
    }));

    setKeyList("");
  };
  const removeKeyword = (k) => {
    setDisForm((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((item) => item !== k),
    }));
  };

  return (
    <div className="min-vh-100 d-flex align-items-center mt-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-8">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-dark mb-2">Edit Discussion</h2>
                  {/* <p className="text-muted">Start a new discussion</p> */}
                </div>

                <form onSubmit={handleSubmit} className="row">
                  {/* Email */}
                  <div className="mb-3">
                    <label className={labelBox}>
                      <i className="fas fa-tags me-2"></i>Keywords
                    </label>
                    <div className="form-group d-flex">
                      <input
                        className={inputBox}
                        onChange={(e) => setKeyList(e.target.value)}
                        value={keyList}
                        name="keyList"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddKeywords(); // or setKeyList("")
                          }
                        }}
                      />
                      <button
                        onClick={handleAddKeywords}
                        type="button"
                        className="btn btn-primary btn-sm"
                      >
                        Add
                      </button>
                    </div>
                    {/* <div>{disForm.keywords.join(" , ")}</div> */}
                    <div className="mt-2">
                      {disForm.keywords.map((k) => (
                        <span key={k} className="badge bg-info me-2 rounded-3">
                          {k}
                          <button
                            type="button"
                            className="btn btn-sm btn-light ms-2 rounded-5"
                            onClick={() => removeKeyword(k)}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    <small className="text-muted">Comma separated values</small>
                    {/* <input value={allKeywords}/> */}
                  </div>

                  {/* Remarks */}
                  <div className="mb-4">
                    <label className={labelBox}>
                      <i className="fas fa-comment me-2"></i>Remarks
                    </label>
                    <textarea
                      rows="4"
                      className={inputBox}
                      value={disForm.remarks}
                      onChange={HandleChange}
                      placeholder="Write your discussion remarks..."
                      name="remarks"
                      required
                    />
                  </div>

                  {/* Submit */}
                  <button className="btn btn-primary btn-lg w-100 rounded-3">
                    <i className="fas fa-paper-plane me-2"></i>
                    Update
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
