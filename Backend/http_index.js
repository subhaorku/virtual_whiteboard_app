const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Importing CORS for cross-origin requests
const connectToDatabase = require('./db'); // Importing the database connection function
const { Server } = require('socket.io'); 


const app = express();
connectToDatabase(); // Establishing the database connection

const PORT = 3030;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies


const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');  





const registerRoute = require('./routes/registerRoute'); // Importing the register route
const canvasRoutes = require('./routes/canvasRoute'); // Importing canvas routes 
// For whiteboard project, we are using the following routes: 
const userRoute = require('./routes/userRoute'); // Importing user routes 






// Middleware to add "Hello World!" text to the response 
// This middleware will be executed for every request and wiill modify the response

function MiddlewareToAddHelloWorldText(req, res, next) {
  console.log('Middleware executed');
  res.customData = 'This is added using Middleware !';
  next();
}


// Middleware to authenticate user and henceforth we protect the posts route 
function authenticateUser(req, res, next) {
  // This is a placeholder for user authentication logic
  // console.log('User authenticated');
  // next();

  // Code for user authentication that will always fail 
  res.status(401).send('User authentication failed.'); // Simulating a failed authentication
  // If authentication fails, we send a 401 Unauthorized response
  // If authentication succeeds, we would call next() to pass control to the next middleware or route handler

}  


// before sending to userRoutes send it to middleware
// first req comes to /users then it goes to middleware which does some processing with the request and reponse objects and then it calls next() to pass (req , response objects ) control to the next middleware or route handler 
// app.use('/users', MiddlewareToAddHelloWorldText, userRoutes);  
//app.use('/api/users', userRoutes); // No middleware applied here, just direct routing to userRoutes
app.use('/api/posts', postRoutes);    
app.use('/api/register', registerRoute); // Register route without middleware



// For whiteboard project, we are using the following routes: 
app.use('/users', userRoute); // Using userRoute for user-related operations
app.use('/canvases', canvasRoutes); // Using canvasRoutes for canvas-related operations


app.listen(PORT, () => {
  console.log('Server is running on http://localhost:3030');
}); 


