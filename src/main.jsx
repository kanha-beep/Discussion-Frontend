import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { UserContextProvider } from "./Components/UserContextProvider.jsx";
import { SocketProvider } from "./Components/SocketContextProvider.jsx";
import RegisterNavigate from "./Components/RegisterNavigate.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <UserContextProvider>
    <SocketProvider>
      <BrowserRouter>
        <RegisterNavigate />
        <App />
      </BrowserRouter>
    </SocketProvider>
  </UserContextProvider>,
);
