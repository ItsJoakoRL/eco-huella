import quizData from "../data/quizData";
import {
  buildQuizResult,
  calculateQuizResults as calculate,
} from "../../backend/shared/quizCalculator";

// El cálculo vive en backend/shared/quizCalculator.js: el servidor usa el mismo para
// guardar el resultado oficial, así que esto y lo guardado siempre coinciden.
export const calculateQuizResults = (answersData = {}) => calculate(quizData, answersData);

export const buildQuizResultPayload = (answersData = {}, surveyType = "ambiental") => {
  const payload = buildQuizResult(quizData, answersData, surveyType);

  return {
    ...payload,
    metadata: { ...payload.metadata, completed_at: new Date().toISOString() },
  };
};
