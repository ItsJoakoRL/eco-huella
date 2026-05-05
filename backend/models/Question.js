import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    module: {
      type: String,
      required: [true, "El módulo es requerido"],
      enum: ["housing", "transport", "food", "waste"],
    },
    text: {
      type: String,
      required: [true, "El texto de la pregunta es requerido"],
    },
    description: String,
    type: {
      type: String,
      required: true,
      enum: ["select", "number", "range"],
    },
    options: [
      {
        label: String,
        value: String,
        factor: Number,
      },
    ],
    min: Number,
    max: Number,
    step: Number,
    unit: String,
    parameters: {
      factor: Number,
      impact_modifier: Number,
      base_yearly_kg: Number,
      multiplier: Number,
    },
    order: Number,
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
