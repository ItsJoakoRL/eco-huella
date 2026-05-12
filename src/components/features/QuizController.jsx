import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import quizData from "../../data/questions.json";
import { getSurveyTrack } from "../../data/surveyTracks";
import { useAuth } from "../../context/AuthContext";
import { clearLegacyQuizAnswers, saveQuizAttempt } from "../../utils/quizStorage";
import { buildQuizResultPayload } from "../../utils/quizResults";
import { quizResultsAPI } from "../../services/api";

export default function QuizController({ onFinish, onCancel }) {
  const navigate = useNavigate();
  const { trackId = "ambiental" } = useParams();
  const { user } = useAuth();
  const track = getSurveyTrack(trackId);
  const allQuestions = quizData.modules
    .filter((module) => track.modules.includes(module.id))
    .flatMap((module) =>
      module.questions.map((question) => ({
        ...question,
        moduleLabel: module.label,
      }))
    );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = allQuestions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];

  const handleSelect = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = async () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    const answersWithTrack = { ...answers, _surveyType: track.id };
    saveQuizAttempt(user, answersWithTrack);

    try {
      await quizResultsAPI.save(buildQuizResultPayload(answers, track.id));
    } catch (error) {
      console.error("No se pudo guardar el resultado en la cuenta:", error);
    }

    clearLegacyQuizAnswers();
    if (onFinish) {
      onFinish(answersWithTrack);
      return;
    }

    navigate("/dashboard");
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <QuestionCard
      question={currentQuestion}
      moduleLabel={currentQuestion.moduleLabel}
      currentStep={currentIndex + 1}
      totalSteps={allQuestions.length}
      selectedValue={currentAnswer}
      onSelect={handleSelect}
      onNext={handleNext}
      onPrev={handlePrev}
      onClose={onCancel}
    />
  );
}
