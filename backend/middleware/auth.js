import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getJwtSecret } from "../config/jwt.js";

export const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No autorizado - Token no encontrado" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    // El rol y la vigencia se leen de la base en cada pedido y no del token:
    // así degradar o borrar a un usuario, o cambiarle la contraseña, corta sus
    // sesiones al instante en vez de esperar a que el token venza.
    const user = await User.findById(decoded.userId).select("role +passwordChangedAt");
    if (!user) {
      return res.status(401).json({ message: "Token inválido" });
    }

    // iat está en segundos; se compara en segundos para no rechazar el token
    // emitido en la misma respuesta que cambió la contraseña.
    const changedAt = user.passwordChangedAt
      ? Math.floor(user.passwordChangedAt.getTime() / 1000)
      : 0;
    if (changedAt > decoded.iat) {
      return res
        .status(401)
        .json({ message: "La contraseña cambió: vuelve a iniciar sesión" });
    }

    req.userId = String(user._id);
    req.userRole = user.role;
    next();
  } catch (error) {
    next(error);
  }
};

export const isAdmin = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Acceso denegado - Se requieren permisos de admin" });
  }
  next();
};
