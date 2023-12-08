import portfolioModel from "./models/portfolio-model.js";

export const findPortfoliosByUserId = (userId) =>
  portfolioModel.find({ user: userId });
export const deletePortfolioByUserStock = (ticker, uid) => portfolioModel.deleteOne({ticker: ticker, user: uid});
export const createPortfolio = (portfolio) => portfolioModel.create(portfolio);
export const updatePortfolio = (portfolio) =>
  portfolioModel.updateOne({ ticker: portfolio.ticker, user: portfolio.user }, { $set: portfolio });

