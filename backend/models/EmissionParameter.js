import mongoose from "mongoose";

const emissionParameterSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["housing", "transport", "food", "waste"],
      unique: true,
    },
    parameters: {
      housing: {
        electricity_factor: { type: Number, default: 0.41 }, // kg CO2 per kWh
        heating_factor: { type: Number, default: 2.34 }, // kg CO2 per unit
        renewable_reduction: { type: Number, default: 0.9 }, // 90% reduction for renewables
        people_occupancy: { type: Number, default: 2.5 },
      },
      transport: {
        car_factor: { type: Number, default: 0.192 }, // kg CO2 per km
        public_transport_factor: { type: Number, default: 0.089 },
        flight_factor: { type: Number, default: 0.255 },
        weeks_per_year: { type: Number, default: 52 },
      },
      food: {
        omnivore_base: { type: Number, default: 2700 }, // kg CO2e per year
        vegetarian_reduction: { type: Number, default: 0.67 },
        vegan_reduction: { type: Number, default: 0.5 },
        local_reduction: { type: Number, default: 0.9 },
        waste_multiplier: { type: Number, default: 1.15 },
      },
      waste: {
        base_yearly: { type: Number, default: 200 }, // kg CO2e base
        recycling_reduction: { type: Number, default: 0.5 },
        repair_reduction: { type: Number, default: 0.3 },
        consumption_multiplier: { type: Number, default: 1.2 },
      },
    },
    region: {
      type: String,
      default: "global",
    },
    version: {
      type: String,
      default: "1.0",
    },
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

export default mongoose.model("EmissionParameter", emissionParameterSchema);
