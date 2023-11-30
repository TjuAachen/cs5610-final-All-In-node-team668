import mongoose from "mongoose";
import stockSchema from "../schemata/stock-schema.js";

const stockModel = mongoose.model("stockModel", stockSchema);
export default stockModel;