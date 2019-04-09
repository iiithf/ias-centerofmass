const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');



const E = process.env;
const PORT = parseInt(E['PORT']||'8000', 10);
const ASSETS = path.join(__dirname, 'assets');
const UPDATETIME = 200;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});
var users = new Map();



function wsSendAll(data) {
  var msg = JSON.stringify(data);
  for(var ws of users.keys())
    ws.send(msg);
}

function onConnection(ws) {
  users.set(ws, null);
  console.log('user connected');
}

function onClose(ws) {
  var data = users.get(ws);
  console.log('user closed', data);
  users.delete(ws);
  if(data) wsSendAll({type: 'close', data});
}

function onMessage(ws, msg) {
  var p = JSON.parse(msg);
  users.set(ws, p.data);
}



function usersUpdate() {
  console.log('updating users:', users.size);
  var data = Array.from(users.values());
  wsSendAll({type: 'update', data});
}


app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use((req, res, next) => {
  Object.assign(req.body=req.body||{}, req.query);
  next();
});

wss.on('connection', (ws) => {
  onConnection(ws);
  ws.on('close', () => onClose(ws));
  ws.on('message', (msg) => onMessage(ws, msg));
});
setInterval(() => usersUpdate(), UPDATETIME);

app.use(express.static(ASSETS, {extensions: ['html']}));
app.use((err, req, res, next) => {
  console.error(err, err.stack);
  res.status(err.statusCode||500).send(err.json||err);
});
server.listen(PORT, () => {
  console.log('CENTEROFMASS_INPUT running on '+PORT);
});
