const http = require('http');
const fs = require('fs');
const path = require('path');
// Create an HTTP server that listens on port 3000
const PORT = 3030;

const logStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });

const server = http.createServer((req, res) => {
    const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
    logStream.write(logEntry);
    console.log(logEntry.trim());

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello from Node.js Server!\n');
});

server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});