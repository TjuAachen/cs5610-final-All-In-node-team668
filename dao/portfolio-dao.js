import portfolioModel from "./models/portfolio-model.js";

export const findPortfoliosByUserId = (userId) =>
  portfolioModel.find({ user: userId });
export const deletePortfolioByUserStock = (ticker, uid) => portfolioModel.deleteOne({ticker: ticker, user: uid});
export const createPortfolio = (portfolio) => portfolioModel.create(portfolio);
export const updatePortfolio = (portfolio) =>
  portfolioModel.updateOne({ _id: portfolio._id}, { $set: portfolio });

  export const deletePortfolioByPortfolioId = (pid) => portfolioModel.deleteMany({_id: pid});

