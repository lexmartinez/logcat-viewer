const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let command = spawn('adb', ['logcat']);

command.stdout.on('data', (data) => {
    wss.clients.forEach(client => client.send(`${data}`));
});

command.stderr.on('data', (data) => {
    wss.clients.forEach(client => client.send(`${data}`));
});
  
command.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});

app.use('/', express.static(path.resolve(__dirname, 'dist')));
app.get('/', (req, res) => res.sendFile(path.resolve(__dirname, 'dist/index.html')));

if (!module.parent) {
    server.listen(process.env.PORT || 8999, () => {
        console.log(`logcat-viewer running on port ${server.address().port}`);
    })
} else {
    module.exports = server;
}
