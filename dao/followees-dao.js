import followeesModel from "./models/followees-model.js";

export const findFollowees = (userId) => {
  return followeesModel.find({ user: userId });
};

export const updateFollowees = (uid, followeeList) =>
  followeesModel.updateOne({ user: uid }, { $set: followeeList });

export const createFolloweeList = (followObject) => followeesModel.create(followObject);