import mongoose from "mongoose";
const stockWatchlistSchema = new mongoose.Schema(
  {
    stockId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    ticker: {
      type: String,
      require: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'users'
    },
    watchlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "watchlist",
      required: true,
    },
  },
  { collection: "stockWatchlist" }
);
export default stockWatchlistSchema;