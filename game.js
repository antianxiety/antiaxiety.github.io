/*
  gamestate:
  1. new level: change image, get positions
  2. pop the monsters
  3. wait for mouse/touch input
  4. mouse input => stars (random y/x-axis by +/-100px and size)
  5. if mouse input includes smiley, then give 'you got it' feedback
  6. reset (delete stars)
 */
var gameboard = document.getElementById('gameboard');
var bad = {o:document.getElementById('badface')};
var good = {o:document.getElementById('goodface')};
var touchWins = []; //0 if closer to bad, 1 if closer to good
var listening = false; //
var gameStartTime = Number(new Date());
var lastRoundTime = 0;
var thresholdTimes = [2*60*1000, 5*60*1000, 10*60*1000];
var w = 75; //px of monster

var dist = function(a,b) {return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2); }

function touchmove(evt) {
  evt.preventDefault(); //disables swipe left/right
  if (evt.buttons || evt.type == 'touchmove') {
    if (Math.random() < 0.2) {
      var pos = {
        x: (evt.touches && evt.touches[0].clientX) || (evt.clientX),
        y: (evt.touches && evt.touches[0].clientY) || (evt.clientY)
      };
      if (listening) {
        var badDist = dist(bad, pos);
        var goodDist = dist(good, pos);
        touchWins.push(Number(goodDist < badDist));
      }
      makeStar(pos);
    }
  }
}

function makeStar(pos) {
  var star = document.createElement('div');
  star.style.top = (pos.y + parseInt(Math.random()*40) - 20) + 'px';
  star.style.left = (pos.x + parseInt(Math.random()*40) - 20) + 'px';
  star.className = 'star';
  gameboard.appendChild(star);
}

function resetTouches(evt) { touchWins = []; }
function evaluateTouches(evt) {
  if (listening) {
    var avg = (touchWins.reduce(function(acc,val) {return acc+val},0)
               /touchWins.length);
    if (avg > 0.5) {
      winRound();
    }
  }
}

function winRound() {
  listening = false;
  var newRound = Number(new Date()) - gameStartTime;
  // 1. pop up awesomeness animation

  // 2. check gameStartTime for thresholds (2min, 5min, 10min) and animate
  thresholdTimes.map(function(t) {
    if (lastRoundTime < t && t < newRound) {
      // flash minutes animation!
      console.log('flash minutes animation for ' + t);
    }
  })
  lastRoundTime = newRound;
  setTimeout(function() {
    console.log('start round again');
    // 3. fadeout markers, change background
    bad.o.className = good.o.className = 'face';
    bad.o.className = good.o.className = 'face fadeInOut';

    // 4.
    startRound();
  }, 1000);
}

function startRound() {
  // 1. move markers, fade them in
  var newPosFadeIn = function(m, other) {
    m.o.style.left = ( m.x = parseInt(Math.random() * (window.innerWidth-w)) ) + 'px';
    m.o.style.top = ( m.y =  parseInt(Math.random() * (window.innerHeight-(w*2))) ) + 'px';
    // not too close
    if (other && dist(m,other) < (75*75)) {
      return newPosFadeIn(m,other);
    }
    m.o.className = 'face';
    m.o.className = 'face fadeInOut';
    setTimeout(function() {
      // necessary delay to reset pop animation after move
      m.o.className = 'face fadeInOut pop';
    },200);
  };
  newPosFadeIn(good);
  newPosFadeIn(bad, good);
  // 2. listening = true
  setTimeout(function() {
    listening = true;
  }, 700);
}

gameboard.addEventListener("touchmove", touchmove, true);
gameboard.addEventListener("mousemove", touchmove, true);

gameboard.addEventListener("touchstart", resetTouches, true);
gameboard.addEventListener("mousedown", resetTouches, true);

gameboard.addEventListener("touchend", evaluateTouches, true);
gameboard.addEventListener("mouseup", evaluateTouches, true);

startRound();
