/* ============================================================
 * 사난기 — 문제은행 데이터
 * ============================================================
 * 산업안전기사: js/bank-gisa.js (2016~2022 기출 20회차 파싱본)에서 로드
 * 산업안전산업기사: 자료 입력 대기 중 (샘플 문제로 동작)
 *
 * 문제 1개의 형식:
 * {
 *   q: "문제 지문",
 *   choices: ["보기1", "보기2", "보기3", "보기4"],  // 정답 포함 4개
 *   answer: 0,            // 정답의 인덱스 (0~3). 출제 시 보기 순서는 랜덤 섞임
 *   explanation: "해설",  // (선택) 연습 모드에서 정답 확인 시 표시
 *   src: "2022.03.05 기출" // (선택) 출처 표기
 * }
 * ============================================================ */

const QUESTION_BANK = {
  gisa: {
    name: "산업안전기사",
    timeLimitMin: 180,        // 총 시험 시간 (분) — 120문제 × 1분 30초
    questionsPerSubject: 20,  // 과목당 출제 문항 수
    subjects: [
      { id: "g1", name: "산업재해 예방 및 안전보건교육", questions: [] },
      { id: "g2", name: "인간공학 및 위험성 평가·관리", questions: [] },
      { id: "g3", name: "기계·기구 및 설비 안전관리", questions: [] },
      { id: "g4", name: "전기설비 안전관리", questions: [] },
      { id: "g5", name: "화학설비 안전관리", questions: [] },
      { id: "g6", name: "건설공사 안전관리", questions: [] },
    ],
  },
  sanup: {
    name: "산업안전산업기사",
    timeLimitMin: 150,        // 100문제 × 1분 30초
    questionsPerSubject: 20,
    subjects: [
      { id: "s1", name: "산업재해 예방 및 안전보건교육", questions: [] },
      { id: "s2", name: "인간공학 및 위험성 평가·관리", questions: [] },
      { id: "s3", name: "기계·기구 및 설비 안전관리", questions: [] },
      { id: "s4", name: "전기 및 화학설비 안전관리", questions: [] },
      { id: "s5", name: "건설공사 안전관리", questions: [] },
    ],
  },
};

/* ---- 산업안전기사: 기출 문제은행 로드 (bank-gisa.js) ---- */
if (typeof BANK_GISA !== "undefined") {
  QUESTION_BANK.gisa.subjects.forEach((subject, i) => {
    subject.questions = BANK_GISA[i] || [];
  });
}

/* ------------------------------------------------------------
 * 샘플 문제 자동 생성 — 실제 자료가 없는 과목만 채운다.
 * (현재는 산업안전산업기사만 해당. 실제 자료 입력 후 이 블록 삭제 가능)
 * ------------------------------------------------------------ */
const SAMPLE_MODE = true;

if (SAMPLE_MODE) {
  Object.values(QUESTION_BANK).forEach((cert) => {
    cert.subjects.forEach((subject) => {
      if (subject.questions.length > 0) return; // 실제 문제가 있으면 건너뜀
      cert.hasSample = true;
      for (let i = 1; i <= cert.questionsPerSubject; i++) {
        subject.questions.push({
          q: `[샘플] 「${subject.name}」 과목의 예시 문제 ${i}번입니다. 실제 문제은행 자료가 입력되면 이 자리에 문제 지문이 표시됩니다. 다음 중 정답으로 표시되도록 설정된 보기는?`,
          choices: [
            "이 보기가 정답입니다",
            "오답 보기 A",
            "오답 보기 B",
            "오답 보기 C",
          ],
          answer: 0,
          explanation: "샘플 해설입니다. 실제 자료 입력 시 이 자리에 해설이 표시됩니다.",
        });
      }
    });
  });
}
