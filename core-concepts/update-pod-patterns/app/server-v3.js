const http = require('http');
const os = require('os');

let requestCount = 0;

console.log('Kubia server starting...');

const handler = (request, response) => {
  console.log(`Received request from ${request.socket.remoteAddress}`);

  requestCount++;

  if (requestCount >= 5) {
    response.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    response.end(
      `Some internal error has occurred! This is pod ${os.hostname()}\n`
    );

    return;
  }

  response.writeHead(200, {
    'Content-Type': 'text/plain'
  });

  response.end(
    `This is v3 running in pod ${os.hostname()}\n`
  );
};

const www = http.createServer(handler);

www.listen(8080, () => {
  console.log('Server listening on port 8080');
});