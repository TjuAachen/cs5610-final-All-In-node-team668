import userModel from "./models/user-model.js";
import followeesModel from "./models/followees-model.js"
import mongoose from "mongoose";

export const countAllUsers = () => userModel.countDocuments();

// paginate query
export const findUsersPagination = (page, limit) => {
    const skipIndex = (page - 1) * limit;
    return userModel.find().skip(skipIndex).limit(limit);
}
export const findLatestUsers = async (limit) => {
    return userModel.find().sort({ createTime: -1 }).limit(limit);
}
export const findUserByPartialName = (userName) =>
    userModel.find({ userName: { $regex: userName, $options: "i" } });
export const findUserByName = (userName) =>
  userModel.findOne({ userName: userName });
export const findUserById = (id) => userModel.findOne({ _id: id });
export const findUserByIds = (ids) => userModel.find({ _id: { $in: ids } });
export const findUserByUsername = async (userName) => {
    const user = await userModel.findOne({ userName:userName });
    return user;
};

export const findUserByCredentials = async ({userName, password}) => {
    const user = await userModel.findOne({ userName:userName, password:password, isDeleted: false });
    return user;
};
export const findAllUsers = () => userModel.find();
export const createUser = async (user) => {
    const newUser = await userModel.create(user);
    return newUser;
};
export const deleteUser = (userId) => userModel.deleteOne({ _id: userId });
export const countUsers = () => userModel.countDocuments({isDeleted: false});
export const updateUser = async (userId, user) => {
    await userModel.updateOne({ _id: userId }, { $set: user });
    return userModel.findOne({_id: userId});
};


// recommend popular users for premium users
export const findTopUsers = async (uid) => {
    if (uid === null) {
        return userModel.find({isDeleted: false}).limit(5);
    }
    // console.log(typeof uid);
    const followedUserIds = await followeesModel
        .findOne({ user: uid })
        .select("followeeList -_id")
        .lean()
        .exec()
        .then((doc) => doc.followeeList);

    return await userModel
        .aggregate([
            {
                $match: {
                    $and: [
                        { _id: { $nin: followedUserIds } },
                        { _id: { $ne: new mongoose.Types.ObjectId(uid) } },
                        { isDeleted: false },
                    ],
                },
            },
            {
                $lookup: {
                    from: "watchlists",
                    localField: "_id",
                    foreignField: "user",
                    as: "watchlists",
                },
            },
            {
                $addFields: {
                    numWatchlists: {$size: "$watchlists"},
                },
            },
            {
                $sort: {
                    numWatchlists: -1,
                },
            },
            {
                $limit: 5,
            },
        ])
        .exec();
}


export const countVipUsers = () => userModel.countDocuments({ isVip: true, isDeleted: false });
export const countNewbieUsers = () => userModel.countDocuments({ gender: "newbie", isDeleted: false });
export const countExperiencedUsers = () => userModel.countDocuments({gender: "experienced", isDeleted: false });