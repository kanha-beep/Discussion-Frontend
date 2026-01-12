import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ isLoggedIn }) {
  return isLoggedIn ? <Outlet /> : <Navigate to="/auth" replace />;
}
