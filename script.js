const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const hitSound = document.getElementById("hitSound");
const loseLifeSound = document.getElementById("loseLifeSound");
const gameOverSound = document.getElementById("gameOverSound");
const bgMusic = document.getElementById("bgMusic");
const pauseBtn = document.getElementById("pauseBtn");

let width, height;
let paddle, ball;
let score = 0;
let level = 1;
let lives = 5;
let isGameOver = false;
let isPaused = false;
let animationId;

const scoreboard = document.getElementById("scoreboard");
const popup = document.getElementById("popup");
const finalScore = document.getElementById("finalScore");

function resizeCanvas() {
  width = window.innerWidth * 0.9;
  height = window.innerHeight * 0.7;
  canvas.width = width;
  canvas.height = height;
  if (!paddle || !ball) initGame();
}

function initGame() {
  paddle = {
    width: width * 0.2,
    height: 10,
    x: width / 2 - (width * 0.2) / 2,
    y: height - 30,
    speed: width * 0.02,
    dx: 0
  };
  ball = {
    x: width / 2,
    y: height / 2,
    radius: 8,
    dx: width * 0.01,
    dy: -height * 0.01
  };
  score = 0;
  level = 1;
  lives = 5;
  updateScore();
  isGameOver = false;
  popup.style.display = "none";
  bgMusic.play();
  isPaused = false;
  update();
}

function drawPaddle() {
  ctx.fillStyle = "#09f";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#f00";
  ctx.fill();
  ctx.closePath();
}

function movePaddle() {
  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > width) paddle.x = width - paddle.width;
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
    ball.dx *= -1;
  }

  if (ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  if (
    ball.y + ball.radius > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    ball.dy *= -1;
    score++;
    hitSound.play();
    if (score % 5 === 0) {
      level++;
      ball.dx *= 1.1;
      ball.dy *= 1.1;
    }
    updateScore();
  }

  if (ball.y + ball.radius > height) {
    loseLifeSound.play();
    lives--;
    if (lives <= 0) {
      gameOver();
    } else {
      resetBall();
      updateScore();
    }
  }
}

function resetBall() {
  ball.x = width / 2;
  ball.y = height / 2;
  ball.dx = width * 0.01;
  ball.dy = -height * 0.01;
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  drawPaddle();
  drawBall();
}

function update() {
  if (isGameOver || isPaused) return;
  movePaddle();
  moveBall();
  draw();
  animationId = requestAnimationFrame(update);
}

function updateScore() {
  scoreboard.textContent = `Score: ${score} | Level: ${level} | Lives: ${lives}`;
}

function gameOver() {
  isGameOver = true;
  gameOverSound.play();
  bgMusic.pause();
  finalScore.textContent = `Final Score: ${score}, Level: ${level}`;
  popup.style.display = "block";
}

function restartGame() {
  cancelAnimationFrame(animationId);
  initGame();
}

function togglePause() {
  if (isGameOver) return;
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
  if (isPaused) {
    cancelAnimationFrame(animationId);
    bgMusic.pause();
  } else {
    bgMusic.play();
    update();
  }
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    paddle.dx = -paddle.speed;
  } else if (e.key === "ArrowRight") {
    paddle.dx = paddle.speed;
  } else if (e.key.toLowerCase() === "p") {
    togglePause();
  }
});

document.addEventListener("keyup", () => {
  paddle.dx = 0;
});

// Touch controls
let touchX = null;
canvas.addEventListener("touchstart", (e) => {
  touchX = e.touches[0].clientX;
});

canvas.addEventListener("touchmove", (e) => {
  const currentX = e.touches[0].clientX;
  const delta = currentX - touchX;
  paddle.x += delta;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > width) paddle.x = width - paddle.width;
  touchX = currentX;
});

pauseBtn.addEventListener("click", togglePause);

// Responsive
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
