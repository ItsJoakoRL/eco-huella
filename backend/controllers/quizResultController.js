import { handleError } from "../utils/httpError.js";
import QuizResult from "../models/QuizResult.js";
import quizData from "../utils/quizData.js";
import { SURVEY_TYPES, buildQuizResult, sanitizeAnswers } from "../shared/quizCalculator.js";

export const getMyResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ userId: req.userId }).sort({
      completedAt: -1,
    });

    res.status(200).json({
      count: results.length,
      results,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getResultById = async (req, res) => {
  try {
    const result = await QuizResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Resultado no encontrado" });
    }

    // Check if user is the owner or admin
    if (result.userId.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    res.status(200).json({ result });
  } catch (error) {
    handleError(res, error);
  }
};

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const ALREADY_COMPLETED = { message: "Esta encuesta ya fue completada por este usuario" };

export const saveQuizResult = async (req, res) => {
  try {
    const { answers, metadata } = req.body;

    if (!isPlainObject(answers)) {
      return res.status(400).json({
        message: "answers es requerido",
      });
    }

    // Los resultados y metadatos que mande el cliente se ignoran: se recalculan acá
    // con las respuestas, así nadie puede guardar números inventados.
    const surveyType = metadata?.survey_type || answers?._surveyType || "ambiental";
    if (!SURVEY_TYPES.includes(surveyType)) {
      return res.status(400).json({ message: "Tipo de encuesta inválido" });
    }

    const existingResult = await QuizResult.findOne({
      userId: req.userId,
      $or: [
        { "metadata.survey_type": surveyType },
        { "answers._surveyType": surveyType },
      ],
    });

    if (existingResult) {
      return res.status(409).json(ALREADY_COMPLETED);
    }

    const completedAt = new Date();
    const derived = buildQuizResult(quizData, sanitizeAnswers(quizData, answers, surveyType), surveyType);
    const quizResult = await QuizResult.create({
      userId: req.userId,
      answers: derived.answers,
      results: derived.results,
      metadata: { ...derived.metadata, completed_at: completedAt },
      completedAt,
    });

    res.status(201).json({
      message: "Resultado guardado exitosamente",
      result: quizResult,
    });
  } catch (error) {
    // Dos envíos simultáneos pasan la comprobación de arriba; el índice único de
    // (usuario, tipo de encuesta) frena al segundo.
    if (error?.code === 11000) {
      return res.status(409).json(ALREADY_COMPLETED);
    }
    handleError(res, error);
  }
};

export const updateQuizResult = async (req, res) => {
  try {
    let result = await QuizResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Resultado no encontrado" });
    }

    // Check if user is the owner or admin
    if (result.userId.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    // Lo único editable son las respuestas; los resultados y metadatos se recalculan
    // a partir de ellas (lo que mande el cliente en results/metadata se ignora). Así
    // se evita reasignar el dueño (userId), tocar _id o guardar números inventados.
    const { answers } = req.body;
    if (!isPlainObject(answers)) {
      return res.status(400).json({ message: "answers es requerido y debe ser un objeto" });
    }

    // El tipo de encuesta no se puede cambiar: sería la forma de volver a responder
    // la misma encuesta pasándola por otro tipo.
    const surveyType =
      result.metadata?.survey_type || result.answers?.get("_surveyType") || "ambiental";
    const derived = buildQuizResult(quizData, sanitizeAnswers(quizData, answers, surveyType), surveyType);

    result = await QuizResult.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          answers: derived.answers,
          results: derived.results,
          metadata: { ...derived.metadata, completed_at: result.metadata?.completed_at },
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Resultado actualizado exitosamente",
      result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteQuizResult = async (req, res) => {
  try {
    const result = await QuizResult.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: "Resultado no encontrado" });
    }

    // Check if user is the owner or admin
    if (result.userId.toString() !== req.userId && req.userRole !== "admin") {
      return res.status(403).json({ message: "Acceso denegado" });
    }

    await QuizResult.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Resultado eliminado exitosamente",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllResults = async (req, res) => {
  // Admin only
  try {
    const results = await QuizResult.find()
      .populate("userId", "name email")
      .sort({ completedAt: -1 });

    res.status(200).json({
      count: results.length,
      results,
    });
  } catch (error) {
    handleError(res, error);
  }
};
