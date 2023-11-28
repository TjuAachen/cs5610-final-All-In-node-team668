import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, default: "empty-email" },
    cellphone: { type: String, default: "000000000" },
    password: { type: String, required: true },
    // validate
    gender: {
      type: String,
      required: true,
      default: "male",
      enum: ["male", "female", "non-binary"],
    },
    isAdmin: { type: Boolean, default: false },
    isVip: { type: Boolean, default: false },
    playlistsCount: { type: Number, default: 0 },
    img: { type: String, default: "../../images/profile-avatar.jpeg" },
    createTime: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { collection: "users" }
);

export default userSchema;