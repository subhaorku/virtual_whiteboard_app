const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        trim: true, 
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },       
},{
    timestamps: true,
    collection: 'users' // Specify the collection name
})



userSchema.statics.createUser = async function (username, email, password) {
    try {
        // ✅ Validate email
        if (!validator.isEmail(email)) {
            throw new Error('Invalid email format');
        }

        // ✅ Validate password strength
        // By default: minLength 8, at least 1 lowercase, 1 uppercase, 1 number, 1 symbol
        // You can customize by passing options
        if (!validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 0,
            minUppercase: 0,
            minNumbers: 0,
            minSymbols: 0,
        })) {
            throw new Error('Password is not strong enough. It must be at least 8 characters long.');
        }

        // ✅ Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new this({
            username,
            email,
            password: hashedPassword
        });

        return await user.save();
    } catch (err) {
        throw new Error('Error creating user: ' + err.message);
    }
};



userSchema.statics.getAllUsers = async function() {
    try {
        return await this.find({}).sort({ createdAt: -1 }); // Newest first
    } catch (err) {
        throw new Error('Error fetching users: ' + err.message);
    }
}

userSchema.statics.loginUser = async function (email, password) {
    try {
        const user = await this.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid password');
        }

        return user;
    } catch (err) {
        throw new Error('Error logging in user: ' + err.message);
    }
};

userSchema.statics.getUserProfile = async function (email) {
    try {
        const user = await this.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (err) {
        throw new Error('Error fetching user profile: ' + err.message);
    }
};


// const userModel = mongoose.model('User', userSchema);
// module.exports = userModel;
 

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;
