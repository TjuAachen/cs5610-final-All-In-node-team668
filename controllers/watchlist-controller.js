import * as watchlistDao from "../dao/watchlist-dao.js"
import * as stockDao from "../dao/stock-dao.js";
import * as userDao from "../dao/user-dao.js";
import * as stockWatchlistDao from "../dao/stock-watchlist-dao.js";
import * as commentDao from "../dao/comment-dao.js";
import checkAdmin from "../middleWare/checkAdmin.js";

// create a watchlist
const createWatchlist = async (req, res) => {
  const newWatchlist = req.body;
  console.log("newWatchlist in createWatchlist", newWatchlist);
  const insertedWatchlist = await watchlistDao.createWatchlist(newWatchlist);
  res.json(insertedWatchlist);
};

// get all watchlists
const findWatchlists = async (req, res) => {
  const watchlists = await watchlistDao.findAllWatchlists();
  res.json(watchlists);
};
const findLatestWatchlists = async (req, res) => {
  const watchlists = await watchlistDao.findLatestWatchlistsInPage(0, 5);
  res.json(watchlists);
};
// get all watchlists of one user
const findWatchlistByUser = async (req, res) => {
  const user = req.params.user;
  const watchlists = await watchlistDao.findWatchListsByUserId({
    user: user,
  });
  res.json(watchlists);
};

// find details in a watchlist by id
const findWatchlistDetailsById = async (req, res) => {
  const watchlist = await watchlistDao.findWatchlistById(req.params.wid);
  console.log("watchlist-cover-pos:", watchlist);
  const stockList = watchlist.stocks;
  const stocks = await stockDao.findStockByIds(stockList);
  watchlist.stocks = stocks;

  const user = await userDao.findUserById(watchlist.user);
  res.json({
    watchlist: watchlist,
    user: { name: user.userName, img: user.img },
  });
};

const findStocksByWatchlistId = async (req, res) => {
  const watchlist = await watchlistDao.findWatchlistById(req.params.wid);
  const stockList = watchlist.stocks;
  const stocks = await stockDao.findStockByIds(stockList);
  res.json(stocks);
};

const findWatchlistByName = async (req, res) => {
    const searchObj = req.body;
    // console.log("ffffffff: ", searchObj)
    const foundWatchlists = await watchlistDao.findWatchlistByName(searchObj.watchlistName);
    if (foundWatchlists) {
      res.json(foundWatchlists);
    } else {
      // res.sendStatus(404);
      res.json(null);
    }
  };

  const deleteWatchlist = async (req, res) => {
    const { _id } = req.body.watchlistObj;

    const wl = await watchlistDao.findWatchlistById(_id);
    const user = wl.user;

    await watchlistDao.deleteWatchlist(_id);
    // delete all records in stockWatchlist associate with the watchlist
    await stockWatchlistDao.deleteStockWatchlistById(_id);
    // delete all comments related to the watchlist
    await commentDao.deleteComment({ watchlist: _id });
  
    // find remaining likedStocks
    const data = await stockWatchlistDao.findStocksByUserId(user);
    const stockList = data.map((stock) => stock.ticker);
    res.json(stockList);
  };

  const findWatchlistsPagination = async (req, res) => {
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const watchlists = await watchlistDao.findLatestWatchlistsInPage(page, limit);
    res.json(watchlists);
  };

  const findDefaultWatchlistByUser = async (req, res) => {
    const uid = req.params.uid;
    console.log("uid", uid);
    const watchlists = await playlistDao.findPlayListsByUserId({
      user: uid,
      isDefault: true,
    });
    console.log("returned, ", watchlists[0]);
    res.json(watchlists[0]);
  };

  const updateWatchlist = async (req, res) => {
    const newWatchlist = req.body;
    const status = await watchlistDao.updatePlaylist(newWatchlist);
    res.json(status);
  };

  export default (app) => {
    app.get("/api/watchlists/admin/count", checkAdmin, countWatchlists);
    app.get("/api/watchlists/admin/lastpage", checkAdmin, findLatestWatchlists);
    app.get(
      "/api/watchlists/admin/pagination",
      checkAdmin,
      findWatchlistsPagination
    );
    app.delete("/api/watchlists/admin", checkAdmin, deleteWatchlist);
  
    app.get("/api/watchlists", findWatchlists);
    app.get("/api/watchlists/:user", findWatchlistByUser);
    app.get("/api/watchlists/details/:wid", findWatchlistDetailsById);
    app.get("/api/watchlists/stocks/:wid", findStocksByWatchlistId);
    // app.get("/api/watchlists/:loginUser/:watchlist", checkStocks);
    app.get("/api/watchlistsdefault/:uid", findDefaultWatchlistByUser);
    app.delete("/api/watchlists", deleteWatchlist);
    app.post("/api/watchlists", createWatchlist);
    app.put("/api/watchlists/:wid", updateWatchlist);
  
    app.post("/api/local-watchlists", findWatchlistByName);
  };