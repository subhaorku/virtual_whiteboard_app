// Build Connection betweeen Backend and Database
const mongoose = require('mongoose');


const db_username = 'subh30072004'; // Replace with your actual database username
const db_password = 'zJpaSlTgPuJBdqSd'; // Replace with your actual database password
// const ConnectionString = `mongodb+srv://${db_username}:${db_password}@cluster0.oiqujrh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`; 
const ConnectionString = `mongodb+srv://${db_username}:${db_password}@cluster0.oiqujrh.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0`;


const ConnectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(ConnectionString, ConnectionParams);
        console.log('Database connected successfully');
        console.log ('Connection String:', ConnectionString); // Log the connection string for debugging
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit the process with failure
    }
}

module.exports = connectToDatabase;