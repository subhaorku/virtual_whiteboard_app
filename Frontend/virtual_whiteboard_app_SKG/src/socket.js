// socket.js
import { io } from "socket.io-client";

const socket = io("https://virtual-whiteboard-app-1.onrender.com", {
  auth: {
    token: localStorage.getItem("token"),
  },
  transports: ["websocket"],
});

export default socket;
