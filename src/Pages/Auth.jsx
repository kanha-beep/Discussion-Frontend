import { useState } from "react";
import { api } from "../../api";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const res = await api.post(endpoint, formData);
      
      alert(res.data.msg);
      navigate("/");
    } catch (error) {
      alert(error?.response?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", password: "" });
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ width: "400px" }}>
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4">
            {isLogin ? "Login" : "Register"}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Processing..." : (isLogin ? "Login" : "Register")}
            </button>
          </form>
          
          <div className="text-center">
            <span className="text-muted">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button 
              type="button"
              className="btn btn-link p-0"
              onClick={toggleMode}
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}