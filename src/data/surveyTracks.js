import { SURVEY_MODULES } from "../../backend/shared/quizCalculator";

export const surveyTracks = [
  {
    id: "ambiental",
    title: "Encuesta ambiental",
    subtitle: "Huella general",
    description: "Hogar, transporte, alimentación y residuos.",
    icon: "eco",
    modules: SURVEY_MODULES.ambiental,
  },
  {
    id: "agua",
    title: "Consumo de agua",
    subtitle: "Hábitos semanales",
    description: "Lavarropas, riego de plantas y lavado del auto.",
    icon: "water_drop",
    modules: SURVEY_MODULES.agua,
  },
  {
    id: "desayuno",
    title: "Desayuno",
    subtitle: "4 preguntas",
    description: "Bebida, comida principal, origen y desperdicio.",
    icon: "breakfast_dining",
    modules: SURVEY_MODULES.desayuno,
  },
];

export const getSurveyTrack = (trackId) =>
  surveyTracks.find((track) => track.id === trackId) || surveyTracks[0];
