import nodemailer from "nodemailer";
import dns from "node:dns";

const lookupIPv4 = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, family: 4 }, callback);
};

const getMailTransport = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const timeoutOptions = {
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    family: 4,
    lookup: lookupIPv4,
  };

  if (gmailUser && gmailAppPassword) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      ...timeoutOptions,
      tls: {
        servername: "smtp.gmail.com",
      },
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      ...timeoutOptions,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return null;
};

export const sendPasswordResetCode = async ({ to, name, code }) => {
  const transport = getMailTransport();

  if (!transport) {
    throw new Error(
      "El correo de EcoHuella no está configurado para enviar códigos"
    );
  }

  const from = process.env.MAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER;

  await transport.sendMail({
    from: `"EcoHuella" <${from}>`,
    to,
    subject: "Código de recuperación de EcoHuella",
    text: `Hola ${name || ""}. Tu código de recuperación de EcoHuella es ${code}. Expira en 15 minutos.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1f2937;">
        <h1 style="color: #16623f;">EcoHuella</h1>
        <p>Hola ${name || ""}, recibimos una solicitud para cambiar tu contraseña.</p>
        <p style="font-size: 14px; color: #4b5563;">Usa este código de 6 dígitos:</p>
        <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #16623f; padding: 18px 22px; background: #d9f7eb; border-radius: 16px; text-align: center;">
          ${code}
        </div>
        <p style="font-size: 14px; color: #4b5563;">Este código expira en 15 minutos. Si no pediste este cambio, puedes ignorar este correo.</p>
      </div>
    `,
  });
};
