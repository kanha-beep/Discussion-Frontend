import axios from "axios";
import React from "react";
import { io } from "socket.io-client";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
})
export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
});
socket.on("connect", () => {
  console.log("connected", socket.id);
});

socket.on("receive-message", (msg) => {
  window.dispatchEvent(
    new CustomEvent("socket:receive-message", {
      detail: msg
    })
  );
});