const WebSocket = require('ws');



const E = process.env;
const PORT = parseInt(E['PORT']||'8500', 10);
const INPUT = E['INPUT']||'ws://192.168.1.7:8000';
const ws = new WebSocket(INPUT);



ws.onmessage = (e) => {
  console.log(e);
};


