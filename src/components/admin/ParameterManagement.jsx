import React, { useState, useEffect } from "react";
import { parametersAPI } from "../services/api";
import Button from "../ui/Button";
import Card from "../ui/Card";

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
      setError("Error al cargar parámetros");
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
      alert("Parámetros actualizados");
      setEditingCategory(null);
      loadParameters();
    } catch (err) {
      setError("Error al actualizar parámetros");
      console.error(err);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: parseFloat(value) || value });
  };

  if (loading) return <p>Cargando parámetros...</p>;
  if (!parameters) return <p>No hay parámetros disponibles</p>;

  const categories = ["housing", "transport", "food", "waste"];
  const categoryLabels = {
    housing: "Hogar",
    transport: "Transporte",
    food: "Alimentación",
    waste: "Residuos",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-on-surface">Parámetros de Emisión</h2>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {editingCategory ? (
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-on-surface">
            Editar: {categoryLabels[editingCategory]}
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  {key}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-outline rounded"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleUpdate} className="flex-1">
              Guardar
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setEditingCategory(null)}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Card key={cat}>
              <h3 className="text-lg font-semibold mb-3 text-on-surface">
                {categoryLabels[cat]}
              </h3>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {Object.entries(parameters.parameters[cat]).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="font-medium text-on-surface-variant">{key}:</span>
                    <span className="ml-2 text-on-surface">{value}</span>
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                onClick={() => handleEdit(cat)}
                className="w-full"
              >
                Editar
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParameterManagement;
