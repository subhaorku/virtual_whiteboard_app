// import { useEffect, useState, useRef,useContext } from "react";
// import boardContext from "../components/store/board-context";

// import { useParams, useNavigate } from "react-router-dom";
// import Board from "../components/Board";
// import ToolBar from "../components/ToolBar";
// import ToolBox from "../components/ToolBox";
// import BoardProvider from "../components/store/BoardProvider";
// import ToolBoxProvider from "../components/store/ToolBoxProvider";
// import { io } from "socket.io-client";
// import { updateCanvas } from "../utils/api"; // Assuming you have an API utility for updating canvas
// function CanvasViewerPage() {
//   // Context to access board state and actions
//   const setElementRef = useRef(null);
//   const { canvasId } = useParams();
//   const navigate = useNavigate();
//   const [canvas, setCanvas] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const socketRef = useRef(null);
  

//   // 💬 for demo message input
//   const [chatMsg, setChatMsg] = useState("");
//    useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       navigate("/");
//       return;
//     }

//    const socket = io("http://localhost:3030", {
//       transports: ["websocket"],
//       auth: {
//         token: token,
//       },
//     });
//    socketRef.current = socket;
//    socket.on("connect", () => {
//       console.log("✅ Connected to WebSocket server:", socket.id);
//       // join the canvas room
//       socket.emit("joinCanvas", canvasId);
//     });


//    socket.on("unauthorized", (msg) => {
//       alert(`❌ ${msg}`);
//       socket.disconnect();
//       navigate("/");
//     });

//    socket.on("loadCanvas", (canvasData) => {
//       console.log("📄 Loaded canvas data:", canvasData);
//       setCanvas(canvasData);
//       setLoading(false);
//     });

// //    socket.on("drawUpdate", (updateData) => {
// //       console.log("✏️ Received drawing update:", updateData);
// //       // TODO: integrate updateData into your Board state
// //     });

//     socket.on("receiveDrawingUpdate", (data) => {
//     console.log("✏️ Received drawing update from others:", data);
//     // data.elements is the latest elements array
//     // Update your BoardProvider context or local state
//     // Example if you use a setElements from context:
//     if (setElementRef.current) {
//       setElementRef.current(data.elements);
//     }
//     });

//     socket.on("disconnect", () => {
//       console.log("❌ Disconnected from WebSocket server");
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [canvasId, navigate]);




//   const sendMessage = () => {
//     if (socketRef.current && chatMsg.trim()) {
//       socketRef.current.emit("message", chatMsg);
//       setChatMsg("");
//     }
//   };

//   const sendDrawUpdate = (updatedElements) => {
//     if (socketRef.current) {
//       socketRef.current.emit("drawUpdate", canvasId, { elements: updatedElements });
//     }   
//     };

//   if (loading) return <p style={styles.loading}>Loading canvas...</p>;
//   if (error) return <p style={styles.error}>{error}</p>;
//   if (!canvas) return null;

//   return (
//     <div style={styles.wrapper}>
//       <div style={styles.header}>
//         <h2 style={styles.title}>{canvas.canvasName}</h2>
//         <p style={styles.meta}>
//           <strong>Owner:</strong> {canvas.owner.username} ({canvas.owner.email})
//         </p>
//         <button style={styles.backBtn} onClick={() => navigate(-1)}>
//           🔙 Back to list
//         </button>
//       </div>

//       {/* Your Board/ToolBar/ToolBox */}
//       <BoardProvider initialCanvas={canvas} sendDrawUpdate={sendDrawUpdate}
//       registerSetElements={(fn) => {setElementRef.current = fn;}}>
//         <ToolBoxProvider>
//           <ToolBar />
//           <Board />
//           <ToolBox />
//         </ToolBoxProvider>
//       </BoardProvider>

//       {/* 💬 Simple message sender for testing */}
//       <div style={{ marginTop: "20px" }}>
//         <input
//           type="text"
//           value={chatMsg}
//           onChange={(e) => setChatMsg(e.target.value)}
//           placeholder="Type a message"
//           style={{ padding: "8px", borderRadius: "6px", marginRight: "10px" }}
//         />
//         <button onClick={sendMessage} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#17a2b8", color: "#fff", border: "none", cursor: "pointer" }}>
//           Send
//         </button>
//       </div>
//     </div>
//   );

// const styles = {
//   wrapper: {
//     minHeight: "100vh",
//     backgroundColor: "#f0f4f8",
//     padding: "20px",
//   },
//   header: {
//     marginBottom: "20px",
//     padding: "15px",
//     backgroundColor: "#fff",
//     borderRadius: "8px",
//     boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//   },
//   title: {
//     fontSize: "24px",
//     marginBottom: "10px",
//     color: "#007bff",
//   },
//   meta: {
//     fontSize: "16px",
//     color: "#555",
//   },
//   backBtn: {
//     marginTop: "15px",
//     padding: "8px 16px",
//     backgroundColor: "#28a745",
//     color: "#fff",
//     border: "none",
//     borderRadius: "6px",
//     cursor: "pointer",
//     fontSize: "14px",
//   },
//   loading: {
//     textAlign: "center",
//     marginTop: "50px",
//     fontSize: "18px",
//   },
//   error: {
//     color: "red",
//     textAlign: "center",
//     marginTop: "50px",
//     fontSize: "18px",
//   },
// };

// export default CanvasViewerPage;

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Board from "../components/Board";
import ToolBar from "../components/ToolBar";
import ToolBox from "../components/ToolBox";
import BoardProvider from "../components/store/BoardProvider";
import ToolBoxProvider from "../components/store/ToolBoxProvider";
import { io } from "socket.io-client";

function CanvasViewerPage() {
  const { canvasId } = useParams();
  const navigate = useNavigate();
  const [canvas, setCanvas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const setElementRef = useRef(null);  // Renamed for clarity; was already correct
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const socket = io("https://virtual-whiteboard-app-1.onrender.com", {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server:", socket.id);
      socket.emit("joinCanvas", canvasId);
    });

    socket.on("unauthorized", (msg) => {
      alert(`❌ ${msg}`);
      socket.disconnect();
      navigate("/");
    });

    socket.on("loadCanvas", (canvasData) => {
      console.log("📄 Loaded canvas data:", canvasData);
      setCanvas(canvasData);
      setLoading(false);
    });

    socket.on("receiveDrawingUpdate", (data) => {
      console.log("✏️ Received drawing update from others:", data);
      if (setElementRef.current) {
        setElementRef.current(data.elements);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket server");
    });

    return () => {
      socket.disconnect();
    };
  }, [canvasId, navigate]);

  const sendMessage = () => {
    if (socketRef.current && chatMsg.trim()) {
      socketRef.current.emit("message", chatMsg);
      setChatMsg("");
    }
  };

  const sendDrawUpdate = (updatedElements) => {
    if (socketRef.current) {
      socketRef.current.emit("drawUpdate", canvasId, { elements: updatedElements });
    }
  };

  if (loading) return <p style={styles.loading}>Loading canvas...</p>;
  if (error) return <p style={styles.error}>{error}</p>;
  if (!canvas) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h2 style={styles.title}>{canvas.canvasName}</h2>
        <p style={styles.meta}>
          <strong>Owner:</strong> {canvas.owner.username} ({canvas.owner.email})
        </p>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          🔙 Back to list
        </button>
      </div>

      <BoardProvider initialCanvas={canvas} sendDrawUpdate={sendDrawUpdate} registerSetElements={(fn) => { setElementRef.current = fn; }}>
        <ToolBoxProvider>
          <ToolBar />
          <Board />
          <ToolBox />
        </ToolBoxProvider>
      </BoardProvider>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          value={chatMsg}
          onChange={(e) => setChatMsg(e.target.value)}
          placeholder="Type a message"
          style={{ padding: "8px", borderRadius: "6px", marginRight: "10px" }}
        />
        <button onClick={sendMessage} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#17a2b8", color: "#fff", border: "none", cursor: "pointer" }}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: "100vh", backgroundColor: "#f0f4f8", padding: "20px" },
  header: { marginBottom: "20px", padding: "15px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" },
  title: { fontSize: "24px", marginBottom: "10px", color: "#007bff" },
  meta: { fontSize: "16px", color: "#555" },
  backBtn: { marginTop: "15px", padding: "8px 16px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" },
  loading: { textAlign: "center", marginTop: "50px", fontSize: "18px" },
  error: { color: "red", textAlign: "center", marginTop: "50px", fontSize: "18px" },
};

export default CanvasViewerPage;