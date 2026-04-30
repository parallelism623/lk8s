const http = require('http');
const os = require('os');

console.log("Kubia server starting...");

const handler = (request, response) => {
    console.log("Received request from " + request.socket.remoteAddress);
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end("You've hit " + os.hostname() + '\n');
};

const www = http.createServer(handler);

www.listen(8080, () => {
    console.log("Server is listening on port 8080");
});