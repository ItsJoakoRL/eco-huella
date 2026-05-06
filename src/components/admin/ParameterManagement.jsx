import React, { useEffect, useState } from "react";
import { parametersAPI } from "../../services/api";

const categories = ["housing", "transport", "food", "waste"];

const categoryLabels = {
  housing: "Hogar",
  transport: "Transporte",
  food: "Alimentacion",
  waste: "Residuos",
};

const categoryIcons = {
  housing: "home",
  transport: "local_shipping",
  food: "restaurant",
  waste: "recycling",
};

const ParameterManagement = () => {
  const [parameters, setParameters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadParameters();
  }, []);

  const loadParameters = async () => {
    try {
      setLoading(true);
      const response = await parametersAPI.getAll();
      if (response.data.parameters.length > 0) {
        setParameters(response.data.parameters[0]);
      }
      setError("");
    } catch (err) {
      setError("No se pudieron cargar los parametros.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ ...parameters.parameters[category] });
  };

  const handleUpdate = async () => {
    try {
      await parametersAPI.update(editingCategory, {
        parameters: {
          ...parameters.parameters,
          [editingCategory]: formData,
        },
      });
      setEditingCategory(null);
      loadParameters();
    } catch (err) {
      setError("No se pudieron actualizar los parametros.");
      console.error(err);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: parseFloat(value) || value });
  };

  if (loading) {
    return (
      <div className="admin-card admin-loading">
        <span className="material-symbols-outlined animate-pulse-soft">
          progress_activity
        </span>
        Cargando parametros...
      </div>
    );
  }

  if (!parameters) {
    return (
      <div className="admin-card admin-empty">
        <span className="material-symbols-outlined">database_off</span>
        <h3>No hay parametros disponibles</h3>
        <p>Cuando se carguen en la base de datos apareceran aca.</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <header className="admin-section-head">
        <div>
          <span className="admin-kicker">Modelo de calculo</span>
          <h2>Parametros de emision</h2>
          <p>Ajusta los factores que alimentan el resultado final del usuario.</p>
        </div>
        <span className="admin-count">{categories.length} categorias</span>
      </header>

      {error && <div className="admin-alert">{error}</div>}

      {editingCategory ? (
        <div className="admin-card admin-form animate-pop">
          <div className="admin-form-head">
            <span className="material-symbols-outlined">
              {categoryIcons[editingCategory]}
            </span>
            <div>
              <h3>Editar {categoryLabels[editingCategory]}</h3>
              <p>Modifica cada factor y guarda para recalcular nuevos resultados.</p>
            </div>
          </div>

          <div className="admin-param-editor">
            {Object.entries(formData).map(([key, value]) => (
              <label key={key}>
                {key}
                <input
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(event) => handleInputChange(key, event.target.value)}
                  className="admin-input"
                />
              </label>
            ))}
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-primary-button"
              onClick={handleUpdate}
            >
              Guardar parametros
            </button>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => setEditingCategory(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-param-grid">
          {categories.map((category, index) => {
            const values = parameters.parameters[category] || {};
            const entries = Object.entries(values);

            return (
              <article
                key={category}
                className="admin-param-card hover-lift animate-rise"
                style={{ animationDelay: `${index * 65}ms` }}
              >
                <div className="admin-param-head">
                  <span className="admin-item-icon">
                    <span className="material-symbols-outlined">
                      {categoryIcons[category]}
                    </span>
                  </span>
                  <div>
                    <h3>{categoryLabels[category]}</h3>
                    <p>{entries.length} factores configurados</p>
                  </div>
                </div>

                <div className="admin-kv-list">
                  {entries.slice(0, 6).map(([key, value]) => (
                    <div key={key} className="admin-kv">
                      <span>{key}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="admin-secondary-button wide"
                  onClick={() => handleEdit(category)}
                >
                  <span className="material-symbols-outlined">tune</span>
                  Editar categoria
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParameterManagement;
