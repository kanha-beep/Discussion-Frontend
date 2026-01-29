import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { UserContext } from "../Components/UserContext";

export default function ProtectedRoute() {
  const { setUserRoles, isLoggedIn } = useContext(UserContext);
  return isLoggedIn ? <Outlet /> : <Navigate to="/auth" replace />;
}
