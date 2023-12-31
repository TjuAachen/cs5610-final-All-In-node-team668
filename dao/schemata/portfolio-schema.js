import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    ticker: { type: mongoose.Schema.Types.ObjectId, ref: "stock", required: true },
    creationDate: {type: Date, required: true},
    buyPrice: {type: Number, required: true},
    shares: {type: Number, required: true},
    currentPrice: {type: Number, required: true},
    return: {type: Number, required: true}
  },
  { collection: "portfolio" }
);
export default portfolioSchema;