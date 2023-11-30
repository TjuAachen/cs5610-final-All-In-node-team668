import mongoose from "mongoose";
import watchlistSchema from "../schemata/watchlist-schema.js";

const watchlistModel = mongoose.model("playlists", watchlistSchema);
export default watchlistModel;