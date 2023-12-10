import * as watchlistDao from "../dao/watchlist-dao.js"
import * as stockDao from "../dao/stock-dao.js";
import * as userDao from "../dao/user-dao.js";
import * as stockWatchlistDao from "../dao/stockWatchlist-dao.js";
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
  const watchlists = await watchlistDao.findPlayListsByUserId({
    user: user,
  });
  res.json(watchlists);
};

// find details in a watchlist by id
const findWatchlistDetailsById = async (req, res) => {
  const watchlist = await watchlistDao.findWatchlistById(req.params.pid);
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
  const watchlist = await watchlistDao.findWatchlistById(req.params.pid);
  const stockList = watchlist.stocks;
  const stocks = await stockDao.findStockByIds(stockList);
  res.json(stocks);
};

const findWatchlistByName = async (req, res) => {
    const searchObj = req.body;
    // console.log("ffffffff: ", searchObj)
    const foundPlaylists = await watchlistDao.findWatchlistByName(searchObj.watchlistName);
    if (foundWatchlists) {
      res.json(foundWatchlists);
    } else {
      // res.sendStatus(404);
      res.json(null);
    }
  };