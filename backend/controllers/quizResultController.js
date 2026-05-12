import QuizResult from "../models/QuizResult.js";

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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

export const saveQuizResult = async (req, res) => {
  try {
    const { answers, results, metadata } = req.body;

    if (!answers || !results) {
      return res.status(400).json({
        message: "answers y results son requeridos",
      });
    }

    const surveyType = metadata?.survey_type || answers?._surveyType || "ambiental";
    const existingResult = await QuizResult.findOne({
      userId: req.userId,
      $or: [
        { "metadata.survey_type": surveyType },
        { "answers._surveyType": surveyType },
      ],
    });

    if (existingResult) {
      return res.status(409).json({
        message: "Esta encuesta ya fue completada por este usuario",
      });
    }

    const quizResult = await QuizResult.create({
      userId: req.userId,
      answers: { ...answers, _surveyType: surveyType },
      results,
      metadata: { ...metadata, survey_type: surveyType },
      completedAt: new Date(),
    });

    res.status(201).json({
      message: "Resultado guardado exitosamente",
      result: quizResult,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    result = await QuizResult.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Resultado actualizado exitosamente",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};
