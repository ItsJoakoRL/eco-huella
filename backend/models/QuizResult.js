import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    results: {
      housing_kg: Number,
      transport_kg: Number,
      food_kg: Number,
      waste_kg: Number,
      total_kg: Number,
      total_tonnes: Number,
      planets_needed: Number,
      percentage_vs_average: Number,
    },
    metadata: {
      survey_type: String,
      household_size: Number,
      renewable_energy: Boolean,
      diet_type: String,
      transport_main: String,
      completed_at: Date,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("QuizResult", quizResultSchema);
