import { useState } from "react";
import { UserContext } from "./UserContext.js";
import { useNavigate } from "react-router-dom";
export const UserContextProvider = ({ children }) => {
  const [navigateFn, setNavigateFn] = useState(null);
  const [showMsg, setShowMsg] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [filterDiscussion, setFilterDiscussion] = useState([]);
  const [userRoles, setUserRoles] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);
  const [msgType, setMsgType] = useState("success");
  const [sideChatOpen, setSideChatOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isToken, setIsToken] = useState(true);
  const [chatUsers, setChatUsers] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messagesByChat, setMessagesByChat] = useState({});

  return (
    <UserContext.Provider
      value={{
        setNavigateFn,
        navigateFn,
        showMsg,
        setShowMsg,
        chatOpen,
        setChatOpen,
        filterDiscussion,
        setFilterDiscussion,
        userRoles,
        setUserRoles,
        mobileChatOpen,
        setMobileChatOpen,
        isLoggedIn,
        setIsLoggedIn,
        msg,
        setMsg,
        user,
        setUser,
        msgType,
        setMsgType,
        sideChatOpen,
        setSideChatOpen,
        errorMsg,
        setErrorMsg,
        chatMsg,
        setChatMsg,
        messages,
        setMessages,
        activeUser,
        setActiveUser,
        loading,
        setLoading,
        isToken,
        setIsToken,
        chatUsers,
        setChatUsers,
        activeChatId,
        setActiveChatId,
        messagesByChat,
        setMessagesByChat,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
