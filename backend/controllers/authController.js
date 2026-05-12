import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetCode } from "../utils/emailService.js";

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || "ecohuella-default-secret",
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

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

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "Por favor proporciona nombre, usuario, email y contraseÃ±a",
      });
    }

    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();
    const userExists = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });
    if (userExists) {
      const message =
        userExists.email === normalizedEmail
          ? "El email ya estÃ¡ registrado"
          : "El nombre de usuario ya estÃ¡ registrado";
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
      user: {
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
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Por favor proporciona usuario/email y contraseÃ±a",
      });
    }

    const loginValue = email.toLowerCase();
    const user = await User.findOne({
      $or: [{ email: loginValue }, { username: loginValue }],
    }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Credenciales invÃ¡lidas" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales invÃ¡lidas" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "SesiÃ³n iniciada exitosamente",
      token,
      user: {
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
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      user: {
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
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
          ? "El email ya esta registrado"
          : "El nombre de usuario ya esta registrado";
      return res.status(400).json({ message });
    }

    if (password && password.length < 6) {
      return res.status(400).json({
        message: "La contrasena debe tener al menos 6 caracteres",
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
      user: {
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
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const registeredEmail = email?.trim().toLowerCase();

    if (!registeredEmail) {
      return res.status(400).json({
        message: "Ingresa el correo con el que registraste tu cuenta",
      });
    }

    const user = await User.findOne({ email: registeredEmail });

    if (!user) {
      return res.status(404).json({
        message: "No existe una cuenta registrada con ese correo",
      });
    }

    const resetToken = String(crypto.randomInt(100000, 1000000));
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });
    await withTimeout(
      sendPasswordResetCode({
        to: user.email,
        name: user.name,
        code: resetToken,
      }),
      15000,
      "El correo tardo demasiado en enviarse. Revisa la configuracion de Gmail e intenta de nuevo."
    );

    res.status(200).json({
      message:
        "Te enviamos un código de 6 dígitos al correo registrado. Expira en 15 minutos.",
    });
  } catch (error) {
    res.status(500).json({
      message:
        error.message ||
        "No se pudo enviar el código de recuperación al correo registrado",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const registeredEmail = email?.trim().toLowerCase();

    if (!registeredEmail || !token || !password) {
      return res.status(400).json({
        message: "Por favor proporciona el correo, el codigo y la nueva contrasena",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseÃ±a debe tener al menos 6 caracteres",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email: registeredEmail,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        message: "El cÃ³digo es invÃ¡lido o ya expirÃ³",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "ContraseÃ±a actualizada correctamente",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
