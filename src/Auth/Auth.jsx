import { useNavigate, Link, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { api } from "../../api.js";
import { WrapAsync } from "../Utils/WrapAsync.js";
import { UserContext } from "../Components/UserContext.js";
export default function Auth({ checkAuth }) {
  const {
    setIsLoggedIn,
    msg,
    setMsg,
    msgType,
    setMsgType,
    userRoles,
    setUserRoles,
  } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [viewPage, setViewPage] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profession: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const loginUrl = location?.state?.login;
  console.log("loginUrl: ", loginUrl);
  // const role = location?.state;
  const navigate = useNavigate();
  const [btnDisable, setBtnDisable] = useState(false);
  const [isLogin, setIsLogin] = useState(loginUrl);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };
  const tempEmail = `${formData.firstName}.${formData.lastName}@${formData.profession}.ep`;

  const handleUserAuth = WrapAsync(
    async () => {
      if (isLogin) {
        setLoading(true);
        setBtnDisable(true);
        console.log("login starts from frontend");
        try {
          const res = await api.post("/api/auth/login", { ...formData, email });
          // console.log("user logged in: ", res?.data);
          await checkAuth();
          return navigate("/");
        } catch (e) {
          console.log(
            "error in login: ",
            e?.response?.data?.msg,
            e?.response?.status,
          );
          if (e?.response?.status === 401) setIsLogin(false);
          alert("Please Register");
        } finally {
          setBtnDisable(false);
          setLoading(false);
        }
      } else {
        try {
          setBtnDisable(true);
          setLoading(true);
          const res = await api.post("/api/auth/register", {
            ...formData,
            email: email,
          });
          console.log("user registered in: ", res?.data);
          await checkAuth();
          setViewPage("congratulations");
        } catch (e) {
          console.log("error in register: ", e?.response?.data?.message);
        } finally {
          setBtnDisable(false);
          setLoading(false);
        }
      }
    },
    setMsg,
    setMsgType,
  );
  // const handleOwnerAuth = async () => {
  //   if (isLogin) {
  //     try {
  //       const res = await api.post("/auth/owner/login", { formData, email });
  //       console.log("user logged in: ", res?.data);
  //       setIsLoggedIn(true);
  //       navigate("/all-slots");
  //     } catch (e) {
  //       console.log("error in login: ", e?.response?.data?.message);
  //       setIsLogin(false);
  //     }
  //   } else {
  //     try {
  //       const res = await api.post("/auth/owner/register", formData);
  //       console.log("user registered in: ", res?.data);
  //       localStorage.setItem("user", JSON.stringify(res?.data?.user));
  //       localStorage.setItem("token", res?.data?.token);
  //       setIsLoggedIn(true);
  //       navigate("/all-slots");
  //     } catch (e) {
  //       console.log("error in login: ", e?.response?.data?.message);
  //       setIsLogin(true);
  //     }
  //   }
  // };
  const inputBox = "form-control rounded-3 form-control-lg";
  const labelBox = "form-label fw-semibold";
  useEffect(() => {
    if (!isLogin) setEmail(tempEmail);
    else setEmail("");
  }, [tempEmail, isLogin]);

  const [verified, setVerified] = useState(false);
  const handleVerifyEmail = async () => {
    console.log("verify email: ", email);
    try {
      const res = await api.post("/api/auth/check-email", { email: email });
      console.log("email verified: ", res?.data);
      setVerified(true);
    } catch (e) {
      if (e?.response?.status === 402) return alert("Email already exists");

      console.log("error in verify email: ", e?.response?.data?.message);
      setVerified(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center bg-gradient"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-8">
            <div className="card shadow-lg border-0 rounded-4 mt-5">
              {/* Everything is inside card body */}
              <div className="card-head py-5">
                {" "}
                <div className="text-center">
                  <i className="fas fa-plane text-primary fs-1 mb-3"></i>
                  {/* <h2 className="fw-bold text-dark mb-2">Discussion App</h2> */}
                  {/* <p className="text-muted">
                    {role === "owner" ? "Owner Portal" : "User Portal"}
                  </p> */}
                </div>
              </div>
              {viewPage === "congratulations" && (
                <div
                  className="card-body"
                  style={{ marginTop: "-5rem", minHeight: "20rem" }}
                >
                  <div className="row">
                    <div
                      className="col-12 position-relative"
                      style={{ minHeight: "20rem" }}
                    >
                      Congratulations, you have your landmark under your name.
                      Go and share your email with your colleagues
                    </div>
                    <div className="d-flex justify-content-end col-12">
                      <div>
                        <button
                          onClick={() => navigate("/")}
                          className="btn btn-outline-success"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {viewPage !== "congratulations" && (
                <div className="card-body" style={{ marginTop: "-5rem" }}>
                  {/* buttons */}
                  <div className="d-flex mb-4 bg-light rounded-3 p-1">
                    <button
                      type="button"
                      className={`btn flex-fill ${
                        isLogin ? "btn-primary" : "btn-light"
                      } rounded-3`}
                      onClick={() => setIsLogin(true)}
                    >
                      <i className="fas fa-sign-in-alt me-2"></i>Login
                    </button>
                    <button
                      type="button"
                      className={`btn flex-fill ${
                        !isLogin ? "btn-primary" : "btn-light"
                      } rounded-3`}
                      onClick={() => setIsLogin(false)}
                    >
                      <i className="fas fa-user-plus me-2"></i>Register
                    </button>
                  </div>

                  <form
                    className="row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUserAuth();
                    }}
                  >
                    {!isLogin && (
                      <>
                        <div className="row">
                          {/* first name */}
                          <div className="mb-3 col-lg-6 col-12">
                            <label className={labelBox}>First Name</label>
                            <input
                              type="text"
                              placeholder="Enter First Name"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                              className={inputBox}
                            />
                          </div>
                          {/* last name */}
                          <div className="mb-3 col-lg-6 col-12">
                            <label className={labelBox}>Last Name</label>
                            <input
                              type="text"
                              placeholder="Enter Last Name"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                              className={inputBox}
                            />
                          </div>
                        </div>
                        {/* profession */}
                        <div className="mb-3">
                          <label className={labelBox}>Profession</label>
                          <input
                            className={inputBox}
                            type="text"
                            placeholder="Enter your Profession"
                            name="profession"
                            value={formData.profession}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </>
                    )}
                    {/* email */}
                    <div className="mb-3">
                      <label className={labelBox}>
                        <i className="fas fa-envelope me-2"></i>Email Address
                      </label>

                      <div className="d-flex">
                        <input
                          type="email"
                          className={inputBox}
                          placeholder={email || "Enter your email"}
                          name="email"
                          value={email}
                          // value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        {/* verify button */}
                        {!isLogin && (
                          <button
                            className="btn btn-success d-flex"
                            onClick={handleVerifyEmail}
                            type="button"
                            disabled={verified}
                          >
                            {verified ? (
                              <>
                                <span className="btn btn-success">✔</span>
                                <span className="mt-2">Verified</span>
                              </>
                            ) : (
                              "Verify"
                            )}
                          </button>
                        )}
                      </div>

                      {/* example email */}
                      {!isLogin && (
                        <div className="d-flex align-items-center">
                          <label className={`${labelBox} ms-3`}>Ex</label>
                          <input
                            className="form-control ms-3 bg-light"
                            value={`${tempEmail}`}
                            onChange={(e) => e.target.value}
                          />
                        </div>
                      )}
                    </div>
                    {/* password */}
                    <div className="mb-3">
                      <label className={labelBox}>
                        <i className="fas fa-lock me-2"></i>Password
                      </label>
                      <input
                        type="password"
                        className={inputBox}
                        placeholder="Enter your password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>{" "}
                    {/* confirm password */}
                    {!isLogin && (
                      <div className="mb-3">
                        <label className={labelBox}>
                          <i className="fas fa-lock me-2"></i>Confirm Password
                        </label>
                        <input
                          type="password"
                          className={inputBox}
                          placeholder="Confirm your password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 rounded-3 mb-3"
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2" />
                      ) : (
                        ""
                      )}
                      <i
                        className={`fas ${
                          isLogin ? "fa-sign-in-alt" : "fa-user-plus"
                        } me-2`}
                      ></i>
                      {isLogin ? "Login" : "Register"}
                    </button>
                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none"
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setBtnDisable(false);
                        }}
                        disabled={btnDisable}
                      >
                        {isLogin
                          ? "Don't have an account? Create one"
                          : "Already have an account? Login"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
