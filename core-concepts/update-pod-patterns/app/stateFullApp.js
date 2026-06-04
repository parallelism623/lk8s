const http = require('http');
const os = require('os');
const fs = require('fs');
const dns = require('dns');

const dataFile = "/var/data/kubia.txt";
const serviceName = "kubia.default.svc.cluster.local";

function fileExists(file) {
  try {
    fs.accessSync(file, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const handler = function(request, response) {
  if (request.method === 'POST') {
    const file = fs.createWriteStream(dataFile);

    request.pipe(file);

    request.on('end', function() {
      console.log("New data has been received and stored.");
      response.writeHead(200);
      response.end("Data stored on pod " + os.hostname() + "\n");
    });

    request.on('error', function(err) {
      console.error(err);
      response.writeHead(500);
      response.end("Error receiving data\n");
    });

    file.on('error', function(err) {
      console.error(err);
      response.writeHead(500);
      response.end("Error storing data\n");
    });
  } else {
    response.writeHead(200);

    if (request.url === '/data') {
      const data = fileExists(dataFile)
        ? fs.readFileSync(dataFile, 'utf8')
        : "No data posted yet";

      response.end(data);
      return;
    }

    response.write("You've hit " + os.hostname() + "\n");
    response.write("Data stored in the cluster:\n");

    dns.resolveSrv(serviceName, function(err, addresses) {
      if (err) {
        response.end("Could not look up DNS SRV records: " + err + "\n");
        return;
      }

      let numResponses = 0;

      if (addresses.length === 0) {
        response.end("No peers discovered.\n");
        return;
      }

      addresses.forEach(function(item) {
        const requestOptions = {
          host: item.name,
          port: item.port,
          path: '/data'
        };

        http.get(requestOptions, function(returnedData) {
          let body = "";

          returnedData.on('data', function(chunk) {
            body += chunk;
          });

          returnedData.on('end', function() {
            numResponses++;
            response.write("- " + item.name + ": " + body + "\n");

            if (numResponses === addresses.length) {
              response.end();
            }
          });
        }).on('error', function(err) {
          numResponses++;
          response.write("- " + item.name + ": ERROR " + err.message + "\n");

          if (numResponses === addresses.length) {
            response.end();
          }
        });
      });
    });
  }
};

const www = http.createServer(handler);
www.listen(8080);