const equationEl = document.getElementById("equation");
const answersEl = document.getElementById("answers");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const progressEl = document.getElementById("progress");
const feedbackEl = document.getElementById("feedback");
const startButton = document.getElementById("startButton");
const durationSelect = document.getElementById("duration");
const toast = document.getElementById("toast");

let score = 0;
let seconds = 20;
let totalSeconds = 20;
let timerId = null;
let running = false;
let correctAnswer = 15;
let answered = false;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function makeQuestion() {
  const a = Math.floor(Math.random() * 12) + 3;
  const b = Math.floor(Math.random() * 12) + 2;
  const subtract = Math.random() > 0.5;
  const first = subtract ? Math.max(a, b) : a;
  const second = subtract ? Math.min(a, b) : b;
  correctAnswer = subtract ? first - second : first + second;
  equationEl.innerHTML = `${first} <span>${subtract ? "−" : "+"}</span> ${second} <span>=</span> ?`;

  const choices = new Set([correctAnswer]);
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * 9) - 4;
    if (offset !== 0 && correctAnswer + offset >= 0) choices.add(correctAnswer + offset);
  }
  const shuffled = [...choices].sort(() => Math.random() - 0.5);
  answersEl.innerHTML = "";
  shuffled.forEach(value => {
    const button = document.createElement("button");
    button.className = "answer";
    button.type = "button";
    button.textContent = value;
    button.dataset.answer = value;
    button.addEventListener("click", () => chooseAnswer(button, value));
    answersEl.appendChild(button);
  });
  answered = false;
}

function chooseAnswer(button, value) {
  if (!running || answered) return;
  answered = true;
  const buttons = [...answersEl.querySelectorAll(".answer")];
  buttons.forEach(item => item.disabled = true);
  button.classList.add("selected");

  if (Number(value) === correctAnswer) {
    score += 10;
    scoreEl.textContent = String(score).padStart(3, "0");
    feedbackEl.textContent = "Correct! +10 points. Keep going!";
    feedbackEl.style.color = "#54e6d1";
  } else {
    feedbackEl.textContent = `Not quite! The correct answer was ${correctAnswer}.`;
    feedbackEl.style.color = "#ffb2a6";
  }
  window.setTimeout(() => {
    if (running && seconds > 0) {
      makeQuestion();
      feedbackEl.style.color = "";
      feedbackEl.textContent = "Choose the correct answer";
    }
  }, 650);
}

function endRound() {
  window.clearInterval(timerId);
  timerId = null;
  running = false;
  startButton.innerHTML = 'Play again <span>→</span>';
  feedbackEl.style.color = "#54e6d1";
  feedbackEl.textContent = `Time's up! Your score: ${score}. Press Play Again to try once more.`;
  [...answersEl.querySelectorAll(".answer")].forEach(button => button.disabled = true);
}

function startRound() {
  window.clearInterval(timerId);
  score = 0;
  totalSeconds = Number(durationSelect.value);
  seconds = totalSeconds;
  running = true;
  scoreEl.textContent = "000";
  timeEl.textContent = `${seconds}s`;
  progressEl.style.width = "0%";
  startButton.textContent = "Challenge running…";
  feedbackEl.style.color = "";
  feedbackEl.textContent = "Choose the correct answer";
  makeQuestion();

  timerId = window.setInterval(() => {
    seconds -= 1;
    timeEl.textContent = `${seconds}s`;
    progressEl.style.width = `${((totalSeconds - seconds) / totalSeconds) * 100}%`;
    if (seconds <= 0) endRound();
  }, 1000);
}

startButton.addEventListener("click", startRound);
document.getElementById("helpButton").addEventListener("click", () => {
  showToast("Choose the right answer before the timer reaches zero. Each correct answer earns 10 points!");
});
