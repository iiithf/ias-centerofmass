const WebSocket = require('ws');
const needle = require('needle');



const E = process.env;
const INPUT = E['INPUT']||'ws://192.168.1.7:8000';
const MODEL = E['MODEL']||'http://192.168.1.7:8501';
const MODELURL = MODEL+'/v1/models/model:predict';
const CONTAINER = E['CONTAINER']||'';
const ws = new WebSocket(INPUT);
const INPUTS = 10;
var ball = null;


function mathWithin(value, begin, end) {
  return Math.max(begin, Math.min(value, end));
}

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
  for(var b of balls||[])
    if(b) inputs.push(b.r, b.x, b.y);
  for(var i=inputs.length, I=INPUTS*3; i<I; i++)
    inputs.push(0);
  return inputs;
}

function ballMapOutputs(outputs, ball) {
  var [x, y] = outputs, b = ball;
  b.x = b.x+mathWithin(x-b.x, -0.05, 0.05);
  b.y = b.y+mathWithin(y-b.y, -0.05, 0.05);
  b.x = mathWithin(b.x, 0, 1);
  b.y = mathWithin(b.y, 0, 1);
  return b;
}

function ballSetup() {
  var id = randomString(), name = CONTAINER||'model_'+id;
  ball = {id, name, x: 0, y: 0, r: 0.2, fill: randomColor()};
  console.log('ball', ball);
}



async function modelRun(inputs) {
  var res = await needle('post', MODELURL, {inputs: [inputs]}, {json: true});
  return res.body.outputs[0];
}

async function onRecieveUpdate(balls) {
  var inputs = inputsMapBalls(balls);
  var outputs = await modelRun(inputs);
  ball = ballMapOutputs(outputs, ball);
  wsSend({type: 'update', data: ball});
  console.log('onRecieveUpdate()', ball);
}


function wsSend(data) {
  ws.send(JSON.stringify(data));
}
ws.onmessage = (e) => onRecieveUpdate(JSON.parse(e.data).data);
ballSetup();
