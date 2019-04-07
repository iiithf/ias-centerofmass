const $form = document.querySelector('form');
const $name = document.querySelector('#name');
const $query = document.querySelector('#query');
const $canvas = document.querySelector('#canvas');
const ctx = $canvas.getContext('2d');

var width, height, mouse = [];
var keys = new Set();
var balls = new Map();
var ball = null;



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

function setupCanvas() {
  $canvas.width = width = innerWidth;
  $canvas.height = height = innerHeight-$form.clientHeight-5;
}

function setupBall() {
  var id = randomText();
  var name = $name.value;
  var size = 10;
  var color = randomColor();
  var position = mouse;
  ball = {id, name, size, color, position};
  balls.set(id, ball);
}

function setup() {
  setupCanvas();
  setupBall();
}

function drawBall(ball) {
  var {name, size, color, position} = ball;
  var [x, y] = position;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, 2*Math.PI);
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.fillText(name, x, y-size-5);
}

function draw() {
  if(keys.has('+') && ball.size<50) ball.size++;
  if(keys.has('-') && ball.size>5) ball.size--;
  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = 'center';
  for(var b of balls.values())
    drawBall(b);
  requestAnimationFrame(draw);
}

function onMouseMove(e) {
  mouse[0] = e.clientX+4;
  mouse[1] = e.clientY-$form.clientHeight;
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
