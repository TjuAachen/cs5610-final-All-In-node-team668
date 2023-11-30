import portfolioModel from "./models/portfolio-model.js";

export const findPortfoliosByUserId = (userId) =>
  portfolioModel.find({ user: userId });
export const deletePortfolio = (obj) => portfolioModel.deleteMany(obj);
export const createPortfolio = (portfolio) => portfolioModel.create(portfolio);
export const updatePortfolio = (portfolio) =>
  portfolioModel.updateOne({ _id: pprtfolio._id }, { $set: portfolio });

