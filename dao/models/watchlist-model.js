import mongoose from "mongoose";
import watchlistSchema from "../schemata/watchlist-schema.js";

const watchlistModel = mongoose.model("watchlists", watchlistSchema);
export default watchlistModel;