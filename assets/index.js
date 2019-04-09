const $form = document.querySelector('form');
const $name = document.querySelector('#name');
const $query = document.querySelector('#query');
const $svg = document.querySelector('#svg');

const LETTERS = '0123456789ABCDEF';
const UPDATETIME = 200;
const s = Snap('#svg');

var width, height;
var mouse = {x: 0, y: 0};
var keys = new Set();
var balls = new Map();
var ball = null;
var ws = null;
var mtime = new Date().getTime();
var ballv = {x: 0, y: 0};



function randomText() {
  return Math.random().toString(36).substring(7);
}

function randomColor() {
  for (var c='#', i=0; i<6; i++)
    c += LETTERS[Math.floor(Math.random()*16)];
  return c;
}



function svgSetup() {
  width = $svg.clientWidth;
  height = $svg.clientHeight;
}



function ballCreate(b) {
  b.svg = s.circle(0, 0, b.r*50);
  b.svg.attr({fill: b.fill});
  return b;
}

function ballData(b) {
  var d = Object.assign({}, b);
  d.svg = undefined;
  return d;
}

function ballUpdate(b) {
  var attr = {transform: `t${b.x*width},${b.y*height}`, r: b.r*50};
  b.svg.animate(attr, UPDATETIME);
}

function ballSetup() {
  var b = {
    id: randomText(), name: $name.value,
    x: mouse.x, y: mouse.y, r: 0.2,
    fill: randomColor(), svg: null,
  };
  return ballCreate(b);
}



function onRemoveBall(map, b) {
  var b = map.get(b.id);
  b.svg.remove();
  map.delete(b.id);
}

function onRecieveBalls(map, balls) {
  for(var b of balls) {
    if(b==null || b.id===ball.id) continue;
    if(!map.has(b.id)) map.set(b.id, ballCreate(b));
    ballUpdate(Object.assign(map.get(b.id), b), UPDATETIME);
  }
}



function wsSend(data) {
  if(ws.readyState!==WebSocket.OPEN) return;
  var msg = JSON.stringify(data);
  ws.send(msg);
}

function wsSetup() {
  ws = new WebSocket('ws://'+location.host);
  ws.onerror = (err) => console.error(err);
  ws.onmessage = (e) => {
    var d = JSON.parse(e.data);
    if(d.type==='close') onRemoveBall(balls, d.data);
    if(d.type==='update') onRecieveBalls(balls, d.data);
  };
}



function setup() {
  svgSetup();
  ball = ballSetup();
  balls.set(ball.id, ball);
  wsSetup();
}


function moveBall(ball, position) {
  Object.assign(ball, position);
  wsSend({type: 'update', data: ballData(ball)});
  ballUpdate(ball);
}
function onMouseMove(e) {
  mouse.x = e.clientX/width;
  mouse.y = e.clientY/height;
  moveBall(ball, mouse);
  mtime = new Date().getTime();
  ballv = {x: 0, y: 0};
}
function onKeyUp(e) {
  keys.delete(e.key);
  if(e.key==='+') ball.r = Math.min(ball.r+0.1, 1);
  if(e.key==='-') ball.r = Math.max(ball.r-0.1, 0.2);
  wsSend({type: 'update', data: ballData(ball)});
  ballUpdate(ball);
}
function onRename(e) {
  ball.name = $name.value;
  wsSend({type: 'update', data: ballData(ball)});
  ballUpdate(ball);
}
function onAuto() {
  var t = new Date().getTime();
  if(t-mtime<5) return;
  ballv.x += 0.01*(Math.random()-0.5);
  ballv.y += 0.01*(Math.random()-0.5);
  var x = Math.max(0, Math.min(ball.x+ballv.x, 1));
  var y = Math.max(0, Math.min(ball.y+ballv.y, 1));
  moveBall(ball, {x, y});
}
setInterval(onAuto, UPDATETIME);
setup();
document.onmousemove = onMouseMove;
document.onkeyup = onKeyUp;
document.onresize = svgSetup;
document.onmouseenter = () => mousein = true;
document.onmous
$name.onchange = onRename;
