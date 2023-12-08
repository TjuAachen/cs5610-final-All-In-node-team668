import mongoose from "mongoose";
import followeesSchema from "../schemata/followees-schema.js";

const followeesModel = mongoose.model("followeesModel", followeesSchema);
export default followeesModel;