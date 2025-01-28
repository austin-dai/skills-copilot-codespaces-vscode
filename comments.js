// Create web server 
// Load the comments from the comments.json file
// Handle POST requests to add comments to the file

// Load the http module to create an http server.
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var querystring = require('querystring');

// Load the comments from the comments.json file
var comments = require('./comments.json');

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
  var uri = url.parse(request.url).pathname;
  var filename = path.join(process.cwd(), uri);
  var body = '';

  console.log('Request for ' + filename);

  if (request.method === 'POST') {
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var POST = querystring.parse(body);
      var comment = {
        name: POST.name,
        message: POST.message,
        timestamp: Date.now()
      };
      comments.push(comment);
      fs.writeFile('comments.json', JSON.stringify(comments, null, 4), function (err) {
        if (err) {
          console.log(err);
        }
      });
    });
  }

  fs.exists(filename, function (exists) {
    if (!exists) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.write('404 Not Found\n');
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) {
      filename += '/index.html';
    }

    fs.readFile(filename, 'binary', function (err, file) {
      if (err) {
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.write(err + '\n');
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, 'binary');
      response.end();
    });
  });
});

// Listen on port 8000, IP defaults to