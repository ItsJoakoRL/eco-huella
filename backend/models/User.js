import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Por favor proporciona tu nombre"],
    },
    username: {
      type: String,
      required: [true, "Por favor proporciona tu nombre de usuario"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "El nombre de usuario debe tener al menos 3 caracteres"],
      maxlength: [24, "El nombre de usuario no puede superar 24 caracteres"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "El nombre de usuario solo puede incluir letras, numeros y guion bajo",
      ],
    },
    email: {
      type: String,
      required: [true, "Por favor proporciona tu email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor proporciona un email válido",
      ],
    },
    password: {
      type: String,
      required: [true, "Por favor proporciona una contraseña"],
      minlength: 6,
      select: false,
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
    },
    birthDate: {
      type: Date,
    },
    sex: {
      type: String,
      enum: ["female", "male", "prefer_not_say", ""],
      default: "",
    },
    city: {
      type: String,
      trim: true,
    },
    province: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
      default: "Argentina",
    },
    uccuyoLevel: {
      type: String,
      enum: ["jardin", "primario", "secundaria", "universidad", ""],
      default: "",
    },
    occupation: {
      type: String,
      trim: true,
    },
    householdSize: {
      type: Number,
      min: 1,
      max: 20,
      default: 1,
    },
    sustainabilityGoal: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    avatarZoom: {
      type: Number,
      min: 1,
      max: 3,
      default: 1,
    },
    avatarOffsetX: {
      type: Number,
      min: -50,
      max: 50,
      default: 0,
    },
    avatarOffsetY: {
      type: Number,
      min: -50,
      max: 50,
      default: 0,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
