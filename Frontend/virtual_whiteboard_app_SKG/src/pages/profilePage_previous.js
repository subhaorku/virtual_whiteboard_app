import { io } from "socket.io-client";
import { useEffect, useState,useRef } from "react";
import { useNavigate } from "react-router-dom";

function CanvasListPage() {
  const navigate = useNavigate();
  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCanvasName, setNewCanvasName] = useState("");
  const [creating, setCreating] = useState(false);

  // 🔥 share state
  const [shareCanvasId, setShareCanvasId] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchCanvases = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3030/canvases", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (response.ok) {
          setCanvases(data);
        } else {
          setError(data.message || "Failed to fetch canvases");
          localStorage.removeItem("token");
          navigate("/");
        }
      } catch (err) {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchCanvases();
  }, [navigate]);

  const handleCreateCanvas = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    if (!newCanvasName.trim()) {
      alert("Please enter a canvas name!");
      return;
    }
    try {
      setCreating(true);
      const response = await fetch("http://localhost:3030/canvases", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCanvasName }),
      });
      const data = await response.json();
      if (response.ok) {
        setNewCanvasName("");
        // refresh list
        const res = await fetch("http://localhost:3030/canvases", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const newData = await res.json();
        setCanvases(newData);
      } else {
        alert(data.message || "Failed to create canvas");
      }
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCanvas = (canvasId) => {
    // ✅ redirect to backend load route or your frontend route
     window.location.href = `http://localhost:3030/canvases/${canvasId}`;

  };

// const handleOpenCanvas = (canvasId) => {
//     const token = localStorage.getItem("token"); 
//     const socket = io("http://localhost:3030", {
//       auth: { token }, 
//     }); 
//     socket.emit("joinCanvas", { canvasId }); // Emit joinCanvas event
//     socket.on("loadCanvas", (canvasData) => { 
//       console.log("Canvas data received:", canvasData);
//     });

//     // navigate to your canvas page if needed
//     navigate(`/canvas/${canvasId}`);
//   }; 

  const handleShareCanvas = async (canvasId) => {
    if (!shareEmail.trim()) {
      alert("Please enter an email!");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:3030/canvases/share/${canvasId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: shareEmail }),
        }
      );
      const data = await response.json();
      console.log("Share response:", data);
      if (response.ok) {
        alert("✅ Canvas shared successfully!");
        setShareEmail("");
        setShareCanvasId(null);
      } else {
        alert(`❌ ${data.error || data.message || "Failed to share canvas"}`);
      }
    } catch (error) {
       console.error("Network or unexpected error:", error);
       alert("❌ Network/server error: " + error.message);
    }
  };

  const handleDeleteCanvas = async (canvasId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    if (!window.confirm("🗑️ Are you sure you want to delete this canvas?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3030/canvases/${canvasId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Delete response:", data);

      if (response.ok) {
        alert("✅ Canvas deleted successfully!");
        // Refresh canvases list
        setCanvases((prev) => prev.filter((c) => c.canvasId !== canvasId));
      } else {
        alert(`❌ ${data.message || "Failed to delete canvas"}`);
      }
    } catch (error) {
      console.error("Network error while deleting canvas:", error);
      alert("❌ Network/server error: " + error.message);
    }
  };


  if (loading) return <p style={styles.loading}>Loading canvases...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Your Canvases</h2>

      {/* Create canvas section */}
      <div style={styles.createSection}>
        <input
          style={styles.input}
          type="text"
          placeholder="Enter new canvas name"
          value={newCanvasName}
          onChange={(e) => setNewCanvasName(e.target.value)}
        />
        <button
          style={{
            ...styles.createButton,
            ...(creating ? styles.buttonPulse : {}),
          }}
          onClick={handleCreateCanvas}
          disabled={creating}
        >
          {creating ? "Creating..." : "➕ Create Canvas"}
        </button>
      </div>

      {/* List canvases */}
      <div style={styles.canvasGrid}>
        {canvases.map((canvas) => (
          <div key={canvas._id} style={styles.card}>
            <h3 style={styles.canvasName}>{canvas.canvasName}</h3>
            <p style={styles.meta}>
              <strong>Owner:</strong> {canvas.owner.username}
            </p>
            <p style={styles.meta}>
              <strong>Email:</strong> {canvas.owner.email}
            </p>
            <p style={styles.meta}>
              <strong>Created:</strong>{" "}
              {new Date(canvas.createdAt).toLocaleString()}
            </p>
            <p style={styles.meta}>
              <strong>Updated:</strong>{" "}
              {new Date(canvas.updatedAt).toLocaleString()}
            </p>

            {/* ✅ Open Canvas Button */}
            <button
              style={styles.openButton}
              // onClick={() => handleOpenCanvas(canvas.canvasId)}
              onClick={() => navigate(`/canvas/${canvas.canvasId}`)} 
            >
              Open Canvas
            </button>

            {/* ✅ Delete Canvas Button */}
            <button
              style = {styles.deleteButton}
              onClick={() => handleDeleteCanvas(canvas.canvasId)
              }
              >
                🗑️ Delete Canvas
              </button>

            {/* ✅ Share Canvas Button */}
            <button
              style={styles.shareButton}
              onClick={() => setShareCanvasId(canvas.canvasId)}
            >
              Share Canvas
            </button>

            {/* ✅ Conditional Share Section */}
            {shareCanvasId === canvas.canvasId && (
              <div style={styles.shareSection}>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="Enter email to share"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
                <button
                  style={styles.confirmShareButton}
                  onClick={() => handleShareCanvas(canvas.canvasId)}
                >
                  Confirm Share
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        style={styles.logoutBtn}
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/");
        }}
      >
        Logout
      </button>
    </div>
  );
}

const styles = {
  page: {
    padding: "20px",
    minHeight: "100vh",
    backgroundColor: "#f0f4f8",
  },
  shareButton: {
    marginLeft: "10px",
    padding: "8px 16px",
    backgroundColor: "#ffc107",
    color: "#000",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  shareSection: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  confirmShareButton: {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  deleteButton: {
    marginTop: "10px",
    marginLeft: "10px",
    padding: "8px 16px",
    backgroundColor: "#dc3545", // red color
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  title: {
    fontSize: "28px",
    marginBottom: "20px",
    color: "#333",
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
  createSection: {
    marginBottom: "30px",
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    flex: "1",
  },
  createButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "transform 0.2s ease",
  },
  buttonPulse: {
    animation: "pulse 1s infinite",
  },
  canvasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease",
  },
  canvasName: {
    fontSize: "20px",
    marginBottom: "10px",
    color: "#007bff",
  },
  meta: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "6px",
  },
  openButton: {
    marginTop: "10px",
    padding: "8px 16px",
    backgroundColor: "#17a2b8",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  logoutBtn: {
    marginTop: "30px",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default CanvasListPage;
