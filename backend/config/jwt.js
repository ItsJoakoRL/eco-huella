// Fuente única de la clave de firma de los JWT. La usan tanto quien firma el
// token (authController) como quien lo verifica (middleware/auth), para que
// nunca puedan diferir.
const DEV_FALLBACK_SECRET = "ecohuella-dev-only-secret";

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret) return secret;

  // La clave de reserva es pública (está en el repositorio): solo se admite cuando
  // se declara desarrollo de forma explícita. Con NODE_ENV sin definir o mal escrito
  // el servidor no arranca, en vez de aceptar tokens que cualquiera puede falsificar.
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    return DEV_FALLBACK_SECRET;
  }

  throw new Error(
    "Falta configurar JWT_SECRET en las variables de entorno (o NODE_ENV=development para desarrollo local)"
  );
};
