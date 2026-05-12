import { useNavigate } from "react-router-dom";
import { surveyTracks } from "../../data/surveyTracks";

export default function SurveySelector() {
  const navigate = useNavigate();

  return (
    <section className="survey-select-page eco-aurora">
      <div className="survey-select-head animate-rise">
        <span className="dashboard-eyebrow">Elegir recorrido</span>
        <h1>Que encuesta queres responder?</h1>
        <p>Selecciona un camino y completa solo esas preguntas.</p>
      </div>

      <div className="survey-track-grid">
        {surveyTracks.map((track, index) => (
          <button
            key={track.id}
            type="button"
            className="survey-track-card hover-lift animate-pop"
            style={{ animationDelay: `${index * 90}ms` }}
            onClick={() => navigate(`/quiz/${track.id}`)}
          >
            <span className="survey-track-icon material-symbols-outlined">
              {track.icon}
            </span>
            <span className="survey-track-copy">
              <small>{track.subtitle}</small>
              <strong>{track.title}</strong>
              <span>{track.description}</span>
            </span>
            <span className="survey-track-arrow material-symbols-outlined">
              arrow_forward
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
