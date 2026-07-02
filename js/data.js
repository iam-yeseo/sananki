/* ============================================================
 * 사난기 — 문제은행 데이터
 * ============================================================
 * ※ 현재는 실제 문제은행 자료가 없어 "샘플 문제"로 틀만 잡아둔 상태.
 *   추후 실제 자료를 받으면 아래 subjects[].questions 배열에
 *   같은 형식으로 문제를 채워 넣으면 됨.
 *
 * 문제 1개의 형식:
 * {
 *   q: "문제 지문",
 *   choices: ["보기1", "보기2", "보기3", "보기4"],  // 정답 포함 4개
 *   answer: 0,            // 정답의 인덱스 (0~3). 출제 시 보기 순서는 랜덤 섞임
 *   explanation: "해설"   // (선택) 연습 모드에서 정답 확인 시 표시
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

/* ------------------------------------------------------------
 * 샘플 문제 자동 생성 (실제 자료 입력 전 흐름 테스트용)
 * 실제 문제를 넣기 시작하면 이 블록은 삭제해도 됨.
 * 과목당 questionsPerSubject 개수만큼 더미 문제를 채워 넣는다.
 * ------------------------------------------------------------ */
const SAMPLE_MODE = true; // 실제 데이터 입력 후 false 로 변경

if (SAMPLE_MODE) {
  Object.values(QUESTION_BANK).forEach((cert) => {
    cert.subjects.forEach((subject) => {
      if (subject.questions.length > 0) return; // 실제 문제가 있으면 건너뜀
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
          explanation: "샘플 해설입니다. 실제 자료 입력 시 이 자리에 해설이 표시됩니다. (해설이 없는 문제는 explanation을 생략하면 됩니다.)",
        });
      }
    });
  });
}
