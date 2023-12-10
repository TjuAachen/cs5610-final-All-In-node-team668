import mongoose from "mongoose";

const watchlistSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        watchListName: { type: String, required: true },
        description: { type: String },
        isDefault: { type: Boolean, required: true },
        songs: { type: Array, default: [] },
        img: { type: String, default: "/images/watchlist-cover.jpeg" },
        rating: { type: Number, default: 0 },
    },
    { collection: "watchlists" }
);

export default watchlistSchema;