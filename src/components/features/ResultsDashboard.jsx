import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import quizData from "../../data/questions.json";
import { useAuth } from "../../context/AuthContext";
import { deleteQuizAttempt, loadQuizAnswers, loadQuizHistory } from "../../utils/quizStorage";

const formatAttemptDate = (dateValue) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));

export default function ResultsDashboard({ answers, onRestart }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptToDelete, setAttemptToDelete] = useState(null);
  const [storedAnswers, setStoredAnswers] = useState(() => loadQuizAnswers(user));
  const [quizHistory, setQuizHistory] = useState(() => loadQuizHistory(user));

  useEffect(() => {
    setStoredAnswers(loadQuizAnswers(user));
    setQuizHistory(loadQuizHistory(user));
    setSelectedAttempt(null);
  }, [user]);

  const answersData = useMemo(() => {
    if (answers) return answers;
    if (selectedAttempt?.answers) return selectedAttempt.answers;
    return storedAnswers;
  }, [answers, selectedAttempt, storedAnswers]);

  const hasAnswers = Object.keys(answersData).length > 0;
  const activeAttemptId = selectedAttempt?.id || quizHistory[0]?.id;

  const results = useMemo(() => {
    const getOption = (moduleId, questionId) => {
      const q = quizData.modules.find((m) => m.id === moduleId)?.questions.find((item) => item.id === questionId);
      if (!q || !answersData[questionId]) return null;
      return q.options?.find((opt) => opt.label === answersData[questionId]) || null;
    };

    const getNumber = (questionId, defaultVal = 1) => Number(answersData[questionId]) || defaultVal;

    const personas = getNumber("h_personas", 1);
    const elecOpt = getOption("hogar", "h_electricidad");
    const calOpt = getOption("hogar", "h_calefaccion");
    const renOpt = getOption("hogar", "h_renovable");

    let hogarKg = (((elecOpt?.value || 300) * 12 * (elecOpt?.factor || 0.35)) + (50 * 12 * (calOpt?.factor || 2.02))) / personas;
    hogarKg = hogarKg * (renOpt?.impact_modifier || 1.0);

    const transOpt = getOption("transporte", "t_medio_principal");
    const kmSemana = getNumber("t_distancia_semanal", 50);
    const vuelosOpt = getOption("transporte", "t_vuelos");
    const ocupacionOpt = getOption("transporte", "t_ocupacion");

    let transporteKg = (kmSemana * 52 * (transOpt?.factor || 0)) / (ocupacionOpt?.divisor || 1);
    transporteKg += (vuelosOpt?.value || 0) * (vuelosOpt?.factor || 0);

    const dietaOpt = getOption("alimentacion", "a_dieta");
    const procOpt = getOption("alimentacion", "a_procedencia");
    const despOpt = getOption("alimentacion", "a_desperdicio");

    let comidaKg = (dietaOpt?.base_yearly_kg || 1500) + ((despOpt?.extra_kg_co2 || 0) * 52);
    comidaKg = comidaKg * (procOpt?.impact_modifier || 1.0);

    const recicOpt = getOption("residuos", "r_reciclaje");
    const compOpt = getOption("residuos", "r_compras");
    const repOpt = getOption("residuos", "r_reparacion");

    let residuosKg = 300 + (compOpt?.extra_kg_co2 || 100);
    residuosKg = residuosKg * (recicOpt?.impact_modifier || 1.0) * (repOpt?.impact_modifier || 1.0);

    const totalKg = hogarKg + transporteKg + comidaKg + residuosKg;
    const totalTon = (totalKg / 1000).toFixed(1);
    const diffAvg = (((totalTon - 4.7) / 4.7) * 100).toFixed(0);
    const planetas = (totalTon / 1.5).toFixed(1);

    return {
      hogar: (hogarKg / 1000).toFixed(1),
      transporte: (transporteKg / 1000).toFixed(1),
      comida: (comidaKg / 1000).toFixed(1),
      residuos: (residuosKg / 1000).toFixed(1),
      total: totalTon,
      diffAvg: Number(diffAvg),
      planetas: Number(planetas),
    };
  }, [answersData]);

  const getPercent = (value) => `${((Number(value) / Number(results.total)) * 100).toFixed(1)}%`;

  const highestCategory = useMemo(() => {
    const categories = [
      { id: "hogar", value: Number(results.hogar), title: "Hogar" },
      { id: "transporte", value: Number(results.transporte), title: "Transporte" },
      { id: "comida", value: Number(results.comida), title: "Alimentacion" },
      { id: "residuos", value: Number(results.residuos), title: "Residuos" },
    ];
    return categories.reduce((max, cat) => (cat.value > max.value ? cat : max), categories[0]);
  }, [results]);

  const recomendaciones = {
    hogar: [
      { titulo: "Cambia a energia renovable", desc: "Instalar paneles solares o cambiar de proveedor puede reducir tu huella hogarena hasta un 40%.", icon: "bolt", ahorro: "-0.6 tCO2 / ano" },
      { titulo: "Ajusta la climatizacion", desc: "Bajar 1°C la calefaccion o subirlo en el aire acondicionado ahorra hasta un 10% de energia.", icon: "thermostat", ahorro: "-0.2 tCO2 / ano" },
    ],
    transporte: [
      { titulo: "Dia sin coche semanal", desc: "Dejar el coche solo un dia a la semana marca una diferencia masiva en tu impacto anual de movilidad.", icon: "directions_bike", ahorro: "-0.3 tCO2 / ano" },
      { titulo: "Carpooling o transporte publico", desc: "Compartir tus viajes de ida y vuelta al trabajo reduce drasticamente las emisiones por pasajero.", icon: "directions_bus", ahorro: "-0.8 tCO2 / ano" },
    ],
    comida: [
      { titulo: "Lunes sin carne", desc: "Reemplazar la carne vacuna un dia a la semana reduce significativamente las emisiones de metano.", icon: "eco", ahorro: "-0.4 tCO2 / ano" },
      { titulo: "Compra de productores locales", desc: "Consumir en ferias locales evita la huella de carbono del transporte internacional de alimentos.", icon: "local_shipping", ahorro: "-0.1 tCO2 / ano" },
    ],
    residuos: [
      { titulo: "Compostaje casero", desc: "El 50% de la basura es organica. Compostar evita que genere metano en los vertederos.", icon: "recycling", ahorro: "-0.2 tCO2 / ano" },
      { titulo: "Moda circular", desc: "Comprar ropa de segunda mano o extender la vida util de tus prendas reduce la huella hidrica y de carbono.", icon: "checkroom", ahorro: "-0.15 tCO2 / ano" },
    ],
  };

  const currentTips = recomendaciones[highestCategory.id];
  const categoryTextClasses = {
    hogar: "text-tertiary",
    transporte: "text-primary",
    comida: "text-secondary",
    residuos: "text-on-surface-variant",
  };
  const highestTextClass = categoryTextClasses[highestCategory.id] || "text-primary";

  const categories = [
    { id: "hogar", icon: "home", label: "Hogar", color: "#feb300", val: results.hogar },
    { id: "transporte", icon: "commute", label: "Transporte", color: "#296654", val: results.transporte },
    { id: "comida", icon: "restaurant", label: "Alimentacion", color: "#b9dda0", val: results.comida },
    { id: "residuos", icon: "delete_sweep", label: "Residuos", color: "#deddd8", val: results.residuos },
  ];

  const handleRestart = () => {
    if (onRestart) {
      onRestart();
      return;
    }

    navigate("/quiz");
  };
  const handleDeleteAttempt = (event, attempt) => {
    event.stopPropagation();
    setAttemptToDelete(attempt);
  };
  const confirmDeleteAttempt = () => {
    if (!attemptToDelete) return;

    const nextHistory = deleteQuizAttempt(user, attemptToDelete.id);
    setQuizHistory(nextHistory);

    if (selectedAttempt?.id === attemptToDelete.id) {
      setSelectedAttempt(nextHistory[0] || null);
    }

    setStoredAnswers(nextHistory[0]?.answers || {});
    setAttemptToDelete(null);
  };

  if (!hasAnswers) {
    return (
      <div className="eco-aurora dashboard-page dashboard-empty-state">
        <section className="dashboard-hero">
          <div className="animate-rise">
            <span className="dashboard-eyebrow">Encuesta inicial</span>
            <h1 className="dashboard-title">
              Empeza desde <span>cero.</span>
            </h1>
            <p className="dashboard-lead">
              Esta cuenta todavia no completo la encuesta ambiental. Responde unas preguntas para calcular una huella propia, sin usar datos de otros usuarios.
            </p>
            <button onClick={handleRestart} className="planet-button eco-glow-button dashboard-start-button">
              Iniciar encuesta
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>

          <div className="impact-card hover-lift animate-pop" style={{ animationDelay: "140ms" }}>
            <p className="impact-label">Estado de la evaluacion</p>
            <div className="impact-value">
              <strong>0</strong>
              <span>respuestas</span>
            </div>
            <div className="impact-diff">
              <div className="impact-diff-icon">
                <span className="material-symbols-outlined">assignment</span>
              </div>
              <div>
                Tus resultados apareceran cuando termines la encuesta.
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="eco-aurora dashboard-page">
      <section className="dashboard-hero">
        <div className="animate-rise">
          <span className="dashboard-eyebrow">Tu Impacto Actual</span>
          <h1 className="dashboard-title">
            Tus pasos dejan <span>una huella.</span>
          </h1>
          <p className="dashboard-lead">
            Has completado tu evaluacion de sostenibilidad. Aqui tienes una lectura clara de tu consumo anual y donde conviene actuar primero.
          </p>
        </div>

        <div className="impact-card hover-lift animate-pop" style={{ animationDelay: "140ms" }}>
          <p className="impact-label">Huella de carbono total</p>
          <div className="impact-value">
            <strong>{results.total}</strong>
            <span>t CO2e</span>
          </div>
          <div className="impact-diff">
            <div className="impact-diff-icon">
              <span className="material-symbols-outlined">{results.diffAvg <= 0 ? "trending_down" : "trending_up"}</span>
            </div>
            <div>
              Estas un{" "}
              <strong className={results.diffAvg <= 0 ? "text-secondary" : "text-red-700"}>
                {Math.abs(results.diffAvg)}% {results.diffAvg <= 0 ? "por debajo" : "por encima"}
              </strong>{" "}
              de la media nacional.
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="analysis-card hover-lift animate-rise">
          <div className="dashboard-card-head">
            <div>
              <h2>Desglose por Categoria</h2>
              <p>Visualiza que parte de tu vida genera mas impacto.</p>
            </div>
            <div className="dashboard-head-icon">
              <span className="material-symbols-outlined">bar_chart</span>
            </div>
          </div>

          <div className="category-list">
            {categories.map((cat) => (
              <div key={cat.id} className="category-row">
                <div className="category-meta">
                  <div className="category-name">
                    <span className="material-symbols-outlined">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  <span className="category-value">{cat.val} tCO2</span>
                </div>
                <div className="category-track">
                  <div className="category-fill" style={{ width: getPercent(cat.val), backgroundColor: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="planet-card hover-lift animate-pop" style={{ animationDelay: "160ms" }}>
          <div>
            <h2>Cuantos planetas Tierra necesitas?</h2>
            <p>Si todos vivieran como tu, este seria el espacio que requeririamos.</p>
          </div>

          <div className="planet-icons">
            {Array.from({ length: Math.floor(results.planetas) }).map((_, i) => (
              <span key={i} className="material-symbols-outlined animate-float-slow" style={{ fontVariationSettings: "'FILL' 1", animationDelay: `${i * 160}ms` }}>
                public
              </span>
            ))}
            {results.planetas % 1 > 0.1 && (
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                public
              </span>
            )}
          </div>

          <div className="planet-score">
            <strong>{results.planetas}</strong>
            <span>Planetas Tierra</span>
          </div>

          <button onClick={handleRestart} className="planet-button eco-glow-button">
            Volver a evaluar
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </section>

      {quizHistory.length > 0 && (
        <section className="survey-history-section animate-rise">
          <div className="tips-header">
            <h2 className="tips-title">Historial de encuestas</h2>
            <p className="tips-lead">
              Revisa resultados anteriores y compara como va cambiando tu huella.
            </p>
          </div>

          <div className="survey-history-grid">
            {quizHistory.map((attempt, index) => (
              <div
                key={attempt.id}
                role="button"
                tabIndex={0}
                className={`survey-history-card hover-lift ${activeAttemptId === attempt.id ? "active" : ""}`}
                onClick={() => setSelectedAttempt(attempt)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setSelectedAttempt(attempt);
                  }
                }}
                style={{ animationDelay: `${index * 55}ms` }}
              >
                <span className="survey-history-icon material-symbols-outlined">assignment_turned_in</span>
                <span>
                  <strong>
                    {index === 0 ? "Encuesta mas reciente" : `Encuesta ${quizHistory.length - index}`}
                  </strong>
                  <small>{formatAttemptDate(attempt.createdAt)}</small>
                </span>
                <span className="survey-history-action">
                  {activeAttemptId === attempt.id ? "Viendo" : "Ver resultado"}
                </span>
                <button
                  type="button"
                  className="survey-history-delete"
                  title="Eliminar encuesta"
                  onClick={(event) => handleDeleteAttempt(event, attempt)}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="tips-section">
        <div className="tips-header animate-rise">
          <h2 className="tips-title">Acciones Sugeridas</h2>
          <p className="tips-lead">Prioriza estos cambios para reducir tu categoria mas critica: {highestCategory.title}.</p>
        </div>

        <div className="tips-grid">
          {currentTips.map((tip, index) => (
            <div key={tip.titulo} className="tip-card hover-lift animate-pop" style={{ animationDelay: `${index * 120}ms` }}>
              <div className="tip-icon">
                <span className={`material-symbols-outlined text-3xl ${highestTextClass}`}>{tip.icon}</span>
              </div>
              <div>
                <span className="tip-kicker">Impacto critico: {highestCategory.title}</span>
                <h3>{tip.titulo}</h3>
                <p>{tip.desc}</p>
                <div className="saving-pill">
                  <span className="material-symbols-outlined text-sm">energy_savings_leaf</span>
                  <span>Ahorro: {tip.ahorro}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {attemptToDelete && (
        <div className="confirm-modal-backdrop" role="dialog" aria-modal="true" aria-label="Eliminar cuestionario">
          <div className="confirm-modal animate-pop">
            <span className="confirm-modal-icon material-symbols-outlined">delete</span>
            <h2>Seguro que quieres eliminar este cuestionario</h2>
            <p>Esta accion quitara el resultado del historial de encuestas.</p>
            <div className="confirm-modal-actions">
              <button type="button" className="admin-secondary-button" onClick={() => setAttemptToDelete(null)}>
                Cancelar
              </button>
              <button type="button" className="admin-primary-button danger" onClick={confirmDeleteAttempt}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
