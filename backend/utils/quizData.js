import { readFileSync } from "node:fs";

// Preguntas y factores del cuestionario (el mismo archivo que usa el frontend). Se lee
// con fs en vez de importar el JSON para no depender de la versión de Node.
export default JSON.parse(
  readFileSync(new URL("../shared/questions.json", import.meta.url), "utf8")
);
