const http = require('http');
const fs = require('fs');
const screenshot = require('screenshot-desktop');

const hostname = '127.0.0.1';
const port = 3000;

let screenWidth = 1920;
let screenHeight  = 1080;

function getImgBuffer() {
    return screenshot({format: 'png'})
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
            getImgBuffer().then(imgBuffer => {
                const imgSrc = "data:image/png;base64,"+imgBuffer.toString('base64');
                const indexMod = index.replace('{source}', imgSrc).replace('{screenWidth}',screenWidth).replace('{screenHeight}',screenHeight);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(indexMod);
            });
        }
    })
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});