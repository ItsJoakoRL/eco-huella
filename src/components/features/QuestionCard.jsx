const moduleIcons = {
  Hogar: "home",
  Transporte: "directions_car",
  Alimentacion: "restaurant",
  Alimentación: "restaurant",
  Consumo: "shopping_bag",
  Residuos: "recycling",
};

export default function QuestionCard({
  question,
  moduleLabel,
  currentStep,
  totalSteps,
  selectedValue,
  onSelect,
  onNext,
  onPrev,
  onClose,
}) {
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);
  const moduleIcon = moduleIcons[moduleLabel] || "eco";
  const isLastStep = currentStep === totalSteps;

  return (
    <section className="quiz-page">
      <div className="quiz-backdrop" />

      <header className="quiz-hero animate-rise">
        <div>
          <span className="quiz-eyebrow">Diagnostico ambiental</span>
          <h1>Construyamos tu huella paso a paso.</h1>
          <p>
            Responde con aproximaciones reales. Cada respuesta ayuda a calcular
            recomendaciones mas utiles para tu contexto.
          </p>
        </div>

        <button
          type="button"
          className="quiz-close"
          onClick={onClose}
          aria-label="Cerrar cuestionario"
          title="Cerrar cuestionario"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      <article className="quiz-card animate-pop" key={question.id}>
        <aside className="quiz-side">
          <div className="quiz-module-icon">
            <span className="material-symbols-outlined">{moduleIcon}</span>
          </div>

          <div>
            <span className="quiz-module">{moduleLabel}</span>
            <h2>{question.text}</h2>
            {question.description && <p>{question.description}</p>}
          </div>

          <div className="quiz-progress-panel">
            <div className="quiz-progress-meta">
              <span>Pregunta {currentStep}</span>
              <strong>{progressPercentage}%</strong>
            </div>
            <div className="quiz-progress-track">
              <div
                className="quiz-progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <small>
              {currentStep} de {totalSteps} preguntas completadas en el recorrido.
            </small>
          </div>
        </aside>

        <section className="quiz-answer-area">
          {question.type === "select" && (
            <div className="quiz-options-grid">
              {question.options?.map((option, index) => {
                const isSelected = selectedValue === option.label;

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => onSelect(option.label)}
                    className={`quiz-option ${isSelected ? "selected" : ""}`}
                    style={{ animationDelay: `${index * 55}ms` }}
                  >
                    <span className="quiz-option-icon material-symbols-outlined">
                      {option.icon || "eco"}
                    </span>
                    <span className="quiz-option-copy">
                      <strong>{option.label}</strong>
                      {option.unit && <small>{option.unit}</small>}
                    </span>
                    <span className="quiz-option-check material-symbols-outlined">
                      {isSelected ? "check_circle" : "radio_button_unchecked"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {question.type === "number" && (
            <div className="quiz-number-card">
              <label htmlFor={question.id}>Ingresa un valor aproximado</label>
              <input
                id={question.id}
                type="number"
                min="0"
                placeholder={question.placeholder || "Ej: 3"}
                value={selectedValue || ""}
                onChange={(event) => onSelect(event.target.value)}
                autoFocus
              />
              <span className="quiz-input-hint">
                Puedes ajustar este dato mas adelante si cambia tu situacion.
              </span>
            </div>
          )}

          {question.type === "range" && (
            <div className="quiz-range-card">
              <div className="quiz-range-value">
                <span>{question.min}</span>
                <strong>{selectedValue || question.min}</strong>
                <span>{question.max}+</span>
              </div>
              <input
                type="range"
                min={question.min}
                max={question.max}
                step={question.step || 1}
                value={selectedValue || question.min}
                onChange={(event) => onSelect(event.target.value)}
                className="quiz-range"
              />
            </div>
          )}
        </section>
      </article>

      <footer className="quiz-actions">
        <button
          type="button"
          className="quiz-secondary"
          onClick={onPrev}
          disabled={currentStep === 1}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Atras
        </button>

        <button
          type="button"
          className="quiz-primary eco-glow-button"
          onClick={onNext}
          disabled={!selectedValue}
        >
          {isLastStep ? "Ver resultados" : "Siguiente"}
          <span className="material-symbols-outlined">
            {isLastStep ? "monitoring" : "arrow_forward"}
          </span>
        </button>
      </footer>
    </section>
  );
}
