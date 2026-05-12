import quizData from "../data/questions.json";

export const calculateQuizResults = (answersData = {}) => {
  const getOption = (moduleId, questionId) => {
    const question = quizData.modules
      .find((module) => module.id === moduleId)
      ?.questions.find((item) => item.id === questionId);

    if (!question || !answersData[questionId]) return null;
    return question.options?.find((option) => option.label === answersData[questionId]) || null;
  };

  const getNumber = (questionId, defaultVal = 1) => Number(answersData[questionId]) || defaultVal;

  const personas = getNumber("h_personas", 1);
  const elecOpt = getOption("hogar", "h_electricidad");
  const calOpt = getOption("hogar", "h_calefaccion");
  const renOpt = getOption("hogar", "h_renovable");

  let hogarKg = (((elecOpt?.value || 300) * 12 * (elecOpt?.factor || 0.35)) + (50 * 12 * (calOpt?.factor || 2.02))) / personas;
  hogarKg = hogarKg * (renOpt?.impact_modifier || 1.0);

  const transOpt = getOption("transporte", "t_medio_principal");
  const kmSemana = getNumber("t_distancia_semanal", 50);
  const vuelosOpt = getOption("transporte", "t_vuelos");
  const ocupacionOpt = getOption("transporte", "t_ocupacion");

  let transporteKg = (kmSemana * 52 * (transOpt?.factor || 0)) / (ocupacionOpt?.divisor || 1);
  transporteKg += (vuelosOpt?.value || 0) * (vuelosOpt?.factor || 0);

  const dietaOpt = getOption("alimentacion", "a_dieta");
  const procOpt = getOption("alimentacion", "a_procedencia");
  const despOpt = getOption("alimentacion", "a_desperdicio");

  let comidaKg = (dietaOpt?.base_yearly_kg || 1500) + ((despOpt?.extra_kg_co2 || 0) * 52);
  comidaKg = comidaKg * (procOpt?.impact_modifier || 1.0);

  const recicOpt = getOption("residuos", "r_reciclaje");
  const compOpt = getOption("residuos", "r_compras");
  const repOpt = getOption("residuos", "r_reparacion");

  let residuosKg = 300 + (compOpt?.extra_kg_co2 || 100);
  residuosKg = residuosKg * (recicOpt?.impact_modifier || 1.0) * (repOpt?.impact_modifier || 1.0);

  const lavarropasSemanal = getNumber("w_lavarropas", 0);
  const riegoSemanal = getNumber("w_riego", 0);
  const autoSemanal = getNumber("w_auto", 0);
  const aguaLitros = (lavarropasSemanal * 70 + riegoSemanal * 100 + autoSemanal * 200) * 52;

  const totalKg = hogarKg + transporteKg + comidaKg + residuosKg;
  const totalTon = (totalKg / 1000).toFixed(1);
  const diffAvg = (((totalTon - 4.7) / 4.7) * 100).toFixed(0);
  const planetas = (totalTon / 1.5).toFixed(1);

  return {
    hogar: (hogarKg / 1000).toFixed(1),
    transporte: (transporteKg / 1000).toFixed(1),
    comida: (comidaKg / 1000).toFixed(1),
    residuos: (residuosKg / 1000).toFixed(1),
    total: totalTon,
    diffAvg: Number(diffAvg),
    planetas: Number(planetas),
    aguaLitros,
    aguaM3: (aguaLitros / 1000).toFixed(1),
    raw: {
      hogarKg,
      transporteKg,
      comidaKg,
      residuosKg,
      totalKg,
    },
  };
};

export const buildQuizResultPayload = (answersData = {}) => {
  const results = calculateQuizResults(answersData);

  return {
    answers: answersData,
    results: {
      housing_kg: results.raw.hogarKg,
      transport_kg: results.raw.transporteKg,
      food_kg: results.raw.comidaKg,
      waste_kg: results.raw.residuosKg,
      total_kg: results.raw.totalKg,
      total_tonnes: Number(results.total),
      planets_needed: results.planetas,
      percentage_vs_average: results.diffAvg,
    },
    metadata: {
      household_size: Number(answersData.h_personas) || undefined,
      renewable_energy: answersData.h_renovable?.includes("Sí") || answersData.h_renovable?.includes("Si") || false,
      diet_type: answersData.a_dieta || "",
      transport_main: answersData.t_medio_principal || "",
      completed_at: new Date().toISOString(),
    },
  };
};
