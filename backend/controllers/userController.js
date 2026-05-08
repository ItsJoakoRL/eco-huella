import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
      occupation,
      householdSize,
      sustainabilityGoal,
    } = req.body;

    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.name = name;
    user.username = username;
    user.email = email;
    user.role = role;
    user.age = age;
    user.birthDate = birthDate;
    user.sex = sex;
    user.city = city;
    user.province = province;
    user.country = country;
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
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Rol inválido" });
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
    res.status(500).json({ message: error.message });
  }
};
