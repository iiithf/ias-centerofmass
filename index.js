const WebSocket = require('ws');



const E = process.env;
const PORT = parseInt(E['PORT']||'8500', 10);
const INPUT = E['INPUT']||'ws://192.168.1.7:8000';
const MODEL = E['MODEL']||'http://192.168.1.7:8501';
const ws = new WebSocket(INPUT);



ws.onmessage = (e) => {
  var balls = JSON.parse(e.data).values;
  console.log(balls);
};


