import React, { useEffect, useState } from "react";
import { questionsAPI } from "../../services/api";

const moduleLabels = {
  housing: "Hogar",
  transport: "Transporte",
  food: "Alimentacion",
  waste: "Residuos",
};

const moduleIcons = {
  housing: "home",
  transport: "local_shipping",
  food: "restaurant",
  waste: "recycling",
};

const QuestionManagement = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    module: "housing",
    text: "",
    type: "select",
    order: 1,
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getAll({});
      setQuestions(response.data.questions || []);
      setError("");
    } catch (err) {
      setError("No se pudieron cargar las preguntas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await questionsAPI.update(editingId, formData);
      } else {
        await questionsAPI.create(formData);
      }
      resetForm();
      loadQuestions();
    } catch (err) {
      setError("No se pudo guardar la pregunta.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Seguro que quieres eliminar esta pregunta?")) return;

    try {
      await questionsAPI.delete(id);
      loadQuestions();
    } catch (err) {
      setError("No se pudo eliminar la pregunta.");
      console.error(err);
    }
  };

  const handleEdit = (question) => {
    setFormData({
      id: question.id || "",
      module: question.module || "housing",
      text: question.text || "",
      type: question.type || "select",
      order: question.order || 1,
    });
    setEditingId(question._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      module: "housing",
      text: "",
      type: "select",
      order: 1,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-section">
      <header className="admin-section-head">
        <div>
          <span className="admin-kicker">Motor del cuestionario</span>
          <h2>Preguntas</h2>
          <p>Ordena el recorrido y ajusta el contenido que ve cada usuario.</p>
        </div>
        <button
          type="button"
          className="admin-primary-button"
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
        >
          <span className="material-symbols-outlined">
            {showForm ? "close" : "add"}
          </span>
          {showForm ? "Cerrar" : "Agregar pregunta"}
        </button>
      </header>

      {error && <div className="admin-alert">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card admin-form animate-pop">
          <div className="admin-form-head">
            <span className="material-symbols-outlined">fact_check</span>
            <div>
              <h3>{editingId ? "Editar pregunta" : "Nueva pregunta"}</h3>
              <p>Define modulo, tipo y orden dentro del diagnostico.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <label>
              ID interno
              <input
                type="text"
                value={formData.id}
                onChange={(event) =>
                  setFormData({ ...formData, id: event.target.value })
                }
                className="admin-input"
                required
              />
            </label>

            <label>
              Modulo
              <select
                value={formData.module}
                onChange={(event) =>
                  setFormData({ ...formData, module: event.target.value })
                }
                className="admin-input"
              >
                <option value="housing">Hogar</option>
                <option value="transport">Transporte</option>
                <option value="food">Alimentacion</option>
                <option value="waste">Residuos</option>
              </select>
            </label>

            <label>
              Tipo
              <select
                value={formData.type}
                onChange={(event) =>
                  setFormData({ ...formData, type: event.target.value })
                }
                className="admin-input"
              >
                <option value="select">Select</option>
                <option value="number">Numero</option>
                <option value="range">Rango</option>
              </select>
            </label>

            <label>
              Orden
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    order: Number(event.target.value),
                  })
                }
                className="admin-input"
              />
            </label>
          </div>

          <label>
            Texto de la pregunta
            <textarea
              value={formData.text}
              onChange={(event) =>
                setFormData({ ...formData, text: event.target.value })
              }
              className="admin-input admin-textarea"
              required
            />
          </label>

          <div className="admin-form-actions">
            <button type="submit" className="admin-primary-button">
              {editingId ? "Actualizar pregunta" : "Crear pregunta"}
            </button>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={resetForm}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="admin-card admin-loading">
          <span className="material-symbols-outlined animate-pulse-soft">
            progress_activity
          </span>
          Cargando preguntas...
        </div>
      ) : (
        <div className="admin-list">
          {questions.map((question, index) => (
            <article
              key={question._id}
              className="admin-list-item hover-lift animate-rise"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <div className="admin-item-main">
                <span className="admin-item-icon">
                  <span className="material-symbols-outlined">
                    {moduleIcons[question.module] || "quiz"}
                  </span>
                </span>
                <div>
                  <div className="admin-meta">
                    <span className="admin-pill">
                      {moduleLabels[question.module] || question.module}
                    </span>
                    <span className="admin-pill subtle">{question.type}</span>
                    <span className="admin-pill subtle">Orden {question.order}</span>
                  </div>
                  <h3>{question.text}</h3>
                  <p>ID: {question.id}</p>
                </div>
              </div>

              <div className="admin-actions">
                <button
                  type="button"
                  className="admin-icon-button"
                  onClick={() => handleEdit(question)}
                  title="Editar pregunta"
                >
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button
                  type="button"
                  className="admin-icon-button danger"
                  onClick={() => handleDelete(question._id)}
                  title="Eliminar pregunta"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
