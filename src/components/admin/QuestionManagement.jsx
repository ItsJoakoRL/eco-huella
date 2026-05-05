import React, { useState, useEffect } from "react";
import { questionsAPI } from "../services/api";
import Button from "./ui/Button";
import Card from "./ui/Card";

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
      setQuestions(response.data.questions);
      setError("");
    } catch (err) {
      setError("Error al cargar preguntas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await questionsAPI.update(editingId, formData);
        alert("Pregunta actualizada");
      } else {
        await questionsAPI.create(formData);
        alert("Pregunta creada");
      }
      resetForm();
      loadQuestions();
    } catch (err) {
      setError("Error al guardar pregunta");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Está seguro de eliminar esta pregunta?")) {
      try {
        await questionsAPI.delete(id);
        alert("Pregunta eliminada");
        loadQuestions();
      } catch (err) {
        setError("Error al eliminar pregunta");
      }
    }
  };

  const handleEdit = (question) => {
    setFormData(question);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-on-surface">Gestión de Preguntas</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "+ Agregar Pregunta"}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="ID"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                className="px-3 py-2 border border-outline rounded"
                required
              />
              <select
                value={formData.module}
                onChange={(e) =>
                  setFormData({ ...formData, module: e.target.value })
                }
                className="px-3 py-2 border border-outline rounded"
              >
                <option value="housing">Hogar</option>
                <option value="transport">Transporte</option>
                <option value="food">Alimentación</option>
                <option value="waste">Residuos</option>
              </select>
            </div>

            <textarea
              placeholder="Texto de la pregunta"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full px-3 py-2 border border-outline rounded"
              required
            />

            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-outline rounded"
            >
              <option value="select">Select</option>
              <option value="number">Número</option>
              <option value="range">Rango</option>
            </select>

            <Button type="submit" className="w-full">
              {editingId ? "Actualizar" : "Crear"}
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <p>Cargando preguntas...</p>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <Card key={q._id} className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-on-surface">{q.text}</p>
                <p className="text-sm text-on-surface-variant">
                  Módulo: {q.module} | Tipo: {q.type}
                </p>
              </div>
              <div className="space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEdit(q)}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(q._id)}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
