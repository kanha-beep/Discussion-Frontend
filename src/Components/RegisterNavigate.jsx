import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

const RegisterNavigate = () => {
  const navigate = useNavigate();
  const { setNavigateFn } = useContext(UserContext);

  useEffect(() => {
    setNavigateFn(() => navigate);
  }, [navigate]);

  return null;
};

export default RegisterNavigate;
