import { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

function CanvasListPage() {
  const navigate = useNavigate();
  const [canvases, setCanvases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCanvasName, setNewCanvasName] = useState("");
  const [creating, setCreating] = useState(false);
  const [shareCanvasId, setShareCanvasId] = useState(null);
  const [shareEmail, setShareEmail] = useState("");

  useEffect(() => {
    const fetchCanvases = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        setLoading(true);
        const response = await fetch("https://virtual-whiteboard-app-1.onrender.com/canvases", {
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
      const response = await fetch("https://virtual-whiteboard-app-1.onrender.com/canvases", {
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
        const res = await fetch("https://virtual-whiteboard-app-1.onrender.com/canvases", {
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

  const handleShareCanvas = async (canvasId) => {
    if (!shareEmail.trim()) {
      alert("Please enter an email!");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://virtual-whiteboard-app-1.onrender.com/canvases/share/${canvasId}`,
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
      if (response.ok) {
        alert("✅ Canvas shared successfully!");
        setShareEmail("");
        setShareCanvasId(null);
      } else {
        alert(`❌ ${data.error || data.message || "Failed to share canvas"}`);
      }
    } catch (error) {
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
      const response = await fetch(`https://virtual-whiteboard-app-1.onrender.com/canvases/${canvasId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert("✅ Canvas deleted successfully!");
        setCanvases((prev) => prev.filter((c) => c.canvasId !== canvasId));
      } else {
        alert(`❌ ${data.message || "Failed to delete canvas"}`);
      }
    } catch (error) {
      alert("❌ Network/server error: " + error.message);
    }
  };

  if (loading) return <p style={styles.loading}>Loading canvases...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Your Canvases</h2>

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

      <div style={styles.canvasGrid}>
        {canvases.map((canvas) => (
          <div key={canvas._id} style={styles.card}>
            <h3 style={styles.canvasName}>{canvas.canvasName}</h3>
            <p style={styles.meta}><strong>Owner:</strong> {canvas.owner.username}</p>
            <p style={styles.meta}><strong>Email:</strong> {canvas.owner.email}</p>
            <p style={styles.meta}>
              <strong>Created:</strong> {new Date(canvas.createdAt).toLocaleString()}
            </p>
            <p style={styles.meta}>
              <strong>Updated:</strong> {new Date(canvas.updatedAt).toLocaleString()}
            </p>

            <div style={styles.buttonRow}>
              <div style={styles.leftButtons}>
                <button
                  style={styles.openButton}
                  onClick={() => navigate(`/canvas/${canvas.canvasId}`)}
                >
                  Open
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDeleteCanvas(canvas.canvasId)}
                >
                  Delete
                </button>
              </div>
              <button
                style={styles.shareButton}
                onClick={() => setShareCanvasId(canvas.canvasId)}
              >
                Share
              </button>
            </div>

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
                  Confirm
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
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: "28px",
    marginBottom: "20px",
    color: "#333",
    fontWeight: "bold",
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
    borderRadius: "25px",
    border: "1px solid #ccc",
    flex: "1",
  },
  createButton: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  canvasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
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
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
    alignItems: "flex-start",
    gap: "10px",
  },
  leftButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  openButton: {
    padding: "8px 16px",
    backgroundColor: "#17a2b8",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  deleteButton: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  shareButton: {
    padding: "8px 16px",
    backgroundColor: "#ffc107",
    color: "#000",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    alignSelf: "center",
    transition: "background-color 0.3s ease",
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
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  logoutBtn: {
    marginTop: "40px",
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
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

export default CanvasListPage;
