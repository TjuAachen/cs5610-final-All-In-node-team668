import mongoose from "mongoose";

const followeesSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    followeeList: { type: Array, default: [] },
  },
  { collection: "followees" }
);
export default followeesSchema;