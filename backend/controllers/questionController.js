import Question from "../models/Question.js";

export const getAllQuestions = async (req, res) => {
  try {
    const { module, active } = req.query;
    const filter = {};

    if (module) filter.module = module;
    if (active !== undefined) filter.active = active === "true";

    const questions = await Question.find(filter).sort({ order: 1 });
    res.status(200).json({
      count: questions.length,
      questions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }
    res.status(200).json({ question });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { id, module, text, type, parameters, options } = req.body;

    if (!id || !module || !text || !type) {
      return res.status(400).json({
        message: "Los campos id, module, text y type son requeridos",
      });
    }

    const questionExists = await Question.findOne({ id });
    if (questionExists) {
      return res.status(400).json({ message: "Una pregunta con este id ya existe" });
    }

    const question = await Question.create(req.body);
    res.status(201).json({
      message: "Pregunta creada exitosamente",
      question,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    res.status(200).json({
      message: "Pregunta actualizada exitosamente",
      question,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    res.status(200).json({
      message: "Pregunta eliminada exitosamente",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
