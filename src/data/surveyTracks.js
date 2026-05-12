export const surveyTracks = [
  {
    id: "ambiental",
    title: "Encuesta ambiental",
    subtitle: "Huella general",
    description: "Hogar, transporte, alimentacion y residuos.",
    icon: "eco",
    modules: ["hogar", "transporte", "alimentacion", "residuos"],
  },
  {
    id: "agua",
    title: "Consumo de agua",
    subtitle: "Habitos semanales",
    description: "Lavarropas, riego de plantas y lavado del auto.",
    icon: "water_drop",
    modules: ["agua"],
  },
  {
    id: "desayuno",
    title: "Desayuno",
    subtitle: "4 preguntas",
    description: "Bebida, comida principal, origen y desperdicio.",
    icon: "breakfast_dining",
    modules: ["desayuno"],
  },
];

export const getSurveyTrack = (trackId) =>
  surveyTracks.find((track) => track.id === trackId) || surveyTracks[0];
