const userModel = require('../Models/userModel');
const jwt = require('jsonwebtoken');


const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = await userModel.createUser(username, email, password );
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ message: 'Error registering user', error: error.message });
    }       
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Call the model's login method (it should already do bcrypt.compare)
        const user = await userModel.loginUser(email, password);

        // ✅ Create a JWT token with email in payload
        const token = jwt.sign(
            { email: user.email }, // payload here
            process.env.JWT_SECRET || 'mysecretkey', // secret
            { expiresIn: process.env.JWT_EXPIRES_IN || '9h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token: token,
            // DONT SEND USER DETAILS IN RESPONSE only send the token
            // This is a security best practice to avoid exposing sensitive user data
            // user: {
            //     id: user._id,
            //     username: user.username,
            //     email: user.email,
            //     createdAt: user.createdAt,
            //     updatedAt: user.updatedAt,
            // },
        });

    } catch (error) {
        console.error('Error logging in user:', error.message);
        if (error.message.includes('User not found') || error.message.includes('Invalid password')) {
            res.status(401).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Error logging in user', error: error.message });
        }
    }
};


const getUserProfile = async (req, res) => {
  try {
    // ✅ 1. Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Get the part after "Bearer"

    // ✅ 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // ✅ 3. Extract email from decoded payload
    const email = decoded.email;
    if (!email) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    // ✅ 4. Fetch user profile from DB
    const user = await userModel.getUserProfile(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }   

    // ✅ 5. Return safe user info (omit password)
    res.status(200).json({
      message: 'User profile fetched successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: 'Error fetching user profile', error: error.message });
  }
};


module.exports = {
    registerUser,   
    loginUser,
    getUserProfile,
}
