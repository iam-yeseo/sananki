/* ============================================================
 * 사난기 — 앱 로직
 * ============================================================ */

/* ---------- 유틸 ---------- */
const $ = (sel) => document.querySelector(sel);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* 보기 순서를 섞고, 섞인 배열 기준의 정답 인덱스를 다시 계산한 문제 객체를 반환 */
function shuffleChoices(question) {
  const order = shuffle(question.choices.map((_, i) => i));
  return {
    q: question.q,
    choices: order.map((i) => question.choices[i]),
    answer: order.indexOf(question.answer),
    explanation: question.explanation || null,
  };
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $("#" + id).classList.add("active");
  window.scrollTo(0, 0);
}

/* ---------- 모달 ---------- */
function showModal({ title, desc, cancelText, confirmText, onCancel, onConfirm }) {
  $("#modal-title").textContent = title;
  $("#modal-desc").textContent = desc;
  $("#modal-cancel").textContent = cancelText;
  $("#modal-confirm").textContent = confirmText;
  $("#modal-overlay").classList.remove("hidden");

  $("#modal-cancel").onclick = () => {
    hideModal();
    if (onCancel) onCancel();
  };
  $("#modal-confirm").onclick = () => {
    hideModal();
    if (onConfirm) onConfirm();
  };
}

function hideModal() {
  $("#modal-overlay").classList.add("hidden");
}

/* ============================================================
 * 홈 화면
 * ============================================================ */
let currentCert = "gisa";

function updateCertInfo() {
  const cert = QUESTION_BANK[currentCert];
  const totalQ = cert.subjects.length * cert.questionsPerSubject;
  const h = Math.floor(cert.timeLimitMin / 60);
  const m = cert.timeLimitMin % 60;
  const timeStr = m ? `${h}시간 ${m}분` : `${h}시간`;
  $("#cert-info").textContent =
    `${cert.subjects.length}과목 · 총 ${totalQ}문제 · ${timeStr}`;
  $("#exam-mode-desc").textContent =
    `실제 시험처럼 ${timeStr} 타이머로 진행`;
}

function initHome() {
  document.querySelectorAll(".cert-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".cert-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCert = btn.dataset.cert;
      updateCertInfo();
    });
  });

  $("#btn-practice").addEventListener("click", startPractice);
  $("#btn-exam").addEventListener("click", startExam);

  if (typeof SAMPLE_MODE !== "undefined" && SAMPLE_MODE) {
    $("#data-notice").textContent =
      "⚠️ 현재 문제은행 자료가 없어 샘플 문제로 동작합니다. 실제 자료 입력 후 정식 이용이 가능합니다.";
  } else {
    $("#data-notice").classList.add("hidden");
  }

  updateCertInfo();
}

/* ============================================================
 * 연습 모드
 * ============================================================ */
const practice = {
  cert: null,
  subjectIdx: 0,
  question: null,    // 보기 섞인 현재 문제
  lastQText: null,   // 직전 문제(연속 중복 방지)
  selected: null,
  checked: false,
};

function startPractice() {
  practice.cert = QUESTION_BANK[currentCert];
  practice.subjectIdx = 0;
  practice.lastQText = null;
  renderPracticeTabs();
  loadPracticeQuestion();
  showScreen("screen-practice");
}

function renderPracticeTabs() {
  const nav = $("#practice-subject-tabs");
  nav.innerHTML = "";
  practice.cert.subjects.forEach((subject, i) => {
    const btn = document.createElement("button");
    btn.className = "subject-tab" + (i === practice.subjectIdx ? " active" : "");
    btn.textContent = `${i + 1}. ${subject.name}`;
    btn.addEventListener("click", () => {
      practice.subjectIdx = i;
      practice.lastQText = null;
      renderPracticeTabs();
      loadPracticeQuestion();
    });
    nav.appendChild(btn);
  });
  // 현재 탭이 보이도록 스크롤
  const active = nav.querySelector(".subject-tab.active");
  if (active) active.scrollIntoView({ inline: "center", block: "nearest" });
}

/* 현재 과목에서 랜덤 한 문제 출제 */
function loadPracticeQuestion() {
  const subject = practice.cert.subjects[practice.subjectIdx];
  const pool = subject.questions;

  if (!pool.length) {
    $("#practice-q-meta").textContent = subject.name;
    $("#practice-q-text").textContent = "이 과목에는 아직 등록된 문제가 없습니다.";
    $("#practice-choices").innerHTML = "";
    $("#practice-explanation").classList.add("hidden");
    $("#practice-check").classList.remove("hidden");
    $("#practice-check").disabled = true;
    $("#practice-next").classList.add("hidden");
    return;
  }

  // 직전 문제와 같은 문제는 피해서 뽑기 (문제가 2개 이상일 때)
  let picked;
  do {
    picked = pool[Math.floor(Math.random() * pool.length)];
  } while (pool.length > 1 && picked.q === practice.lastQText);
  practice.lastQText = picked.q;

  practice.question = shuffleChoices(picked);
  practice.selected = null;
  practice.checked = false;

  $("#practice-q-meta").textContent = subject.name;
  $("#practice-q-text").textContent = practice.question.q;
  $("#practice-explanation").classList.add("hidden");
  $("#practice-check").classList.remove("hidden");
  $("#practice-check").disabled = true;
  $("#practice-next").classList.add("hidden");

  renderChoices($("#practice-choices"), practice.question.choices, {
    onSelect: (i, btns) => {
      if (practice.checked) return;
      practice.selected = i;
      btns.forEach((b, bi) => b.classList.toggle("selected", bi === i));
      $("#practice-check").disabled = false;
    },
  });
}

/* 보기 목록 렌더링 (연습/실전 공용) */
function renderChoices(container, choices, { onSelect, selectedIdx = null }) {
  container.innerHTML = "";
  const btns = [];
  choices.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn" + (i === selectedIdx ? " selected" : "");
    btn.innerHTML = `<span class="choice-num">${i + 1}</span><span>${text}</span>`;
    btn.addEventListener("click", () => onSelect(i, btns));
    container.appendChild(btn);
    btns.push(btn);
  });
  return btns;
}

/* 정답 확인 */
function checkPracticeAnswer() {
  if (practice.selected === null || practice.checked) return;
  practice.checked = true;

  const { answer, explanation } = practice.question;
  const isCorrect = practice.selected === answer;
  const btns = $("#practice-choices").querySelectorAll(".choice-btn");

  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === answer) btn.classList.add("correct");
    else if (i === practice.selected) btn.classList.add("wrong");
  });

  const exp = $("#practice-explanation");
  exp.className = "explanation " + (isCorrect ? "is-correct" : "is-wrong");
  exp.innerHTML =
    `<span class="verdict">${isCorrect ? "⭕ 정답입니다!" : "❌ 오답입니다."}</span>` +
    (explanation ? explanation : `정답은 ${answer + 1}번입니다.`);
  exp.classList.remove("hidden");

  $("#practice-check").classList.add("hidden");
  $("#practice-next").classList.remove("hidden");
}

function initPractice() {
  $("#practice-back").addEventListener("click", () => showScreen("screen-home"));
  $("#practice-check").addEventListener("click", checkPracticeAnswer);
  $("#practice-next").addEventListener("click", loadPracticeQuestion);
}

/* ============================================================
 * 실전대비 모드
 * ============================================================ */
const exam = {
  cert: null,
  questions: [],     // 전체 문제 (과목 순서대로 평탄화, 보기 섞임)
  answers: [],       // 선택한 보기 인덱스 (null = 미응답)
  subjectRanges: [], // [{ name, start, end }]  end는 미포함
  currentIdx: 0,
  timerId: null,
  endTime: 0,
  finished: false,
  completeModalShown: false, // 전부 풀었을 때 팝업은 한 번만
};

function startExam() {
  const cert = QUESTION_BANK[currentCert];
  exam.cert = cert;
  exam.questions = [];
  exam.subjectRanges = [];
  exam.finished = false;
  exam.completeModalShown = false;

  // 과목별로 랜덤 추출 + 보기 섞기
  cert.subjects.forEach((subject) => {
    const picked = shuffle(subject.questions).slice(0, cert.questionsPerSubject);
    const start = exam.questions.length;
    picked.forEach((q) => exam.questions.push(shuffleChoices(q)));
    exam.subjectRanges.push({ name: subject.name, start, end: exam.questions.length });
  });

  if (exam.questions.length === 0) {
    showModal({
      title: "문제가 없습니다",
      desc: "문제은행에 등록된 문제가 없어 실전대비를 시작할 수 없습니다.",
      cancelText: "닫기",
      confirmText: "확인",
    });
    return;
  }

  exam.answers = new Array(exam.questions.length).fill(null);
  exam.currentIdx = 0;

  // 타이머 시작
  exam.endTime = Date.now() + cert.timeLimitMin * 60 * 1000;
  updateExamTimer();
  exam.timerId = setInterval(updateExamTimer, 250);

  renderExamTabs();
  renderExamQuestion();
  showScreen("screen-exam");
}

function updateExamTimer() {
  const remainMs = Math.max(0, exam.endTime - Date.now());
  const totalSec = Math.ceil(remainMs / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");

  const timerEl = $("#exam-timer");
  timerEl.textContent = `${h}:${m}:${s}`;
  timerEl.classList.toggle("warning", totalSec <= 600); // 10분 이하 경고색

  // 시간 경과 → 사용자 선택 없이 즉시 채점으로 이동
  if (remainMs <= 0 && !exam.finished) {
    hideModal();
    finishExam();
  }
}

function subjectIdxOfQuestion(qIdx) {
  return exam.subjectRanges.findIndex((r) => qIdx >= r.start && qIdx < r.end);
}

function unansweredCount() {
  return exam.answers.filter((a) => a === null).length;
}

function renderExamTabs() {
  const nav = $("#exam-subject-tabs");
  nav.innerHTML = "";
  const currentSubject = subjectIdxOfQuestion(exam.currentIdx);

  exam.subjectRanges.forEach((range, i) => {
    const answered = exam.answers
      .slice(range.start, range.end)
      .filter((a) => a !== null).length;
    const total = range.end - range.start;

    const btn = document.createElement("button");
    btn.className = "subject-tab" + (i === currentSubject ? " active" : "");
    btn.innerHTML =
      `${i + 1}과목<span class="tab-count">${answered}/${total}</span>`;
    btn.title = range.name;
    btn.addEventListener("click", () => {
      exam.currentIdx = range.start;
      renderExamTabs();
      renderExamQuestion();
    });
    nav.appendChild(btn);
  });

  const active = nav.querySelector(".subject-tab.active");
  if (active) active.scrollIntoView({ inline: "center", block: "nearest" });

  // 남은 문항 수
  $("#exam-remaining").textContent = `남은 문제 ${unansweredCount()}문항`;
}

function renderExamQNav() {
  const nav = $("#exam-q-nav");
  nav.innerHTML = "";
  const sIdx = subjectIdxOfQuestion(exam.currentIdx);
  const range = exam.subjectRanges[sIdx];

  for (let i = range.start; i < range.end; i++) {
    const btn = document.createElement("button");
    btn.className =
      "q-nav-btn" +
      (exam.answers[i] !== null ? " answered" : "") +
      (i === exam.currentIdx ? " current" : "");
    btn.textContent = i - range.start + 1;
    btn.addEventListener("click", () => {
      exam.currentIdx = i;
      renderExamQuestion();
    });
    nav.appendChild(btn);
  }

  const current = nav.querySelector(".q-nav-btn.current");
  if (current) current.scrollIntoView({ inline: "center", block: "nearest" });
}

function renderExamQuestion() {
  const q = exam.questions[exam.currentIdx];
  const sIdx = subjectIdxOfQuestion(exam.currentIdx);
  const range = exam.subjectRanges[sIdx];
  const numInSubject = exam.currentIdx - range.start + 1;

  $("#exam-q-meta").textContent =
    `${range.name} · ${numInSubject}/${range.end - range.start}`;
  $("#exam-q-text").textContent = q.q;

  renderChoices($("#exam-choices"), q.choices, {
    selectedIdx: exam.answers[exam.currentIdx],
    onSelect: (i, btns) => {
      const wasUnanswered = exam.answers[exam.currentIdx] === null;
      exam.answers[exam.currentIdx] = i;
      btns.forEach((b, bi) => b.classList.toggle("selected", bi === i));
      renderExamTabs();
      renderExamQNav();

      // 마지막 문제까지 전부 풀었으면 종료 여부 팝업 (한 번만)
      if (wasUnanswered && unansweredCount() === 0 && !exam.completeModalShown) {
        exam.completeModalShown = true;
        showModal({
          title: "모든 문제를 다 풀었습니다.",
          desc: "시험을 종료하고 채점할까요?",
          cancelText: "검토하기",
          confirmText: "종료하기",
          onConfirm: finishExam,
        });
      }
    },
  });

  renderExamTabs();
  renderExamQNav();

  $("#exam-prev").disabled = exam.currentIdx === 0;
  $("#exam-next").disabled = exam.currentIdx === exam.questions.length - 1;
}

function moveExam(delta) {
  const next = exam.currentIdx + delta;
  if (next < 0 || next >= exam.questions.length) return;
  exam.currentIdx = next;
  renderExamQuestion();
}

/* 상단 "시험 종료" 버튼 */
function requestEndExam() {
  const remain = unansweredCount();
  showModal({
    title: remain > 0 ? `아직 ${remain}문항이 남았습니다.` : "시험을 종료할까요?",
    desc: remain > 0
      ? "지금 종료하면 남은 문제는 오답 처리됩니다."
      : "종료하면 바로 채점이 진행됩니다.",
    cancelText: "검토하기",
    confirmText: "종료하기",
    onConfirm: finishExam,
  });
}

/* 시험 종료 → 채점 로딩 → 성적표 */
function finishExam() {
  if (exam.finished) return;
  exam.finished = true;
  clearInterval(exam.timerId);

  showScreen("screen-grading");

  // 채점하는 중... 로딩 후 성적표로 이동
  setTimeout(() => {
    const result = gradeExam();
    renderResult(result);
    showScreen("screen-result");
  }, 1800);
}

function gradeExam() {
  const subjects = exam.subjectRanges.map((range) => {
    const total = range.end - range.start;
    let correct = 0;
    for (let i = range.start; i < range.end; i++) {
      if (exam.answers[i] === exam.questions[i].answer) correct++;
    }
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { name: range.name, correct, total, score };
  });

  const avg = Math.round(
    subjects.reduce((sum, s) => sum + s.score, 0) / subjects.length
  );
  const pass = avg >= 60 && subjects.every((s) => s.score >= 40);

  return { subjects, avg, pass };
}

function renderResult({ subjects, avg, pass }) {
  $("#result-total-score").textContent = `${avg}점`;

  const pf = $("#result-passfail");
  pf.textContent = pass ? "합격" : "불합격";
  pf.className = "result-passfail " + (pass ? "pass" : "fail");

  const list = $("#result-subjects");
  list.innerHTML = "";
  subjects.forEach((s, i) => {
    const row = document.createElement("div");
    row.className = "result-subject-row";
    row.innerHTML = `
      <div>
        <div class="result-subject-name">${i + 1}. ${s.name}</div>
        <div class="result-subject-detail">${s.correct} / ${s.total} 문제</div>
      </div>
      <div class="result-subject-score${s.score < 40 ? " low" : ""}">${s.score}점</div>
    `;
    list.appendChild(row);
  });
}

function initExam() {
  $("#btn-end-exam").addEventListener("click", requestEndExam);
  $("#exam-prev").addEventListener("click", () => moveExam(-1));
  $("#exam-next").addEventListener("click", () => moveExam(1));
  $("#result-home").addEventListener("click", () => showScreen("screen-home"));
}

/* ============================================================
 * 초기화
 * ============================================================ */
initHome();
initPractice();
initExam();
