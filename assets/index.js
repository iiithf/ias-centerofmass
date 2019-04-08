const $form = document.querySelector('form');
const $name = document.querySelector('#name');
const $query = document.querySelector('#query');
const $canvas = document.querySelector('#canvas');
const ctx = $canvas.getContext('2d');
const LETTERS = '0123456789ABCDEF';

var width, height, mouse = {x: 0, y: 0};
var keys = new Set();
var balls = new Map();
var ball = null;
var ws = null;



function randomText() {
  return Math.random().toString(36).substring(7);
}

function randomColor() {
  for (var c='#', i=0; i<6; i++)
    c += LETTERS[Math.floor(Math.random()*16)];
  return c;
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
  var {x, y} = mouse, radius = 0.2;
  var fillStyle = randomColor();
  ball = {id, name, x, y, radius, fillStyle};
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
      if(b.id!==ball.id) balls.set(b.id, b);
  };
}

function setup() {
  setupCanvas();
  setupBall();
  setupWs();
}

function drawBall(ball) {
  var {name, x, y, radius, fillStyle} = ball;
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.arc(x*width, y*height, radius*50, 0, 2*Math.PI);
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.fillText(name, x*width, y*height-radius*50-5);
}

function draw() {
  if(keys.has('+') && ball.radius<1) ball.radius += 0.01;
  if(keys.has('-') && ball.radius>0.2) ball.radius -= 0.01;
  ball.x += 0.01*(Math.random()-0.5);
  ball.y += 0.01*(Math.random()-0.5);
  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = 'center';
  for(var b of balls.values())
    if(b) drawBall(b);
  requestAnimationFrame(draw);
}

function onMouseMove(e) {
  mouse.x = (e.clientX+4)/width;
  mouse.y = (e.clientY-$form.clientHeight)/height;
  wsSend({type: 'ball', value: ball});
}
function onKeyDown(e) {
  keys.add(e.key);
 wsSend({type: 'ball', value: ball});
}
function onKeyUp(e) {
  keys.delete(e.key);
 wsSend({type: 'ball', value: ball});
}
function onRename(e) {
  ball.name = $name.value;
 wsSend({type: 'ball', value: ball});
}

setup();
requestAnimationFrame(draw);
document.onmousemove = onMouseMove;
document.onkeydown = onKeyDown;
document.onkeyup = onKeyUp;
document.onresize = setupCanvas;
$name.onchange = onRename;
