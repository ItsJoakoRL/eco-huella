import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionCard from './QuestionCard';
import quizData from '../../data/questions.json';
import { useAuth } from '../../context/AuthContext';
import { clearLegacyQuizAnswers, saveQuizAttempt } from '../../utils/quizStorage';
import { buildQuizResultPayload } from '../../utils/quizResults';
import { quizResultsAPI } from '../../services/api';

// Aplanamos el JSON para poder navegar pregunta a pregunta fácilmente
const allQuestions = quizData.modules.flatMap(module => 
  module.questions.map(question => ({
    ...question,
    moduleLabel: module.label
  }))
);

export default function QuizController({ onFinish, onCancel }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { 'h_personas': '2 personas', ... }

  const currentQuestion = allQuestions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];

  const handleSelect = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    });
  };

  const handleNext = async () => {
    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Fin del cuestionario, enviamos los datos al Dashboard
      saveQuizAttempt(user, answers);
      try {
        await quizResultsAPI.save(buildQuizResultPayload(answers));
      } catch (error) {
        console.error("No se pudo guardar el resultado en la cuenta:", error);
      }
      clearLegacyQuizAnswers();
      if (onFinish) {
        onFinish(answers);
        return;
      }

      navigate('/dashboard');
    }
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
