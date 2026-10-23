// Cálculo de la huella de carbono. Lo usan el navegador (src/utils/quizResults.js,
// para mostrar el resultado) y el servidor (controllers/quizResultController.js, para
// guardar el resultado oficial a partir de las respuestas), así que los dos siempre
// calculan lo mismo. Es JavaScript puro: no puede depender del navegador ni de Node.
//
// Vive en backend/ porque Render solo despliega esa carpeta; el frontend lo importa.

// Qué módulos de questions.json recorre cada encuesta.
export const SURVEY_MODULES = {
  ambiental: ["hogar", "transporte", "alimentacion", "residuos"],
  agua: ["agua"],
  desayuno: ["desayuno"],
};

export const SURVEY_TYPES = Object.keys(SURVEY_MODULES);

const hasAnyAnswer = (answersData, ids) => ids.some((id) => answersData[id] !== undefined && answersData[id] !== "");

export const calculateQuizResults = (quizData, answersData = {}) => {
  const surveyType = answersData._surveyType || "ambiental";
  const getOption = (moduleId, questionId) => {
    const question = quizData.modules
      .find((module) => module.id === moduleId)
      ?.questions.find((item) => item.id === questionId);

    if (!question || !answersData[questionId]) return null;
    return question.options?.find((option) => option.label === answersData[questionId]) || null;
  };

  // Un 0 es una respuesta válida (p. ej. 0 km por semana): solo se usa el valor por
  // defecto si la pregunta no se respondió. Los negativos se tratan como 0.
  const getNumber = (questionId, defaultVal = 0) => {
    const rawValue = answersData[questionId];
    if (rawValue === undefined || rawValue === null || rawValue === "") return defaultVal;
    const parsedValue = Number(rawValue);
    return Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : defaultVal;
  };
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

    // Para los autos, "factor" es kg de CO2 por LITRO de combustible y "liters_per_km"
    // (consumo) lo lleva a kilómetros. Transporte público y bicicleta no tienen
    // liters_per_km: su factor ya está expresado por km.
    const kgPerKm = (transOpt?.factor || 0) * (transOpt?.liters_per_km ?? 1);
    transporteKg = (kmSemana * 52 * kgPerKm) / (ocupacionOpt?.divisor || 1);
    transporteKg += (vuelosOpt?.value || 0) * (vuelosOpt?.factor || 0);

    const dietaOpt = getOption("alimentacion", "a_dieta");
    const procOpt = getOption("alimentacion", "a_procedencia");
    const despOpt = getOption("alimentacion", "a_desperdicio");

    // extra_kg_co2 del desperdicio ya es un valor anual (igual que en el recorrido
    // de desayuno); multiplicarlo por 52 lo inflaba.
    comidaKg = (dietaOpt?.base_yearly_kg || 1500) + (despOpt?.extra_kg_co2 || 0);
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
  // El porcentaje y los planetas se calculan con el total sin redondear; redondear
  // antes a 1 decimal los desviaba (p. ej. 4,74 t se tomaba como 4,7 t = 0 %).
  const totalTonExact = totalKg / 1000;
  const totalTon = totalTonExact.toFixed(1);
  const diffAvg = totalKg ? (((totalTonExact - 4.7) / 4.7) * 100).toFixed(0) : 0;
  const planetas = totalKg ? (totalTonExact / 1.5).toFixed(1) : 0;

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

// Arma lo que se guarda de una encuesta (respuestas, resultados y metadatos) a partir
// de las respuestas. Sin la fecha de finalización: la pone quien guarda.
export const buildQuizResult = (quizData, answersData = {}, surveyType = "ambiental") => {
  const answersWithTrack = { ...answersData, _surveyType: surveyType };
  const results = calculateQuizResults(quizData, answersWithTrack);

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
    },
  };
};

// Deja solo las respuestas que corresponden a la encuesta: preguntas conocidas del
// recorrido, como texto de hasta MAX_ANSWER_LENGTH caracteres. Lo demás se descarta.
export const MAX_ANSWER_LENGTH = 200;

export const sanitizeAnswers = (quizData, answersData, surveyType) => {
  const allowedIds = new Set(
    quizData.modules
      .filter((module) => (SURVEY_MODULES[surveyType] || []).includes(module.id))
      .flatMap((module) => module.questions.map((question) => question.id))
  );

  const clean = {};
  for (const [key, value] of Object.entries(answersData || {})) {
    if (!allowedIds.has(key)) continue;
    if (typeof value !== "string" && typeof value !== "number") continue;
    const text = String(value);
    if (text.length > MAX_ANSWER_LENGTH) continue;
    clean[key] = text;
  }
  return clean;
};
