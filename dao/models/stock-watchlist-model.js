import mongoose from "mongoose";
import stockWatchlistSchema from "../schemata/stockWatchlist-schema.js";

const stockWatchlistModel = mongoose.model("stockWatchlist", stockWatchlistSchema);
export default stockWatchlistModel;