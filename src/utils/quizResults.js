import quizData from "../data/questions.json";

const hasAnyAnswer = (answersData, ids) => ids.some((id) => answersData[id] !== undefined && answersData[id] !== "");

export const calculateQuizResults = (answersData = {}) => {
  const surveyType = answersData._surveyType || "ambiental";
  const getOption = (moduleId, questionId) => {
    const question = quizData.modules
      .find((module) => module.id === moduleId)
      ?.questions.find((item) => item.id === questionId);

    if (!question || !answersData[questionId]) return null;
    return question.options?.find((option) => option.label === answersData[questionId]) || null;
  };

  const getNumber = (questionId, defaultVal = 0) => Number(answersData[questionId]) || defaultVal;
  const hasAmbiental = hasAnyAnswer(answersData, [
    "h_personas",
    "h_electricidad",
    "h_calefaccion",
    "h_renovable",
    "t_medio_principal",
    "t_distancia_semanal",
    "t_vuelos",
    "t_ocupacion",
    "a_dieta",
    "a_procedencia",
    "a_desperdicio",
    "r_reciclaje",
    "r_compras",
    "r_reparacion",
  ]);

  let hogarKg = 0;
  let transporteKg = 0;
  let comidaKg = 0;
  let residuosKg = 0;

  if (hasAmbiental) {
    const personas = getNumber("h_personas", 1) || 1;
    const elecOpt = getOption("hogar", "h_electricidad");
    const calOpt = getOption("hogar", "h_calefaccion");
    const renOpt = getOption("hogar", "h_renovable");

    hogarKg = (((elecOpt?.value || 300) * 12 * (elecOpt?.factor || 0.35)) + (50 * 12 * (calOpt?.factor || 2.02))) / personas;
    hogarKg = hogarKg * (renOpt?.impact_modifier || 1.0);

    const transOpt = getOption("transporte", "t_medio_principal");
    const kmSemana = getNumber("t_distancia_semanal", 50);
    const vuelosOpt = getOption("transporte", "t_vuelos");
    const ocupacionOpt = getOption("transporte", "t_ocupacion");

    transporteKg = (kmSemana * 52 * (transOpt?.factor || 0)) / (ocupacionOpt?.divisor || 1);
    transporteKg += (vuelosOpt?.value || 0) * (vuelosOpt?.factor || 0);

    const dietaOpt = getOption("alimentacion", "a_dieta");
    const procOpt = getOption("alimentacion", "a_procedencia");
    const despOpt = getOption("alimentacion", "a_desperdicio");

    comidaKg = (dietaOpt?.base_yearly_kg || 1500) + ((despOpt?.extra_kg_co2 || 0) * 52);
    comidaKg = comidaKg * (procOpt?.impact_modifier || 1.0);

    const recicOpt = getOption("residuos", "r_reciclaje");
    const compOpt = getOption("residuos", "r_compras");
    const repOpt = getOption("residuos", "r_reparacion");

    residuosKg = 300 + (compOpt?.extra_kg_co2 || 100);
    residuosKg = residuosKg * (recicOpt?.impact_modifier || 1.0) * (repOpt?.impact_modifier || 1.0);
  }

  const bebidaOpt = getOption("desayuno", "d_bebida");
  const comidaDesayunoOpt = getOption("desayuno", "d_comida");
  const origenOpt = getOption("desayuno", "d_origen");
  const desperdicioOpt = getOption("desayuno", "d_desperdicio");
  const desayunoKg =
    (((bebidaOpt?.breakfast_kg_co2_week || 0) + (comidaDesayunoOpt?.breakfast_kg_co2_week || 0)) * 52 * (origenOpt?.impact_modifier || 1)) +
    (desperdicioOpt?.extra_kg_co2 || 0);

  comidaKg += desayunoKg;

  const lavarropasSemanal = getNumber("w_lavarropas", 0);
  const riegoSemanal = getNumber("w_riego", 0);
  const autoSemanal = getNumber("w_auto", 0);
  const aguaLitros = (lavarropasSemanal * 70 + riegoSemanal * 100 + autoSemanal * 200) * 52;

  const totalKg = hogarKg + transporteKg + comidaKg + residuosKg;
  const totalTon = (totalKg / 1000).toFixed(1);
  const diffAvg = totalKg ? (((totalTon - 4.7) / 4.7) * 100).toFixed(0) : 0;
  const planetas = totalKg ? (totalTon / 1.5).toFixed(1) : 0;

  return {
    surveyType,
    hogar: (hogarKg / 1000).toFixed(1),
    transporte: (transporteKg / 1000).toFixed(1),
    comida: (comidaKg / 1000).toFixed(1),
    residuos: (residuosKg / 1000).toFixed(1),
    desayuno: (desayunoKg / 1000).toFixed(2),
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
      desayunoKg,
      totalKg,
    },
  };
};

export const buildQuizResultPayload = (answersData = {}, surveyType = "ambiental") => {
  const answersWithTrack = { ...answersData, _surveyType: surveyType };
  const results = calculateQuizResults(answersWithTrack);

  return {
    answers: answersWithTrack,
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
      survey_type: surveyType,
      household_size: Number(answersData.h_personas) || undefined,
      renewable_energy: answersData.h_renovable?.includes("Si") || answersData.h_renovable?.includes("Sí") || false,
      diet_type: answersData.a_dieta || "",
      transport_main: answersData.t_medio_principal || "",
      completed_at: new Date().toISOString(),
    },
  };
};
