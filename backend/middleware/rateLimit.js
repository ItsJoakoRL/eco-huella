import rateLimit from "express-rate-limit";

// Los contadores viven en memoria: se reinician al reiniciar el servicio y no se
// comparten entre instancias. Alcanza para un único servicio (Render gratis).
const createLimiter = ({ windowMs, limit, message, keyGenerator, skipSuccessfulRequests }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    ...(keyGenerator && { keyGenerator }),
    handler: (req, res) => res.status(429).json({ message }),
  });

// Un mismo correo comparte contador aunque el atacante cambie de IP: es lo que
// frena la fuerza bruta sobre el código de 6 dígitos de recuperación.
const byEmail = (req) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  return `email:${email}`;
};

const MINUTES = 60 * 1000;

export const loginLimiter = createLimiter({
  windowMs: 15 * MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  message: "Demasiados intentos fallidos. Espera 15 minutos e intenta de nuevo.",
});

export const signupLimiter = createLimiter({
  windowMs: 60 * MINUTES,
  limit: 10,
  message: "Creaste demasiadas cuentas desde esta conexión. Intenta de nuevo más tarde.",
});

export const forgotPasswordLimiter = createLimiter({
  windowMs: 15 * MINUTES,
  limit: 10,
  message: "Demasiadas solicitudes de código. Espera unos minutos e intenta de nuevo.",
});

export const forgotPasswordEmailLimiter = createLimiter({
  windowMs: 60 * MINUTES,
  limit: 5,
  keyGenerator: byEmail,
  message: "Pediste demasiados códigos para este correo. Intenta de nuevo en una hora.",
});

export const resetPasswordLimiter = createLimiter({
  windowMs: 15 * MINUTES,
  limit: 20,
  message: "Demasiados intentos. Espera unos minutos e intenta de nuevo.",
});

export const resetPasswordEmailLimiter = createLimiter({
  windowMs: 15 * MINUTES,
  limit: 10,
  keyGenerator: byEmail,
  message: "Demasiados intentos con este código. Pide uno nuevo en unos minutos.",
});
