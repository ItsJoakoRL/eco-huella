import crypto from "crypto";

// Códigos de 6 dígitos para restablecer la contraseña. Se guardan hasheados: ni la
// base de datos ni los logs conservan el código, solo quien lo recibe.
export const hashResetCode = (code) =>
  crypto.createHash("sha256").update(code).digest("hex");

export const generateResetCode = () => {
  const code = String(crypto.randomInt(100000, 1000000));
  return { code, hash: hashResetCode(code) };
};
