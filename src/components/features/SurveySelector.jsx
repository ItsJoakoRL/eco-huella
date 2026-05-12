import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { surveyTracks } from "../../data/surveyTracks";
import { quizResultsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { getCompletedSurveyTypes, loadQuizHistory } from "../../utils/quizStorage";

export default function SurveySelector() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [serverAttempts, setServerAttempts] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadCompletedSurveys = async () => {
      try {
        const response = await quizResultsAPI.getMyResults();
        if (isMounted) {
          setServerAttempts(response.data.results || []);
        }
      } catch (error) {
        console.error("No se pudieron cargar las encuestas completadas:", error);
      }
    };

    loadCompletedSurveys();

    return () => {
      isMounted = false;
    };
  }, []);

  const completedSurveyTypes = useMemo(
    () => getCompletedSurveyTypes([...serverAttempts, ...loadQuizHistory(user)]),
    [serverAttempts, user]
  );

  return (
    <section className="survey-select-page eco-aurora">
      <div className="survey-select-head animate-rise">
        <span className="dashboard-eyebrow">Elegir recorrido</span>
        <h1>Que encuesta queres responder?</h1>
        <p>Selecciona un camino. Cada recorrido se puede completar una sola vez.</p>
      </div>

      <div className="survey-track-grid">
        {surveyTracks.map((track, index) => {
          const isCompleted = completedSurveyTypes.has(track.id);
          return (
            <button
              key={track.id}
              type="button"
              className={`survey-track-card hover-lift animate-pop ${isCompleted ? "completed" : ""}`}
              style={{ animationDelay: `${index * 90}ms` }}
              onClick={() => {
                if (!isCompleted) {
                  navigate(`/quiz/${track.id}`);
                }
              }}
              disabled={isCompleted}
            >
              <span className="survey-track-icon material-symbols-outlined">
                {track.icon}
              </span>
              <span className="survey-track-copy">
                <small>{isCompleted ? "Completada" : track.subtitle}</small>
                <strong>{track.title}</strong>
                <span>{track.description}</span>
              </span>
              <span className="survey-track-arrow material-symbols-outlined">
                {isCompleted ? "check_circle" : "arrow_forward"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
