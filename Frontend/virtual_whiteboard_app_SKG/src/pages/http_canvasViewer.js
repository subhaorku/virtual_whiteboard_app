import { useEffect, useState, useRef} from "react";
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
  const socketRef = useRef(null);
  useEffect(() => {
    const fetchCanvas = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/"); // not logged in
        return;
      }
      try {
        const response = await fetch(`http://localhost:3030/canvases/load/${canvasId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (response.ok) {
          setCanvas(data);
        } else {
          setError(data.message || "Failed to load canvas");
        }
      } catch (err) {
        setError("Something went wrong while loading canvas.");
      } finally {
        setLoading(false);
      }
    };
    fetchCanvas();
  }, [canvasId, navigate]);


  if (loading) return <p style={styles.loading}>Loading canvas...</p>;
  if (error) return <p style={styles.error}>{error}</p>;
  if (!canvas) return null;

  return (
    <div style={styles.wrapper}>
      {/* Canvas Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>{canvas.canvasName}</h2>
        <p style={styles.meta}>
          <strong>Owner:</strong> {canvas.owner.username} (
          {canvas.owner.email})
        </p>
        <button
          style={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          🔙 Back to list
        </button>
      </div>

      {/* Your Board/ToolBar/ToolBox layout */}
      <BoardProvider initialCanvas={canvas}>
        <ToolBoxProvider>
          <ToolBar />
          <Board />
          <ToolBox />
        </ToolBoxProvider>
      </BoardProvider>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
    padding: "20px",
  },
  header: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "24px",
    marginBottom: "10px",
    color: "#007bff",
  },
  meta: {
    fontSize: "16px",
    color: "#555",
  },
  backBtn: {
    marginTop: "15px",
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  loading: {
    textAlign: "center",
    marginTop: "50px",
    fontSize: "18px",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: "50px",
    fontSize: "18px",
  },
};

export default CanvasViewerPage;
