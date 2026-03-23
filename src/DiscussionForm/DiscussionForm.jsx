import React, { useContext, useEffect, useState } from "react";
import { api } from "../../api.js";
import { useNavigate } from "react-router-dom";
import { handleChange } from "../Components/HandleChange.js";
import { UserContext } from "../Components/UserContext.js";

export default function DiscussionForm() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [disForm, setDisForm] = useState({
    email: user?.email || "",
    keywords: [],
    remarks: "",
  });
  const [keyList, setKeyList] = useState("");

  useEffect(() => {
    if (!user?.email) return;
    setDisForm((prev) => ({
      ...prev,
      email: user.email,
    }));
  }, [user?.email]);

  const inputBox = "form-control rounded-3 form-control-lg";
  const labelBox = "form-label fw-semibold";

  const HandleChange = (e) => {
    handleChange(e, setDisForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/discussion/new", disForm);
      console.log("response: ", response?.data);
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
    <div className="min-vh-100 d-flex align-items-center mt-5 pt-4 pb-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-11 col-sm-10 col-md-8 col-lg-7">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-sm-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-dark mb-2">Create Discussion</h2>
                </div>

                <form onSubmit={handleSubmit} className="row">
            

                  <div className="mb-3">
                    <label className={labelBox}>
                      <i className="fas fa-tags me-2"></i>Keywords
                    </label>
                    <div className="form-group d-flex gap-2">
                      <input
                        className={inputBox}
                        onChange={(e) => setKeyList(e.target.value)}
                        value={keyList}
                        name="keyList"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddKeywords();
                          }
                        }}
                      />
                      <button
                        onClick={handleAddKeywords}
                        type="button"
                        className="btn btn-primary btn-sm px-3"
                      >
                        Add
                      </button>
                    </div>

                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {disForm.keywords.map((k) => (
                        <span key={k} className="badge bg-info rounded-3 px-3 py-2">
                          {k}
                          <button
                            type="button"
                            className="btn btn-sm btn-light ms-2 rounded-5"
                            onClick={() => removeKeyword(k)}
                          >
                            x
                          </button>
                        </span>
                      ))}
                    </div>

                    <small className="text-muted">Comma separated values</small>
                  </div>

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

                  <button className="btn btn-primary btn-lg w-100 rounded-3">
                    <i className="fas fa-paper-plane me-2"></i>
                    Create
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
