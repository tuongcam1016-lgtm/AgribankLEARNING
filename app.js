const questions = Array.isArray(window.quizQuestions) ? shuffle([...window.quizQuestions]) : [];

const scoreEl = document.querySelector("#score");
const currentQuestionEl = document.querySelector("#currentQuestion");
const totalQuestionsEl = document.querySelector("#totalQuestions");
const streakEl = document.querySelector("#streak");
const accuracyEl = document.querySelector("#accuracy");
const progressBar = document.querySelector("#progressBar");
const categoryEl = document.querySelector("#category");
const pointsEl = document.querySelector("#points");
const questionText = document.querySelector("#questionText");
const answersEl = document.querySelector("#answers");
const feedbackEl = document.querySelector("#feedback");
const nextBtn = document.querySelector("#nextBtn");
const restartBtn = document.querySelector("#restartBtn");
const playAgainBtn = document.querySelector("#playAgainBtn");
const quizCard = document.querySelector("#quizCard");
const resultCard = document.querySelector("#resultCard");
const resultTitle = document.querySelector("#resultTitle");
const resultText = document.querySelector("#resultText");
const toast = document.querySelector("#toast");
const confettiLayer = document.querySelector("#confettiLayer");

let currentIndex = 0;
let score = 0;
let streak = 0;
let correctCount = 0;
let answered = false;

totalQuestionsEl.textContent = questions.length;

if (!questions.length) {
  questionText.textContent = "Chưa có dữ liệu câu hỏi.";
  answersEl.innerHTML = "";
  nextBtn.disabled = true;
}

function renderQuestion() {
  if (!questions.length) return;

  const item = questions[currentIndex];
  answered = false;

  currentQuestionEl.textContent = currentIndex + 1;
  categoryEl.textContent = item.category;
  questionText.textContent = item.question;
  pointsEl.textContent = `+${pointsForCurrentStreak()} điểm`;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.disabled = true;
  nextBtn.textContent = currentIndex === questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo";
  progressBar.style.width = `${(currentIndex / questions.length) * 100}%`;

  answersEl.innerHTML = "";
  item.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.type = "button";
    button.innerHTML = `<span class="answer-key">${String.fromCharCode(65 + index)}</span><span>${answer}</span>`;
    button.addEventListener("click", () => chooseAnswer(index));
    answersEl.appendChild(button);
  });
}

function chooseAnswer(index) {
  if (answered) return;

  answered = true;
  const item = questions[currentIndex];
  const buttons = [...document.querySelectorAll(".answer")];
  const isCorrect = index === item.correct;

  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === item.correct) button.classList.add("correct");
    if (buttonIndex === index && !isCorrect) button.classList.add("wrong");
  });

  if (isCorrect) {
    const gained = pointsForCurrentStreak();
    score += gained;
    streak += 1;
    correctCount += 1;
    feedbackEl.textContent = `Chinh xac! ${item.explanation}`;
    feedbackEl.classList.add("good");
    flashCard("correct-flash");
    popScore();
    showToast(`+${gained} điểm | Streak ${streak}`);
    burstConfetti();
  } else {
    streak = 0;
    feedbackEl.textContent = `Chua dung. ${item.explanation}`;
    feedbackEl.classList.add("bad");
    flashCard("wrong-flash");
    showToast("Sai rồi, thử câu tiếp theo nào");
  }

  updateStats();
  nextBtn.disabled = false;
}

function pointsForCurrentStreak() {
  return 10 + Math.min(streak, 5) * 3;
}

function updateStats() {
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  const attempted = currentIndex + (answered ? 1 : 0);
  const accuracy = attempted ? Math.round((correctCount / attempted) * 100) : 0;
  accuracyEl.textContent = `${accuracy}%`;
}

function nextQuestion() {
  if (currentIndex === questions.length - 1) {
    showResult();
    return;
  }

  currentIndex += 1;
  renderQuestion();
}

function showResult() {
  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
  progressBar.style.width = "100%";
  const accuracy = Math.round((correctCount / questions.length) * 100);
  resultTitle.textContent = `${score} điểm - đúng ${correctCount}/${questions.length} câu`;
  resultText.textContent = `Độ chính xác ${accuracy}%. ${accuracy >= 80 ? "Kết quả rất tốt." : "Hãy làm lại để tăng điểm và giữ streak cao hơn."}`;
  if (accuracy >= 80) burstConfetti(70);
}

function restart() {
  currentIndex = 0;
  score = 0;
  streak = 0;
  correctCount = 0;
  answered = false;
  resultCard.classList.add("hidden");
  quizCard.classList.remove("hidden");
  updateStats();
  renderQuestion();
}

function popScore() {
  scoreEl.classList.remove("score-pop");
  void scoreEl.offsetWidth;
  scoreEl.classList.add("score-pop");
}

function flashCard(className) {
  quizCard.classList.remove("correct-flash", "wrong-flash");
  void quizCard.offsetWidth;
  quizCard.classList.add(className);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1300);
}

function burstConfetti(count = 34) {
  const colors = ["#ae1c3f", "#0f9f6e", "#f2a51a", "#276ef1", "#e04b6f"];

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.18}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    confettiLayer.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", restart);
playAgainBtn.addEventListener("click", restart);

renderQuestion();
updateStats();
