import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      city,
      province,
      country,
      occupation,
      householdSize,
      sustainabilityGoal,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Por favor proporciona nombre, email y contraseña",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const user = await User.create({
      name,
      email,
      password,
      age,
      city,
      province,
      country,
      occupation,
      householdSize,
      sustainabilityGoal,
    });
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        city: user.city,
        province: user.province,
        country: user.country,
        occupation: user.occupation,
        householdSize: user.householdSize,
        sustainabilityGoal: user.sustainabilityGoal,
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
        message: "Por favor proporciona email y contraseña",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Sesión iniciada exitosamente",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        city: user.city,
        province: user.province,
        country: user.country,
        occupation: user.occupation,
        householdSize: user.householdSize,
        sustainabilityGoal: user.sustainabilityGoal,
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
        email: user.email,
        role: user.role,
        age: user.age,
        city: user.city,
        province: user.province,
        country: user.country,
        occupation: user.occupation,
        householdSize: user.householdSize,
        sustainabilityGoal: user.sustainabilityGoal,
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
      email,
      age,
      city,
      province,
      country,
      occupation,
      householdSize,
      sustainabilityGoal,
    } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name,
        email,
        age,
        city,
        province,
        country,
        occupation,
        householdSize,
        sustainabilityGoal,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: "Perfil actualizado exitosamente",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        city: user.city,
        province: user.province,
        country: user.country,
        occupation: user.occupation,
        householdSize: user.householdSize,
        sustainabilityGoal: user.sustainabilityGoal,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Por favor proporciona tu email" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No existe una cuenta con ese email" });
    }

    const resetToken = crypto.randomBytes(24).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      message: "Codigo de recuperacion generado. Expira en 15 minutos.",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Por favor proporciona el codigo y la nueva contrasena",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contrasena debe tener al menos 6 caracteres",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password +resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        message: "El codigo es invalido o ya expiro",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      message: "Contrasena actualizada correctamente",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
