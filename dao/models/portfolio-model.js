import mongoose from "mongoose";
import portfolioSchema from "../schemata/portfolio-schema.js";

const portfolioModel = mongoose.model("portfolioModel", portfolioSchema);
export default portfolioModel;