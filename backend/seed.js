import dotenv from "dotenv";
import User from "./models/User.js";
import Question from "./models/Question.js";
import EmissionParameter from "./models/EmissionParameter.js";
import connectDB from "./config/database.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("Conexión a MongoDB establecida");

    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    await EmissionParameter.deleteMany({});

    // Create admin user
    const admin = await User.create({
      name: "Admin Eco-Huella",
      username: "admin",
      email: "admin@eco-huella.com",
      password: "admin123456",
      role: "admin",
      age: 34,
      birthDate: "1991-01-01",
      sex: "prefer_not_say",
      city: "Mendoza",
      province: "Mendoza",
      country: "Argentina",
      occupation: "Administrador ambiental",
      householdSize: 2,
      sustainabilityGoal: "learn",
    });
    console.log("✓ Admin creado:", admin.email);

    // Create test user
    const user = await User.create({
      name: "Usuario Test",
      username: "usuario_test",
      email: "user@eco-huella.com",
      password: "user123456",
      role: "user",
      age: 24,
      birthDate: "2001-01-01",
      sex: "male",
      city: "San Rafael",
      province: "Mendoza",
      country: "Argentina",
      occupation: "Estudiante",
      householdSize: 3,
      sustainabilityGoal: "save_water",
    });
    console.log("✓ Usuario test creado:", user.email);

    // Create sample questions
    const questions = [
      {
        id: "housing_1",
        module: "housing",
        text: "¿Cuántos kWh consume electricidad mensualmente?",
        description: "Consumo de electricidad en kilovatios-hora",
        type: "number",
        unit: "kWh",
        min: 0,
        max: 1000,
        order: 1,
        parameters: { factor: 0.41, base_yearly_kg: 0 },
      },
      {
        id: "housing_2",
        module: "housing",
        text: "¿Qué tipo de calefacción utilizas?",
        type: "select",
        options: [
          { label: "Gas natural", value: "gas", factor: 2.34 },
          { label: "Electricidad", value: "electricity", factor: 0.41 },
          { label: "Renovables", value: "renewable", factor: 0.05 },
        ],
        order: 2,
        parameters: { base_yearly_kg: 500 },
      },
      {
        id: "transport_1",
        module: "transport",
        text: "¿Cuántos km conduces por semana?",
        type: "number",
        unit: "km",
        min: 0,
        max: 500,
        order: 1,
        parameters: { factor: 0.192, base_yearly_kg: 0 },
      },
      {
        id: "food_1",
        module: "food",
        text: "¿Cuál es tu tipo de dieta principal?",
        type: "select",
        options: [
          { label: "Omnívora", value: "omnivore", factor: 1 },
          { label: "Vegetariana", value: "vegetarian", factor: 0.67 },
          { label: "Vegana", value: "vegan", factor: 0.5 },
        ],
        order: 1,
        parameters: { base_yearly_kg: 2700 },
      },
      {
        id: "waste_1",
        module: "waste",
        text: "¿Reciclas regularmente?",
        type: "select",
        options: [
          { label: "Siempre", value: "always", factor: 0.5 },
          { label: "A veces", value: "sometimes", factor: 0.75 },
          { label: "Nunca", value: "never", factor: 1 },
        ],
        order: 1,
        parameters: { base_yearly_kg: 200 },
      },
    ];

    const createdQuestions = await Question.insertMany(questions);
    console.log(`✓ ${createdQuestions.length} preguntas creadas`);

    // Create emission parameters
    await EmissionParameter.create({
      category: "housing",
      parameters: {
        housing: {
          electricity_factor: 0.41,
          heating_factor: 2.34,
          renewable_reduction: 0.9,
          people_occupancy: 2.5,
        },
        transport: {
          car_factor: 0.192,
          public_transport_factor: 0.089,
          flight_factor: 0.255,
          weeks_per_year: 52,
        },
        food: {
          omnivore_base: 2700,
          vegetarian_reduction: 0.67,
          vegan_reduction: 0.5,
          local_reduction: 0.9,
          waste_multiplier: 1.15,
        },
        waste: {
          base_yearly: 200,
          recycling_reduction: 0.5,
          repair_reduction: 0.3,
          consumption_multiplier: 1.2,
        },
      },
    });
    console.log("✓ Parámetros de emisión creados");

    console.log("\n✅ Base de datos inicializada exitosamente");
    console.log("\nCredenciales de prueba:");
    console.log("Admin:");
    console.log("  Email: admin@eco-huella.com");
    console.log("  Contraseña: admin123456");
    console.log("\nUsuario:");
    console.log("  Email: user@eco-huella.com");
    console.log("  Contraseña: user123456");

    process.exit(0);
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
    process.exit(1);
  }
};

seedDatabase();
