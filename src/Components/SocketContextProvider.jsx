import { SocketContext } from "./SocketContext.js";
import { socket } from "../../api.js";

export const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
