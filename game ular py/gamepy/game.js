const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Grid settings
const gridSize = 20;
let snake = [{x: 9, y: 9}];
let dx = 0, dy = 0;

// Kode urutan yang harus dimakan
const codeSequence = ["a", "=", "2", "b", "=", "3", "print", "(", "a", "+", "b", ")", "5"];
let currentIndex = 0;

// Posisi makanan
let food = randomFood();
let multipleChoices = []; // untuk spawn jawaban akhir

// Score dan Timer
let score = 0;
let timeLeft = 180;
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");

// Timer countdown
let timerInterval = setInterval(() => {
  timeLeft--;
  timerEl.textContent = timeLeft;
  if (timeLeft <= 0) {
    clearInterval(timerInterval);
    alert("⏱️ Waktu habis! Game Over\nSkor akhir: " + score);
    document.location.reload();
  }
}, 1000);

function randomFood(val) {
  return {
    x: Math.floor(Math.random() * (canvas.width / gridSize)),
    y: Math.floor(Math.random() * (canvas.height / gridSize)),
    text: val || codeSequence[currentIndex]
  };
}

function draw() {
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  ctx.fillStyle = "lime";
  snake.forEach(part => {
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize-2, gridSize-2);
  });

  // Draw food (potongan kode biasa)
  if (multipleChoices.length === 0) {
    ctx.fillStyle = "yellow";
    ctx.font = "16px monospace";
    ctx.fillText(food.text, food.x * gridSize + 2, food.y * gridSize + 16);
  }

  // Draw multiple choices (jawaban akhir)
  multipleChoices.forEach(choice => {
    ctx.fillStyle = "orange";
    ctx.fillRect(choice.x * gridSize, choice.y * gridSize, gridSize-2, gridSize-2);
    ctx.fillStyle = "black";
    ctx.fillText(choice.text, choice.x * gridSize + 2, choice.y * gridSize + 16);
  });
}

function update() {
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};
  snake.unshift(head);

  // Kalau masih di tahap kode sequence
  if (multipleChoices.length === 0) {
    if (head.x === food.x && head.y === food.y) {
      if (food.text === codeSequence[currentIndex]) {
        currentIndex++;
        score += 10;
        scoreEl.textContent = score;

        if (currentIndex >= codeSequence.length) {
          // Sampai tahap jawaban → spawn 1 benar + 4 salah
          spawnChoices();
        } else {
          food = randomFood();
        }
      } else {
        snake.pop();
        snake.pop();
        score = Math.max(0, score - 5);
        scoreEl.textContent = score;
        alert("❌ Salah! Ular jadi lebih pendek 🐍");
        food = randomFood();
      }
    } else {
      snake.pop();
    }
  } else {
    // Kalau lagi pilih jawaban
    let choice = multipleChoices.find(c => c.x === head.x && c.y === head.y);
    if (choice) {
      if (choice.correct) {
        clearInterval(timerInterval);
        alert("🎉 Benar! Skor akhir: " + score);
        document.location.reload();
      } else {
        score -= 5;
        snake.pop();
        scoreEl.textContent = score;
        alert("❌ Jawaban salah! Skor berkurang");
      }
    } else {
      snake.pop();
    }
  }
}

function spawnChoices() {
  let correct = 5; // jawaban bener
  let options = [correct];

  // bikin 4 salah
  while (options.length < 5) {
    let r = Math.floor(Math.random() * 10) + 1;
    if (!options.includes(r)) options.push(r);
  }

  // acak
  options.sort(() => Math.random() - 0.5);

  multipleChoices = options.map(num => ({
    x: Math.floor(Math.random() * (canvas.width / gridSize)),
    y: Math.floor(Math.random() * (canvas.height / gridSize)),
    text: num.toString(),
    correct: num === correct
  }));
}

function gameLoop() {
  update();
  draw();
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp" && dy === 0) { dx = 0; dy = -1; }
  else if (e.key === "ArrowDown" && dy === 0) { dx = 0; dy = 1; }
  else if (e.key === "ArrowLeft" && dx === 0) { dx = -1; dy = 0; }
  else if (e.key === "ArrowRight" && dx === 0) { dx = 1; dy = 0; }
});

setInterval(gameLoop, 200);
