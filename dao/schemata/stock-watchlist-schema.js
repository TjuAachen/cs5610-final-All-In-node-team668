import mongoose from "mongoose";
const stockWatchlistSchema = new mongoose.Schema(
  {
    ticker: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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