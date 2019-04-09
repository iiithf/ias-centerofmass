const WebSocket = require('ws');
const needle = require('needle');



const E = process.env;
const PORT = parseInt(E['PORT']||'8500', 10);
const INPUT = E['INPUT']||'ws://192.168.1.7:8000';
const MODEL = E['MODEL']||'http://192.168.1.7:8501';
const MODELURL = MODEL+'/v1/models/model:predict';
const CONTAINER = E['CONTAINER']||'';
const ws = new WebSocket(INPUT);
const INPUTS = 20;
var ball = null;



function randomString() {
  return Math.random().toString(36).substring(7);
}

function randomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


function inputsMapBalls(balls) {
  var inputs = [];
  for(var b of balls)
    inputs.push(b.r, b.x, b.y);
  for(var i=inputs.length, I=INPUTS*3; i<I; i++)
    inputs.push(0);
  return inputs;
}

function ballMapOutputs(outputs, ball) {
  var [x, y] = outputs, b = ball;
  b.x = b.x+Math.max(x-b.x, 0.1);
  b.y = b.y+Math.max(y-b.y, 0.1);
  return b;
}

function ballSetup() {
  var id = randomString(), name = CONTAINER||'model_'+id;
  return ball = {id, name, x: 0, y: 0, r: 0.2, fill: randomColor()};
}



async function modelRun(inputs) {
  var res = await needle('post', MODELURL, {examples: [{inputs}]}, {json: true});
  console.log(res.body);
  return res.body.outputs;
}


ws.onmessage = (e) => {
  var balls = JSON.parse(e.data).values;
  console.log(balls);
};


