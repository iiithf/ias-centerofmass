const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');



const E = process.env;
const PORT = parseInt(E['PORT']||'8000', 10);
const ASSETS = path.join(__dirname, 'assets');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});
const states = new Map();
const ids = new Map();
var updates = 0;


function wsSendAll(data) {
  var msg = JSON.stringify(data);
  for(var ws of ids.keys())
    ws.send(msg);
}

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use((req, res, next) => {
  Object.assign(req.body=req.body||{}, req.query);
  next();
});

wss.on('connection', (ws) => {
  ids.set(ws, null);
  console.log('ws: someone connected');
  ws.on('close', () => {
    var id = ids.get(ws);
    console.log(`ws: ${id} disconnected`);
    ids.delete(ws);
    states.delete(id);
    if(id) wsSendAll({type: 'disconnect', id});
  });
  ws.on('message', (msg) => {
    var data = JSON.parse(msg);
    var {id} = data;
    ids.set(ws, id);
    states.set(id, data);
    updates++;
    if(updates<ids.size) continue;
    console.log('ws: sending update');
    wsSendAll(states.values());
    updates = 0;
  });
});

app.use(express.static(ASSETS, {extensions: ['html']}));
app.use((err, req, res, next) => {
  console.error(err, err.stack);
  res.status(err.statusCode||500).send(err.json||err);
});
server.listen(PORT, () => {
  console.log('CENTEROFMASS_INPUT running on '+PORT);
});
