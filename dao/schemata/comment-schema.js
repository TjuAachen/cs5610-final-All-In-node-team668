import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    watchlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "watchlist",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    content: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  { collection: "comments" }
);

 export default commentSchema;