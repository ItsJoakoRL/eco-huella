import { handleError } from "../utils/httpError.js";
import EmissionParameter from "../models/EmissionParameter.js";

export const getAllParameters = async (req, res) => {
  try {
    const parameters = await EmissionParameter.find({ active: true });
    res.status(200).json({
      count: parameters.length,
      parameters,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getParametersByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const parameters = await EmissionParameter.findOne({ category });

    if (!parameters) {
      return res.status(404).json({ message: "Parámetros no encontrados" });
    }

    res.status(200).json({ parameters });
  } catch (error) {
    handleError(res, error);
  }
};

export const updateParameters = async (req, res) => {
  try {
    const { category } = req.params;
    const parameters = await EmissionParameter.findOneAndUpdate(
      { category },
      req.body,
      { new: true, runValidators: true }
    );

    if (!parameters) {
      return res.status(404).json({ message: "Parámetros no encontrados" });
    }

    res.status(200).json({
      message: "Parámetros actualizados exitosamente",
      parameters,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const createParameters = async (req, res) => {
  try {
    const parameters = await EmissionParameter.create(req.body);
    res.status(201).json({
      message: "Parámetros creados exitosamente",
      parameters,
    });
  } catch (error) {
    handleError(res, error);
  }
};
