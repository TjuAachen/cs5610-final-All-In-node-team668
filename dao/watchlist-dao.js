import watchlistModel from "./models/watchlist-model.js";
import userModel from "./models/user-model.js";
import stockModel from "./models/stock-model.js";
import stockWatchlistModel from "./models/stockWatchlist-model.js";
import mongoose from "mongoose";

// recommend on home page
export const findTopWatchlists = (uid) =>{
    // console.log("uid:", uid)
    if (uid ) {
        return watchlistModel.find({ user: { $ne: new mongoose.Types.ObjectId(uid) } })// not show current user's playlist
            .sort({ rating: -1 }) // sort by rating
            .limit(5)
            .populate("user", "userName", userModel);
    } else {
        return watchlistModel.find()
        .sort({ rating: -1 }) // sort by rating
        .limit(5)
        .populate("user", "userName", userModel);
    }
}

// CRUD of playlists
export const findWatchListsByUserId = (req) => watchlistModel.find(req);
export const findWatchlistByIds = (ids) =>
  watchlistModel.find({ _id: { $in: ids } });
export const findWatchlistById = (id) => watchlistModel.findOne({ _id: id });
export const findAllWatchlists = () => watchlistModel.find();
export const deleteWatchlist = (wid) => watchlistModel.deleteOne({ _id: wid });
export const createWatchlist = (watchlist) => watchlistModel.create(watchlist);
export const updateWatchlist = (watchlist) =>
  watchlistModel.updateOne({ _id: watchlist._id }, { $set: watchlist });
export const countWatchlists = () => watchlistModel.countDocuments();
export const findLastPageUsers = async (limit) => {
    const totalUsers = await watchlistModel.count();
    const lastPage = Math.ceil(totalUsers / limit);
    return findWatchlistsPagination(lastPage, limit);
}





export const findWatchlistByName = (name) => {
    // Create a regex pattern for fuzzy matching
    const fuzzyRegex = new RegExp(name.split('').join('.*'), 'i');

    const watchlist = watchlistModel.find({
      watchListName: {
        $regex: fuzzyRegex,
      },
    });

    return watchlist;
};

// update the watchlists by the stock-watchlist collection
export const findLatestWatchlistsInPage = async (page, limit) => {
  try {
      const skipIndex = (page - 1) * limit;
      const watchlists = await watchlistModel.find().skip(skipIndex).limit(limit)
          .populate("user", "userName", userModel)
          .exec();

      const updatedWatchlists = await Promise.all(
          watchlists.map(async (watchlist) => {
              const stocks = await stockWatchlistModel
                  .find({ watchlistId: watchlist._id })
                  .populate("ticker", "stockName", stockModel)
                  .exec();
              return {
                  ...watchlist.toObject(),
                  stocks: stocks
              };
          })
      );
      return updatedWatchlists;
  } catch (error) {
      console.error(error);
      throw error;
  }
};