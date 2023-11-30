import stockWatchlistModel from "./models/stockWatchlist-model.js";
import stockModel from "./models/stock-model.js";
// export const findSongById = (songId) => songModel.find({ _id: songId });
export const findWatchlistByUserStock = (ticker, userId) =>
  stockWatchlistModel.find({ ticker: ticker, userId: userId });
export const createStockWatchlist = (obj) => stockWatchlistModel.create(obj);
export const deleteStockWatchlist = (userId, ticker) =>
  songPlayModel.deleteOne({ userId: userId, ticker: ticker });
export const deleteStockWatchlistById = (watchlistId) =>
  stockWatchlistModel.deleteMany({ watchlistId: watchlistId });
export const findStocksByWatchlistId = (watchlistId) =>
  stockWatchlistModel
    .find({ watchlistId: watchlistId })
    .populate(
      "ticker",
      ["ticker", "stockName", "openPrice", "highPrice", "lowPrice", "closePrice", "date", "volume"],
      stockModel
    );
export const findStockNumbersByUserId = (userId) =>
  stockWatchlistModel.countDocuments({ userId: userId });
export const findStocksByUserId = (userId) =>
  stockWatchlistModel
    .find({ userId: userId })
    .populate(
        "ticker",
        ["ticker", "stockName", "openPrice", "highPrice", "lowPrice", "closePrice", "date", "volume"],
        stockModel
    );
export const updateStockWatchlist = (obj) =>
  stockWatchlistModel.updateOne({ userId: obj.userId, ticker: obj.ticker }, { $set: obj });