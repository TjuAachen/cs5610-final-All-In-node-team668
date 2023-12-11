import * as watchlistDao from "../dao/watchlist-dao.js";
import * as userDao from "../dao/user-dao.js";
import checkVip from "../middleWares/checkIfVip.js";

const findTopWatchlists = async (req, res) => {
    let uid = null;
    // logged in
    if (req.session["currentUser"] !== undefined) {
        uid = req.session.currentUser._id;
    }
    // console.log("homecontroller:", req.session.id);
    // console.log(req.session["currentUser"]);
    const watchlists = await watchlistDao.findTopWatchlists(uid);
    console.log(watchlists, "debug watchlists");
    res.json(watchlists);
}

// Recommend the top five followees who create the most playlists
const findTopUsers = async (req, res) => {
    let uid = null;
    if (req.session.currentUser !== undefined) {
        uid = req.session.currentUser._id;
    }
    const users = await userDao.findTopUsers(uid);
    res.json(users);
}
export default (app) => {
    app.get('/api/home/topwatchlists', findTopWatchlists);
    app.get('/api/home/topusers', checkVip,findTopUsers);
}