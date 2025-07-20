const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectToDatabase = require('./db');
const { Server } = require('socket.io');
const http = require('http');
const Canvas = require('./Models/canvasModel'); // ✅ import your canvas model
const verifyToken = require('./utils/verifyToken');
const User = require('./models/userModel'); // ✅ import your user model
const JWT_SECRET = process.env.JWT_SECRET

const app = express();
connectToDatabase();
const PORT = 3030;

app.use(cors());
app.use(express.json());

const registerRoute = require('./routes/registerRoute');
const canvasRoutes = require('./routes/canvasRoute');
const userRoute = require('./routes/userRoute');
app.use('/api/register', registerRoute);
app.use('/users', userRoute);
app.use('/canvases', canvasRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // your frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true
  }
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = verifyToken(token); // ✅ shared logic
    const user = await User.findOne({ email: decoded.email });
    console.log('Received token:', token);
    console.log('Decoded token:', decoded);
    console.log('Found user:', user ? user.email : 'No user found');

    if (!user) return next(new Error("User not found"));

    socket.userId = user._id.toString();  // ✅ Set userId for socket
    next();
  } catch (err) {
    console.error('Socket auth error:', err);
    return next(new Error("Authentication error"));
  }
});


io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}, userId: ${socket.userId}`);

  // listen for joining a specific canvas
  socket.on("joinCanvas", async (canvasId) => {
     console.log("🛠 joinCanvas received ID:", canvasId);

  
    try {
      // Fetch canvas from DB
      const canvas = await Canvas.findOne({canvasId })
        .populate('owner', 'username email')
        .populate('sharedWith', 'username email');

      if (!canvas) {
        socket.emit("unauthorized", "Canvas not found.");
        socket.disconnect();
        return;
      }

      const isOwner = canvas.owner._id.toString() === socket.userId;
      const isShared = canvas.sharedWith.some(user => user._id.toString() === socket.userId);
        console.log("📋 Checking access:");
        console.log("socket.userId:", socket.userId);
        console.log("canvas.owner._id:", canvas.owner._id.toString());
        console.log("sharedWith user IDs:", canvas.sharedWith.map(u => u._id.toString()));
        console.log("isOwner:", isOwner);
        console.log("isShared:", isShared);    

      if (!isOwner && !isShared) {
        socket.emit("unauthorized", "You do not have access to this canvas.");
        socket.disconnect();
        return;
      }

      // ✅ Authorized: join room
      socket.join(canvasId);
      console.log(`📌 User ${socket.userId} joined canvas room ${canvasId}`);

      // Send latest canvas data
      socket.emit("loadCanvas", canvas);

    } catch (err) {
      console.error("❌ Error joining canvas:", err);
      socket.emit("unauthorized", "Error verifying canvas access.");
      socket.disconnect();
    }
  });

  socket.on("drawUpdate", async (canvasId, updateData) => {
    try {
      // updateData should contain updated `elements` array or diff
      // Merge strategy: assume client sends the full updated elements array
      if (!updateData || !updateData.elements) {
        console.log("⚠️ drawUpdate received without elements");
        return;
      }

      // Find the canvas and update directly
      const updatedCanvas = await Canvas.findOneAndUpdate(
        { canvasId: canvasId },
        { $set: { elements: updateData.elements, updatedAt: new Date() } },
        { new: true } // return the updated document
      ).populate("owner", "username email")
      .populate("sharedWith", "username email");

      if (!updatedCanvas) {
        console.log(`❌ Canvas ${canvasId} not found for update`);
        return;
      }

      // ✅ Broadcast the update to everyone else in the same room
      // socket.to(canvasId).emit("receiveDrawingUpdate", {
      //   elements: updatedCanvas.elements,
      // });

      io.to(canvasId).emit("receiveDrawingUpdate", {
        elements: updatedCanvas.elements,
      });

      console.log(`✏️ Broadcasted update for canvas ${canvasId} to room (excl. sender)`);
    } catch (err) {
      console.error("❌ Error updating canvas:", err);
      socket.emit("error", "Failed to process draw update");
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});




