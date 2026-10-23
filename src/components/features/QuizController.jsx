import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import quizData from "../../data/questions.json";
import { getSurveyTrack } from "../../data/surveyTracks";
import { useAuth } from "../../context/AuthContext";
import { clearLegacyQuizAnswers, getCompletedSurveyTypes, loadQuizHistory, saveQuizAttempt } from "../../utils/quizStorage";
import { buildQuizResultPayload } from "../../utils/quizResults";
import { quizResultsAPI } from "../../services/api";

export default function QuizController({ onFinish, onCancel }) {
  const navigate = useNavigate();
  const { trackId = "ambiental" } = useParams();
  const { user, isAuthenticated } = useAuth();
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
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const redirectIfCompleted = async () => {
      const localCompleted = getCompletedSurveyTypes(loadQuizHistory(user));
      if (localCompleted.has(track.id)) {
        navigate("/dashboard", { replace: true });
        return;
      }

      try {
        const response = await quizResultsAPI.getMyResults();
        const serverCompleted = getCompletedSurveyTypes(response.data.results || []);
        if (serverCompleted.has(track.id)) {
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch (error) {
        console.error("No se pudo verificar si la encuesta ya estaba completada:", error);
      }

      if (isMounted) {
        setIsCheckingCompletion(false);
      }
    };

    redirectIfCompleted();

    return () => {
      isMounted = false;
    };
  }, [navigate, track.id, user]);

  const currentQuestion = allQuestions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const closeHref = isAuthenticated ? "/encuestas" : "/";

  const handleSelect = (value) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = async () => {
    if (isSaving) return;

    if (currentIndex < allQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    const answersWithTrack = { ...answers, _surveyType: track.id };
    setSaveError("");
    setIsSaving(true);

    // Primero se guarda en la cuenta: si se marcara como completada solo en este
    // navegador y el guardado fallara, la encuesta quedaría bloqueada y sin datos
    // en el servidor. Si falla, las respuestas se conservan para reintentar.
    try {
      await quizResultsAPI.save(buildQuizResultPayload(answers, track.id));
      saveQuizAttempt(user, answersWithTrack);
    } catch (error) {
      // 409: ya estaba guardada (otro dispositivo o un envío anterior); se sigue igual.
      if (error.response?.status !== 409) {
        console.error("No se pudo guardar el resultado en la cuenta:", error);
        const status = error.response?.status;
        setSaveError(
          status && status < 500 && error.response.data?.message
            ? error.response.data.message
            : "No pudimos guardar tu encuesta en tu cuenta. Revisa tu conexión y vuelve a intentarlo: tus respuestas siguen acá."
        );
        setIsSaving(false);
        return;
      }
    }

    setIsSaving(false);
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    if (isAuthenticated) {
      navigate("/encuestas", { replace: true });
      return;
    }

    navigate("/", { replace: true });
  };

  if (isCheckingCompletion) {
    return (
      <section className="quiz-page">
        <article className="quiz-card animate-pop">
          <aside className="quiz-side">
            <div className="quiz-module-icon">
              <span className="material-symbols-outlined">progress_activity</span>
            </div>
            <div>
              <span className="quiz-module">Verificando</span>
              <h2>Revisando tus encuestas completadas...</h2>
              <p>Cada recorrido se puede responder una sola vez.</p>
            </div>
          </aside>
        </article>
      </section>
    );
  }

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
      onClose={handleCancel}
      closeHref={closeHref}
      error={saveError}
      isSaving={isSaving}
    />
  );
}
