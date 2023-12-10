import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
    {
        ticker: {type: String, required: true},
        stockName: {type: String, required: true},
        openPrice: {type: Number, required: true},
        highPrice: {type: Number, required: true},
        lowPrice:{type: Number, required: true},
        closePrice: {type: Number, required: true},
        date: {type: Date, required: true},
        volume: {type: Number, required: true},
    },
    {collection: "stocks"}
);
export default songSchema;

