import mongoose from "mongoose";
import stockWatchlistSchema from "../schemata/stock-watchlist-schema.js";

const stockWatchlistModel = mongoose.model("stockWatchlist", stockWatchlistSchema);
export default stockWatchlistModel;