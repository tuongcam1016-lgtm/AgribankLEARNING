const topicGrid = document.querySelector("#topicGrid");
const topicSelection = document.querySelector("#topicSelection");
const navGrid = document.querySelector("#navGrid");
const navProgress = document.querySelector("#navProgress");
const starBtn = document.querySelector("#starBtn");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");

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
let questionStates = []; // Trạng thái từng câu: { answered: bool, correct: bool, bookmarked: bool, selected: number }

function renderTopics() {
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

  let sourcePool = [...window.quizQuestions];
  
  if (mode === 'learning') {
    if (categoryId) {
        sourcePool = sourcePool.filter(q => q.category === categoryId);
    }
    questions = shuffle(sourcePool);
    timerContainer.classList.add("hidden");
    streakContainer.classList.remove("hidden");
    statsPanel.classList.remove("exam-mode");
    examTimeResult.classList.add("hidden");
  } else {
    questions = shuffle(sourcePool).slice(0, 100);
    timeLeft = 60 * 60; 
    startTime = Date.now();
    timerContainer.classList.remove("hidden");
    streakContainer.classList.add("hidden");
    statsPanel.classList.add("exam-mode");
    startTimer();
  }

  // Khởi tạo trạng thái cho tất cả các câu hỏi
  questionStates = questions.map(() => ({
    answered: false,
    correct: null,
    bookmarked: false,
    selected: null
  }));

  totalQuestionsEl.textContent = questions.length;
  topicSelection.classList.add("hidden");
  quizCard.classList.remove("hidden");
  resultCard.classList.add("hidden");

  updateStats();
  renderNav();
  renderQuestion();
}

function renderNav() {
  navGrid.innerHTML = "";
  navProgress.textContent = `${questionStates.filter(s => s.answered).length}/${questions.length}`;
  
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

  currentQuestionEl.textContent = currentIndex + 1;
  categoryEl.textContent = item.category || "General";
  questionText.textContent = item.question;
  pointsEl.textContent = quizMode === 'learning' ? `+${pointsForCurrentStreak()} điểm` : "Thi thử";
  
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  
  // Nút điều hướng
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = !answered;
  nextBtn.textContent = currentIndex === questions.length - 1 ? "Xem kết quả" : "Câu tiếp";
  
  progressBar.style.width = `${(currentIndex / questions.length) * 100}%`;
  updateStarUI();

  answersEl.innerHTML = "";
  const options = item.options || item.answers || [];
  options.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer";
    button.type = "button";
    button.innerHTML = `<span class="answer-key">${String.fromCharCode(65 + index)}</span><span>${answer}</span>`;
    
    // Nếu đã trả lời rồi thì hiển thị kết quả luôn
    if (answered) {
        button.disabled = true;
        if (index === item.correct) button.classList.add("correct");
        if (index === state.selected && !state.correct) button.classList.add("wrong");
    } else {
        button.addEventListener("click", () => chooseAnswer(index));
    }
    
    answersEl.appendChild(button);
  });

  if (answered) {
    feedbackEl.textContent = state.correct ? `Chính xác! ${item.explanation}` : `Chưa đúng. ${item.explanation}`;
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
  scoreEl.textContent = score;
  streakEl.textContent = streak;
  const attempted = questionStates.filter(s => s.answered).length;
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
  quizCard.classList.add("hidden");
  resultCard.classList.remove("hidden");
  progressBar.style.width = "100%";
  
  const accuracy = Math.round((correctCount / questions.length) * 100);
  resultTitle.textContent = `${score} điểm - Đúng ${correctCount}/${questions.length} câu`;
  
  let msg = `Độ chính xác ${accuracy}%. `;
  if (quizMode === 'exam') {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const spentMins = Math.floor(timeSpent / 60);
    const spentSecs = timeSpent % 60;
    examTimeResult.textContent = `Thời gian làm bài: ${spentMins} phút ${spentSecs} giây`;
    examTimeResult.classList.remove("hidden");
    
    if (accuracy >= 80) msg += "Bạn đã vượt qua kỳ thi thử!";
    else msg += "Bạn cần cố gắng hơn để vượt qua kỳ thi.";
  } else {
    msg += accuracy >= 80 ? "Kết quả rất tốt." : "Hãy làm lại để tăng điểm và giữ streak cao hơn.";
  }
  
  resultText.textContent = msg;
  if (accuracy >= 80) burstConfetti(70);
}

function quitToMenu() {
  clearInterval(timerInterval);
  quizCard.classList.add("hidden");
  resultCard.classList.add("hidden");
  topicSelection.classList.remove("hidden");
  timerContainer.classList.add("hidden");
  streakContainer.classList.remove("hidden");
  statsPanel.classList.remove("exam-mode");
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

examModeBtn.addEventListener("click", () => initQuiz('exam'));
nextBtn.addEventListener("click", nextQuestion);
prevBtn.addEventListener("click", prevQuestion);
starBtn.addEventListener("click", toggleBookmark);
restartBtn.addEventListener("click", quitToMenu);
playAgainBtn.addEventListener("click", quitToMenu);

// Trạng thái ban đầu
quizCard.classList.add("hidden");
resultCard.classList.add("hidden");
topicSelection.classList.remove("hidden");
renderTopics();
