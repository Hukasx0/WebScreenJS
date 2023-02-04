const http = require('http');
const fs = require('fs');
const screenshot = require('screenshot-desktop');

const hostname = '127.0.0.1';
const port = 3000;

const dispWidth = 1920;
const dispHeight  = 1080;
const updateMs = 120;

var buffer;

class Streamer {
    constructor(ioCon, id, width, height, ms){
        this.id = id;
        this.ioCon = ioCon;
        this.width = width;
        this.height = height;
        this.ms = ms;
    }
    replaceTags(file){
        return file.replace(`<WebScreenJS id="${this.id}.ssBtn"></WebScreenJS>`,`
        <button id="${this.id}.ssBtn">screenshot</button>
        <script>
        const ssBtn = document.getElementById('${this.id}.ssBtn');
        ssBtn.addEventListener("click", function() {
            fetch('/ss', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                window.location.href = data.ss;
            })
            .catch(error => console.error(error))
        });
        </script>
        `
        ).replace(`<WebScreenJS id="${this.id}.streamer"></WebScreenJS>`,`
        <img id="${this.id}.streamer" src="" width="${this.width}" height="${this.height}">
        <script src="${this.ioCon}socket.io/socket.io.js"></script>
        <script>
            const image = document.getElementById('${this.id}.streamer');\nconst socket = io('${this.ioCon}');
            socket.on('update', data => {
                image.src = data;
            });
        </script>`
        );
    }
}

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
    if(req.method === 'POST' && req.url === "/ss"){
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ ss: buffer}));
    }
    else{
    fs.readFile('index.html', 'utf8', (err, index) => {
        if (err) {
            console.error(err);
            res.statusCode = 500;
            res.end("Server error");
        }
        else {
            const stream = new Streamer("http://localhost:3000/","stream",dispWidth,dispHeight,updateMs);
            const indexMod = stream.replaceTags(index);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(indexMod);
            
        }
    })
}
});

const sc = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

setInterval(function(){
    getImgBuffer().then(imgBuffer => {
        buffer = "data:image/jpeg;base64,"+imgBuffer.toString('base64');
    });
},updateMs);

sc.on('connection', socket => {
    setInterval(function(){
        socket.emit('update',buffer);
    },updateMs);
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
