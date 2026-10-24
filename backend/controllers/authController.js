import { handleError } from "../utils/httpError.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendPasswordResetCode } from "../utils/emailService.js";
import { getJwtSecret } from "../config/jwt.js";
import { TERMS_VERSION } from "../shared/terms.js";
import { generateResetCode, hashResetCode } from "../utils/resetCode.js";

const MAX_RESET_ATTEMPTS = 5;

// La foto de perfil es una imagen en base64 que el navegador ya achicó (unos 100 KB).
// Se acepta solo ese formato y con tope de tamaño: viaja en cada login y carga de la app.
const MAX_AVATAR_CHARS = 1_500_000;
const AVATAR_DATA_URL = /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/;
const isValidAvatar = (value) =>
  value === undefined ||
  value === "" ||
  (typeof value === "string" && value.length <= MAX_AVATAR_CHARS && AVATAR_DATA_URL.test(value));
const INVALID_AVATAR_MESSAGE = "La foto de perfil no es válida o es demasiado pesada.";

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

// Datos del usuario que se devuelven al cliente (nunca la contraseña ni los códigos de recuperación).
const toUserPayload = (user, extra = {}) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
  age: user.age,
  birthDate: user.birthDate,
  sex: user.sex,
  city: user.city,
  province: user.province,
  country: user.country,
  uccuyoLevel: user.uccuyoLevel,
  occupation: user.occupation,
  householdSize: user.householdSize,
  sustainabilityGoal: user.sustainabilityGoal,
  avatarUrl: user.avatarUrl,
  avatarZoom: user.avatarZoom,
  avatarOffsetX: user.avatarOffsetX,
  avatarOffsetY: user.avatarOffsetY,
  termsAcceptedAt: user.termsAcceptedAt,
  termsVersion: user.termsVersion,
  ...extra,
});

const withTimeout = (promise, milliseconds, message) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), milliseconds)
    ),
  ]);

export const signup = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      age,
      birthDate,
      sex,
      city,
      province,
      country,
      uccuyoLevel,
      occupation,
      householdSize,
      sustainabilityGoal,
      avatarUrl,
      avatarZoom,
      avatarOffsetX,
      avatarOffsetY,
    } = req.body;

    if (
      [name, username, email, password].some((value) => typeof value !== "string" || !value)
    ) {
      return res.status(400).json({
        message: "Por favor proporciona nombre, usuario, email y contraseña",
      });
    }

    if (!isValidAvatar(avatarUrl)) {
      return res.status(400).json({ message: INVALID_AVATAR_MESSAGE });
    }

    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();
    const userExists = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });
    if (userExists) {
      const message =
        userExists.email === normalizedEmail
          ? "El email ya está registrado"
          : "El nombre de usuario ya está registrado";
      return res.status(400).json({ message });
    }

    const user = await User.create({
      name,
      username: normalizedUsername,
      email,
      password,
      age,
      birthDate,
      sex,
      city,
      province,
      country,
      uccuyoLevel,
      occupation,
      householdSize,
      sustainabilityGoal,
      avatarUrl,
      avatarZoom,
      avatarOffsetX,
      avatarOffsetY,
    });
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: toUserPayload(user),
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({
        message: "Por favor proporciona usuario/email y contraseña",
      });
    }

    const loginValue = email.toLowerCase();
    const user = await User.findOne({
      $or: [{ email: loginValue }, { username: loginValue }],
    }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Usuario o contraseña incorrectos" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Sesión iniciada exitosamente",
      token,
      user: toUserPayload(user),
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      user: toUserPayload(user, { createdAt: user.createdAt }),
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      age,
      birthDate,
      sex,
      city,
      province,
      country,
      uccuyoLevel,
      occupation,
      householdSize,
      sustainabilityGoal,
      avatarUrl,
      avatarZoom,
      avatarOffsetX,
      avatarOffsetY,
      password,
    } = req.body;
    if (!isValidAvatar(avatarUrl)) {
      return res.status(400).json({ message: INVALID_AVATAR_MESSAGE });
    }

    const normalizedEmail = email?.toLowerCase();
    const normalizedUsername = username?.toLowerCase();
    const duplicateChecks = [
      ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
      ...(normalizedUsername ? [{ username: normalizedUsername }] : []),
    ];
    const duplicateUser = duplicateChecks.length
      ? await User.findOne({
          _id: { $ne: req.userId },
          $or: duplicateChecks,
        })
      : null;

    if (duplicateUser) {
      const message =
        duplicateUser.email === normalizedEmail
          ? "El email ya está registrado"
          : "El nombre de usuario ya está registrado";
      return res.status(400).json({ message });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const user = await User.findById(req.userId).select("+password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.name = name ?? user.name;
    user.username = normalizedUsername ?? user.username;
    user.email = normalizedEmail ?? user.email;
    user.age = age === "" ? undefined : age ?? user.age;
    user.birthDate = birthDate === "" ? undefined : birthDate ?? user.birthDate;
    user.sex = sex ?? user.sex;
    user.city = city ?? user.city;
    user.province = province ?? user.province;
    user.country = country ?? user.country;
    user.uccuyoLevel = uccuyoLevel ?? user.uccuyoLevel;
    user.occupation = occupation ?? user.occupation;
    user.householdSize = householdSize === "" ? undefined : householdSize ?? user.householdSize;
    user.sustainabilityGoal = sustainabilityGoal ?? user.sustainabilityGoal;
    user.avatarUrl = avatarUrl ?? user.avatarUrl;
    user.avatarZoom = avatarZoom ?? user.avatarZoom;
    user.avatarOffsetX = avatarOffsetX ?? user.avatarOffsetX;
    user.avatarOffsetY = avatarOffsetY ?? user.avatarOffsetY;

    if (password) {
      user.password = password;
    }

    await user.save();
    user.password = undefined;

    res.status(200).json({
      message: "Perfil actualizado exitosamente",
      // Cambiar la contraseña invalida los tokens anteriores, incluido el de esta
      // sesión: se entrega uno nuevo para no sacar al usuario de la app.
      ...(password && { token: generateToken(user._id, user.role) }),
      user: toUserPayload(user),
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const registeredEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!registeredEmail) {
      return res.status(400).json({
        message: "Ingresa el correo con el que registraste tu cuenta",
      });
    }

    const genericResponse = {
      message:
        "Si el correo está registrado, te enviamos un código de 6 dígitos. Expira en 15 minutos.",
    };

    const user = await User.findOne({ email: registeredEmail });

    // Misma respuesta exista o no la cuenta: no se revela qué correos están registrados.
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const { code: resetToken, hash: resetTokenHash } = generateResetCode();
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    user.resetPasswordAttempts = 0;

    await user.save({ validateBeforeSave: false });

    // El correo se envía en segundo plano: la respuesta tarda lo mismo exista o no
    // la cuenta, y si el envío falla el cliente no se entera (eso delataría que el
    // email está registrado); el motivo queda en el log del servidor.
    withTimeout(
      sendPasswordResetCode({
        to: user.email,
        name: user.name,
        code: resetToken,
      }),
      15000,
      "El correo tardó demasiado en enviarse. Revisa la configuración del servicio de correo."
    ).catch((error) => {
      console.error("No se pudo enviar el código de recuperación:", error.message);
    });

    res.status(200).json(genericResponse);
  } catch (error) {
    handleError(res, error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const registeredEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!registeredEmail || typeof token !== "string" || typeof password !== "string" || !token || !password) {
      return res.status(400).json({
        message: "Por favor proporciona el correo, el código y la nueva contraseña",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const hashedToken = hashResetCode(token);
    const user = await User.findOne({ email: registeredEmail }).select(
      "+password +resetPasswordToken +resetPasswordExpires +resetPasswordAttempts"
    );

    const invalidCode = () =>
      res.status(400).json({ message: "El código es inválido o ya expiró" });

    const isExpired =
      !user?.resetPasswordToken ||
      !user.resetPasswordExpires ||
      new Date(user.resetPasswordExpires).getTime() < Date.now();

    if (!user || isExpired) {
      return invalidCode();
    }

    if (user.resetPasswordToken !== hashedToken) {
      // Cada código incorrecto cuenta; al llegar al máximo el código se invalida
      // y hay que pedir uno nuevo (frena la fuerza bruta sobre 6 dígitos).
      user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
      if (user.resetPasswordAttempts >= MAX_RESET_ATTEMPTS) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.resetPasswordAttempts = 0;
      }
      await user.save({ validateBeforeSave: false });
      return invalidCode();
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordAttempts = 0;
    await user.save();

    res.status(200).json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const acceptTerms = async (req, res) => {
  try {
    if (req.body?.version !== TERMS_VERSION) {
      return res.status(400).json({
        message: "La versión de los términos no es la vigente. Recarga la página e intenta de nuevo.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { termsAcceptedAt: new Date(), termsVersion: TERMS_VERSION },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: "Términos aceptados",
      user: toUserPayload(user, { createdAt: user.createdAt }),
    });
  } catch (error) {
    handleError(res, error);
  }
};
