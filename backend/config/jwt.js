// Fuente única de la clave de firma de los JWT. La usan tanto quien firma el
// token (authController) como quien lo verifica (middleware/auth), para que
// nunca puedan diferir.
const DEV_FALLBACK_SECRET = "ecohuella-dev-only-secret";

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("Falta configurar JWT_SECRET en las variables de entorno");
  }

  // Solo para desarrollo local: evita tokens inválidos si falta el .env.
  return DEV_FALLBACK_SECRET;
};
