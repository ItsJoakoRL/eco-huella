// Traduce un error capturado en un controlador a la respuesta HTTP correcta.
// Antes todo caía en 500 con error.message crudo: una validación fallida (email
// inválido, contraseña corta) se veía como falla del servidor y los errores
// internos filtraban detalles al cliente.
export const handleError = (res, error) => {
  if (error?.name === "ValidationError") {
    const message = Object.values(error.errors || {})[0]?.message || "Datos inválidos";
    return res.status(400).json({ message });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({ message: "Identificador o valor inválido" });
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    const messages = {
      email: "El email ya está registrado",
      username: "El nombre de usuario ya está registrado",
    };
    return res
      .status(400)
      .json({ message: messages[field] || "Ya existe un registro con esos datos" });
  }

  console.error(error?.stack || error);
  return res.status(500).json({ message: "Error interno del servidor" });
};
