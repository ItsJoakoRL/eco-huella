export const LEGACY_QUIZ_ANSWERS_KEY = "quizAnswers";

const getUserQuizId = (user) => user?.id || user?._id || user?.username || user?.email || "guest";

export const getQuizAnswersKey = (user) => `ecohuella_quiz_answers_${getUserQuizId(user)}`;
export const getQuizHistoryKey = (user) => `ecohuella_quiz_history_${getUserQuizId(user)}`;

export const loadQuizAnswers = (user) => {
  try {
    const storedAnswers = localStorage.getItem(getQuizAnswersKey(user));
    const parsedAnswers = JSON.parse(storedAnswers || "{}");
    return parsedAnswers && typeof parsedAnswers === "object" ? parsedAnswers : {};
  } catch {
    return {};
  }
};

export const saveQuizAnswers = (user, answers) => {
  localStorage.setItem(getQuizAnswersKey(user), JSON.stringify(answers));
};

export const loadQuizHistory = (user) => {
  try {
    const storedHistory = localStorage.getItem(getQuizHistoryKey(user));
    const parsedHistory = JSON.parse(storedHistory || "[]");
    return Array.isArray(parsedHistory) ? parsedHistory : [];
  } catch {
    return [];
  }
};

export const saveQuizAttempt = (user, answers) => {
  const nextAttempt = {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    answers,
  };
  const nextHistory = [nextAttempt, ...loadQuizHistory(user)].slice(0, 20);
  localStorage.setItem(getQuizHistoryKey(user), JSON.stringify(nextHistory));
  saveQuizAnswers(user, answers);
  return nextAttempt;
};

export const deleteQuizAttempt = (user, attemptId) => {
  const nextHistory = loadQuizHistory(user).filter((attempt) => attempt.id !== attemptId);
  localStorage.setItem(getQuizHistoryKey(user), JSON.stringify(nextHistory));

  if (nextHistory[0]?.answers) {
    saveQuizAnswers(user, nextHistory[0].answers);
  } else {
    localStorage.removeItem(getQuizAnswersKey(user));
  }

  return nextHistory;
};

export const clearQuizAnswers = (user) => {
  localStorage.removeItem(getQuizAnswersKey(user));
  localStorage.removeItem(getQuizHistoryKey(user));
};

export const clearLegacyQuizAnswers = () => {
  localStorage.removeItem(LEGACY_QUIZ_ANSWERS_KEY);
};
