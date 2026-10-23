import { handleError } from "../utils/httpError.js";
import User from "../models/User.js";
import QuizResult from "../models/QuizResult.js";
import { generateResetCode } from "../utils/resetCode.js";

// Un código dado en persona o por mensaje tarda más en usarse que uno por mail.
const ADMIN_RESET_CODE_MINUTES = 60;

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ user });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateUser = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      role,
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
    } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim().toLowerCase();

    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (req.params.id === req.userId && role && role !== "admin") {
      return res.status(400).json({
        message: "No puedes quitarte el rol de administrador a ti mismo",
      });
    }

    const duplicateChecks = [
      ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
      ...(normalizedUsername ? [{ username: normalizedUsername }] : []),
    ];
    const duplicateUser = duplicateChecks.length
      ? await User.findOne({
          _id: { $ne: req.params.id },
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

    user.name = name;
    user.username = normalizedUsername;
    user.email = normalizedEmail;
    user.role = role ?? user.role;
    user.age = age;
    user.birthDate = birthDate;
    user.sex = sex;
    user.city = city;
    user.province = province;
    user.country = country;
    user.uccuyoLevel = uccuyoLevel;
    user.occupation = occupation;
    user.householdSize = householdSize;
    user.sustainabilityGoal = sustainabilityGoal;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          message: "La contraseña debe tener al menos 6 caracteres",
        });
      }
      user.password = password;
    }

    await user.save();
    user.password = undefined;

    res.status(200).json({
      message: "Usuario actualizado exitosamente",
      user,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const message =
        field === "email"
          ? "El email ya está registrado"
          : "El nombre de usuario ya está registrado";
      return res.status(400).json({ message });
    }

    handleError(res, error);
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({
        message: "No puedes eliminar tu propia cuenta desde el panel",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Sin cuenta no tiene sentido conservar sus encuestas: quedarían huérfanas.
    await QuizResult.deleteMany({ userId: user._id });

    res.status(200).json({
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Rol inválido" });
    }

    if (req.params.id === req.userId && role !== "admin") {
      return res.status(400).json({
        message: "No puedes quitarte el rol de administrador a ti mismo",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: "Rol de usuario actualizado exitosamente",
      user,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// El administrador genera un código de 6 dígitos para que la persona restablezca su
// contraseña sin depender del correo. Se canjea en POST /api/auth/reset-password
// (correo + código + contraseña nueva): tiene vencimiento, sirve una sola vez y
// admite 5 intentos. El código solo viaja en esta respuesta; en la base queda su hash.
export const createResetCode = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { code, hash } = generateResetCode();
    const expiresAt = new Date(Date.now() + ADMIN_RESET_CODE_MINUTES * 60 * 1000);
    user.resetPasswordToken = hash;
    user.resetPasswordExpires = expiresAt;
    user.resetPasswordAttempts = 0;
    await user.save({ validateBeforeSave: false });

    res.set("Cache-Control", "no-store");
    res.status(200).json({
      code,
      expiresAt,
      expiresInMinutes: ADMIN_RESET_CODE_MINUTES,
      user: { id: user._id, name: user.name, username: user.username, email: user.email },
    });
  } catch (error) {
    handleError(res, error);
  }
};
