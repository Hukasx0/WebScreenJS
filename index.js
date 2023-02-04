const http = require('http');
const fs = require('fs');
const io = require('socket.io');
const screenshot = require('screenshot-desktop');

const hostname = '127.0.0.1';
const port = 3000;

const dispWidth = 1920;
const dispHeight  = 1080;
const updateMs = 400;

var buffer;

function getImgBuffer() {
    return screenshot({format: 'jpeg'})
    .then(imgBuffer => {
        return imgBuffer;
    })
    .catch(err => {
        console.error(err);
    });
}

const server = http.createServer((req, res) => {
    fs.readFile('index.html', 'utf8', (err, index) => {
        if (err) {
            console.error(err);
            res.statusCode = 500;
            res.end("Server error");
        }
        else {
            const indexMod = index.replace('{dispWidth}',dispWidth).replace('{dispHeight}',dispHeight);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(indexMod);
            
        }
    })
});

setInterval(function(){
    getImgBuffer().then(imgBuffer => {
        buffer = "data:image/jpeg;base64,"+imgBuffer.toString('base64');
    });
},updateMs);

const sc = io(server);
sc.on('connection', socket => {
    setInterval(function(){
        socket.emit('update',buffer);
    },updateMs);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
