const $form = document.querySelector('form');
const $name = document.querySelector('#name');
const $query = document.querySelector('#query');
const $canvas = document.querySelector('#canvas');
const ctx = $canvas.getContext('2d');

var width, height, mouse = [0, 0];
var keys = new Set();
var balls = new Map();
var ball = null;
var ws = null;



function randomText() {
  return Math.random().toString(36).substring(7);
}

function randomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++)
    color += letters[Math.floor(Math.random() * 16)];
  return color;
}

function wsSend(data) {
  if(ws.readyState!==WebSocket.OPEN) return;
  var msg = JSON.stringify(data);
  ws.send(msg);
}

function setupCanvas() {
  $canvas.width = width = innerWidth;
  $canvas.height = height = innerHeight-$form.clientHeight-5;
}

function setupBall() {
  var id = randomText();
  var name = $name.value = id;
  var size = 10;
  var color = randomColor();
  var position = mouse;
  ball = {id, name, size, color, position};
  balls.set(id, ball);
}

function setupWs() {
  ws = new WebSocket('ws://127.0.0.1:8000');
  ws.onerror = (err) => console.error(err);
  ws.onmessage = (e) => {
    var data = JSON.parse(e.data);
    var {type} = data;
    if(type==='close') return balls.delete(data.id);
    for(var b of data.values)
      balls.set(b.id, b);
  };
}

function setup() {
  setupCanvas();
  setupBall();
  setupWs();
}

function drawBall(ball) {
  var {name, size, color, position} = ball;
  var [x, y] = position;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x*width, y*height, size, 0, 2*Math.PI);
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.fillText(name, x*width, y*height-size-5);
}

function draw() {
  if(keys.has('+') && ball.size<50) ball.size++;
  if(keys.has('-') && ball.size>5) ball.size--;
  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = 'center';
  for(var b of balls.values())
    if(b) drawBall(b);
  wsSend({type: 'ball', value: ball});
  requestAnimationFrame(draw);
}

function onMouseMove(e) {
  mouse[0] = (e.clientX+4)/width;
  mouse[1] = (e.clientY-$form.clientHeight)/height;
}
function onKeyDown(e) {
  keys.add(e.key);
}
function onKeyUp(e) {
  keys.delete(e.key);
}
function onRename(e) {
  ball.name = $name.value;
}


setup();
requestAnimationFrame(draw);
document.onmousemove = onMouseMove;
document.onkeydown = onKeyDown;
document.onkeyup = onKeyUp;
$name.onchange = onRename;
