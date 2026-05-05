// Các khai báo phần tử DOM
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
const prevBtn = document.querySelector("#prevBtn");
const restartBtn = document.querySelector("#restartBtn");
const playAgainBtn = document.querySelector("#playAgainBtn");
const quizCard = document.querySelector("#quizCard");
const resultCard = document.querySelector("#resultCard");
const resultTitle = document.querySelector("#resultTitle");
const resultText = document.querySelector("#resultText");
const toast = document.querySelector("#toast");
const confettiLayer = document.querySelector("#confettiLayer");
const timerEl = document.querySelector("#timer");
const timerContainer = document.querySelector("#timerContainer");
const streakContainer = document.querySelector("#streakContainer");
const statsPanel = document.querySelector(".stats-panel");
const examTimeResult = document.querySelector("#examTimeResult");

const topicGrid = document.querySelector("#topicGrid");
const topicSelection = document.querySelector("#topicSelection");
const navGrid = document.querySelector("#navGrid");
const navProgress = document.querySelector("#navProgress");
const starBtn = document.querySelector("#starBtn");
const examModeBtn = document.querySelector("#examModeBtn");

const TOPICS = [
  { id: "XULYNO", name: "Xử lý nợ", icon: "🧮", count: 240 },
  { id: "TTQT", name: "TTQT & TTTM", icon: "🚢", count: 240 },
  { id: "QLRR", name: "Kế hoạch & QLRR", icon: "📊", count: 240 },
  { id: "KTGDNB", name: "Kế toán nội bộ", icon: "🏦", count: 240 },
  { id: "KTGDKH", name: "Kế toán khách hàng", icon: "🎧", count: 240 },
  { id: "KIEMNGAN", name: "Kiểm ngân", icon: "💵", count: 240 },
  { id: "KTGSNB", name: "KTGSNB", icon: "🛡️", count: 240 },
  { id: "CNTT", name: "Công nghệ thông tin", icon: "💻", count: 240 },
  { id: "NSTL", name: "Nhân sự - Tiền lương", icon: "📅", count: 240 },
  { id: "PHAPCHE", name: "Pháp chế", icon: "⚖️", count: 240 },
  { id: "XDCB", name: "XDCB & QTHC", icon: "🛠️", count: 240 },
  { id: "VTLT", name: "Văn thư, lễ tân", icon: "✉️", count: 240 },
  { id: "CPC", name: "Chi nhánh Campuchia", icon: "🗺️", count: 187 },
  { id: "KIENTHUCCHUNG", name: "Kiến thức chung", icon: "📖", count: 190 },
  { id: "QLCP", name: "Quản lý cấp phòng", icon: "💬", count: 50 },
  { id: "TCTP", name: "Tiêu chuẩn tác phong", icon: "👔", count: 10 },
  { id: "KHDN", name: "Tín dụng KHDN", icon: "🏢", count: 240 },
  { id: "THAMDINH", name: "Thẩm định", icon: "🔍", count: 240 },
  { id: "KHCN", name: "Tín dụng KHCN", icon: "👤", count: 240 }
];

let questions = [];
let currentIndex = 0;
let score = 0;
let streak = 0;
let correctCount = 0;
let answered = false;
let quizMode = 'learning'; 
let timeLeft = 0;
let timerInterval = null;
let startTime = 0;
let questionStates = []; 

function renderTopics() {
  if (!topicGrid) return;
  topicGrid.innerHTML = "";
  TOPICS.forEach(topic => {
    const card = document.createElement("div");
    card.className = "topic-card";
    card.innerHTML = `
      <div class="topic-icon">${topic.icon}</div>
      <h3>${topic.name}</h3>
      <p>${topic.count} Câu</p>
      <button class="btn-access">🚀 Truy cập</button>
    `;
    card.addEventListener("click", () => initQuiz('learning', topic.id));
    topicGrid.appendChild(card);
  });
}

function initQuiz(mode, categoryId = null) {
  quizMode = mode;
  currentIndex = 0;
  score = 0;
  streak = 0;
  correctCount = 0;
  answered = false;

  let sourcePool = Array.isArray(window.quizQuestions) ? [...window.quizQuestions] : [];
  
  if (mode === 'learning') {
    if (categoryId) {
        sourcePool = sourcePool.filter(q => q.category === categoryId);
    }
    questions = shuffle(sourcePool);
    if (timerContainer) timerContainer.classList.add("hidden");
    if (streakContainer) streakContainer.classList.remove("hidden");
    if (statsPanel) statsPanel.classList.remove("exam-mode");
    if (examTimeResult) examTimeResult.classList.add("hidden");
  } else {
    questions = shuffle(sourcePool).slice(0, 100);
    timeLeft = 60 * 60; 
    startTime = Date.now();
    if (timerContainer) timerContainer.classList.remove("hidden");
    if (streakContainer) streakContainer.classList.add("hidden");
    if (statsPanel) statsPanel.classList.add("exam-mode");
    startTimer();
  }

  questionStates = questions.map(() => ({
    answered: false,
    correct: null,
    bookmarked: false,
    selected: null
  }));

  if (totalQuestionsEl) totalQuestionsEl.textContent = questions.length;
  if (topicSelection) topicSelection.classList.add("hidden");
  if (quizCard) quizCard.classList.remove("hidden");
  if (resultCard) resultCard.classList.add("hidden");

  updateStats();
  renderNav();
  renderQuestion();
}

function renderNav() {
  if (!navGrid) return;
  navGrid.innerHTML = "";
  if (navProgress) navProgress.textContent = `${questionStates.filter(s => s.answered).length}/${questions.length}`;
  
  questionStates.forEach((state, idx) => {
    const item = document.createElement("div");
    item.className = "nav-item";
    if (idx === currentIndex) item.classList.add("current");
    if (state.correct === true) item.classList.add("correct");
    if (state.correct === false) item.classList.add("wrong");
    if (state.bookmarked) item.classList.add("bookmarked");
    
    item.textContent = idx + 1;
    item.addEventListener("click", () => jumpToQuestion(idx));
    navGrid.appendChild(item);
  });
}

function jumpToQuestion(idx) {
    currentIndex = idx;
    renderQuestion();
    renderNav();
}

function toggleBookmark() {
    questionStates[currentIndex].bookmarked = !questionStates[currentIndex].bookmarked;
    updateStarUI();
    renderNav();
}

function updateStarUI() {
    if (!starBtn) return;
    const isBookmarked = questionStates[currentIndex].bookmarked;
    starBtn.classList.toggle("active", isBookmarked);
    starBtn.innerHTML = isBookmarked ? `<span class="star-icon">★</span> Đã lưu` : `<span class="star-icon">☆</span> Lưu câu hỏi`;
}

function startTimer() {
  clearInterval(timerInterval);
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showResult();
    }
  }, 1000);
}

function updateTimerDisplay() {
  if (!timerEl) return;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  if (timeLeft < 300) { 
    timerEl.classList.add("warning");
  } else {
    timerEl.classList.remove("warning");
  }
}

function renderQuestion() {
  if (!questions.length) return;

  const item = questions[currentIndex];
  const state = questionStates[currentIndex];
  answered = state.answered;

  if (currentQuestionEl) currentQuestionEl.textContent = currentIndex + 1;
  if (categoryEl) categoryEl.textContent = item.category || "General";
  if (questionText) questionText.textContent = item.question;
  if (pointsEl) pointsEl.textContent = quizMode === 'learning' ? `+${pointsForCurrentStreak()} điểm` : "Thi thử";
  
  if (feedbackEl) {
    feedbackEl.textContent = "";
    feedbackEl.className = "feedback";
  }
  
  if (prevBtn) prevBtn.disabled = currentIndex === 0;
  if (nextBtn) {
    nextBtn.disabled = !answered;
    nextBtn.textContent = currentIndex === questions.length - 1 ? "Xem kết quả" : "Câu tiếp";
  }
  
  if (progressBar) progressBar.style.width = `${(currentIndex / questions.length) * 100}%`;
  updateStarUI();

  if (answersEl) {
    answersEl.innerHTML = "";
    const options = item.options || item.answers || [];
    options.forEach((answer, index) => {
      const button = document.createElement("button");
      button.className = "answer";
      button.type = "button";
      button.innerHTML = `<span class="answer-key">${String.fromCharCode(65 + index)}</span><span>${answer}</span>`;
      
      if (answered) {
          button.disabled = true;
          if (index === item.correct) button.classList.add("correct");
          if (index === state.selected && !state.correct) button.classList.add("wrong");
      } else {
          button.addEventListener("click", () => chooseAnswer(index));
      }
      
      answersEl.appendChild(button);
    });
  }

  if (answered && feedbackEl) {
    feedbackEl.textContent = state.correct ? `Chính xác! ${item.explanation || ''}` : `Chưa đúng. ${item.explanation || ''}`;
    feedbackEl.classList.add(state.correct ? "good" : "bad");
  }
}

function chooseAnswer(index) {
  if (answered) return;

  const item = questions[currentIndex];
  const state = questionStates[currentIndex];
  const isCorrect = index === item.correct;

  state.answered = true;
  state.correct = isCorrect;
  state.selected = index;
  answered = true;

  if (isCorrect) {
    if (quizMode === 'learning') {
      const gained = pointsForCurrentStreak();
      score += gained;
      streak += 1;
      showToast(`+${gained} điểm | Streak ${streak}`);
    } else {
      score += 10;
    }
    correctCount += 1;
    flashCard("correct-flash");
    if (quizMode === 'learning') {
        popScore();
        burstConfetti();
    }
  } else {
    streak = 0;
    flashCard("wrong-flash");
    if (quizMode === 'learning') showToast("Sai rồi, thử câu tiếp theo nào");
  }

  updateStats();
  renderQuestion();
  renderNav();
}

function pointsForCurrentStreak() {
  return 10 + Math.min(streak, 5) * 3;
}

function updateStats() {
  if (scoreEl) scoreEl.textContent = score;
  if (streakEl) streakEl.textContent = streak;
  const attempted = questionStates.filter(s => s.answered).length;
  const accuracy = attempted ? Math.round((correctCount / attempted) * 100) : 0;
  if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;
}

function nextQuestion() {
  if (currentIndex === questions.length - 1) {
    showResult();
    return;
  }

  currentIndex += 1;
  renderQuestion();
  renderNav();
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex -= 1;
        renderQuestion();
        renderNav();
    }
}

function showResult() {
  clearInterval(timerInterval);
  if (quizCard) quizCard.classList.add("hidden");
  if (resultCard) resultCard.classList.remove("hidden");
  if (progressBar) progressBar.style.width = "100%";
  
  const accuracy = Math.round((correctCount / questions.length) * 100);
  if (resultTitle) resultTitle.textContent = `${score} điểm - Đúng ${correctCount}/${questions.length} câu`;
  
  let msg = `Độ chính xác ${accuracy}%. `;
  if (quizMode === 'exam') {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const spentMins = Math.floor(timeSpent / 60);
    const spentSecs = timeSpent % 60;
    if (examTimeResult) {
      examTimeResult.textContent = `Thời gian làm bài: ${spentMins} phút ${spentSecs} giây`;
      examTimeResult.classList.remove("hidden");
    }
    
    if (accuracy >= 80) msg += "Bạn đã vượt qua kỳ thi thử!";
    else msg += "Bạn cần cố gắng hơn để vượt qua kỳ thi.";
  } else {
    msg += accuracy >= 80 ? "Kết quả rất tốt." : "Hãy làm lại để tăng điểm và giữ streak cao hơn.";
  }
  
  if (resultText) resultText.textContent = msg;
  if (accuracy >= 80) burstConfetti(70);
}

function quitToMenu() {
  clearInterval(timerInterval);
  if (quizCard) quizCard.classList.add("hidden");
  if (resultCard) resultCard.classList.add("hidden");
  if (topicSelection) topicSelection.classList.remove("hidden");
  if (timerContainer) timerContainer.classList.add("hidden");
  if (streakContainer) streakContainer.classList.remove("hidden");
  if (statsPanel) statsPanel.classList.remove("exam-mode");
}

function popScore() {
  if (!scoreEl) return;
  scoreEl.classList.remove("score-pop");
  void scoreEl.offsetWidth;
  scoreEl.classList.add("score-pop");
}

function flashCard(className) {
  if (!quizCard) return;
  quizCard.classList.remove("correct-flash", "wrong-flash");
  void quizCard.offsetWidth;
  quizCard.classList.add(className);
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1300);
}

function burstConfetti(count = 34) {
  if (!confettiLayer) return;
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

if (examModeBtn) examModeBtn.addEventListener("click", () => initQuiz('exam'));
if (nextBtn) nextBtn.addEventListener("click", nextQuestion);
if (prevBtn) prevBtn.addEventListener("click", prevQuestion);
if (starBtn) starBtn.addEventListener("click", toggleBookmark);
if (restartBtn) restartBtn.addEventListener("click", quitToMenu);
if (playAgainBtn) playAgainBtn.addEventListener("click", quitToMenu);

// Khởi tạo ban đầu
if (quizCard) quizCard.classList.add("hidden");
if (resultCard) resultCard.classList.add("hidden");
if (topicSelection) topicSelection.classList.remove("hidden");
renderTopics();
