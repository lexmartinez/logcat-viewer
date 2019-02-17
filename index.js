const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const open = require('open');
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

app.use('/', express.static(path.join(process.cwd(), '/dist')));
app.get('/', (req, res) => res.sendFile(path.join(process.cwd(), '/dist/index.html')));

server.listen(process.env.PORT || 8999, () => {
    console.log(`logcat-ui running on port ${server.address().port}`);
    open(`http://localhost:${server.address().port}`)
})
