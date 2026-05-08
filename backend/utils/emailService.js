import nodemailer from "nodemailer";
import dns from "node:dns";

const lookupIPv4 = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, family: 4 }, callback);
};

const buildPasswordResetEmail = ({ name, code }) => ({
  subject: "Codigo de recuperacion de EcoHuella",
  text: `Hola ${name || ""}. Tu codigo de recuperacion de EcoHuella es ${code}. Expira en 15 minutos.`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1f2937;">
      <h1 style="color: #16623f;">EcoHuella</h1>
      <p>Hola ${name || ""}, recibimos una solicitud para cambiar tu contrasena.</p>
      <p style="font-size: 14px; color: #4b5563;">Usa este codigo de 6 digitos:</p>
      <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #16623f; padding: 18px 22px; background: #d9f7eb; border-radius: 16px; text-align: center;">
        ${code}
      </div>
      <p style="font-size: 14px; color: #4b5563;">Este codigo expira en 15 minutos. Si no pediste este cambio, puedes ignorar este correo.</p>
    </div>
  `,
});

const sendWithResend = async ({ to, name, code }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return false;

  const from =
    process.env.RESEND_FROM ||
    process.env.MAIL_FROM ||
    "EcoHuella <onboarding@resend.dev>";
  const email = buildPasswordResetEmail({ name, code });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`No se pudo enviar el codigo por Resend: ${errorText}`);
    }

    return true;
  } finally {
    clearTimeout(timeout);
  }
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
      port: Number(process.env.GMAIL_SMTP_PORT || 587),
      secure: process.env.GMAIL_SMTP_SECURE === "true",
      requireTLS: true,
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
  const sentByResend = await sendWithResend({ to, name, code });
  if (sentByResend) return;

  const transport = getMailTransport();

  if (!transport) {
    throw new Error(
      "El correo de EcoHuella no esta configurado para enviar codigos"
    );
  }

  const from =
    process.env.MAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER;
  const email = buildPasswordResetEmail({ name, code });

  await transport.sendMail({
    from: `"EcoHuella" <${from}>`,
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
};
