import * as stockWatchlistDao from "../dao/stockWatchlist-dao.js";

const findWatchlistByUserStock = async (req, res) => {
  const { userId, ticker } = req.params;
  const stockWatchlistObj = await stockWatchlistDao.findWatchlistByUserStock(
    ticker,
    userId
  );
  res.json(stockWatchlistObj);
};

const createStockWatchlistOfUser = async (req, res) => {
  console.log("createStockWatchlist: ", req.body);
  const stockWatchlistObj = await stockWatchlistDao.createStockWatchlist(req.body);
  res.json(stockWatchlistObj);
};

const deleteStockWatchlist = async (req, res) => {
  const { userId, ticker } = req.params;
  const deletedObj = await stockWatchlistDao.deleteStockWatchlist(userId, ticker);
  res.json(deletedObj);
};

const findStocksByWatchlistId = async (req, res) => {
  console.log(req.params.pid);
  const stockWatchlistObj = await stockWatchlistDao.findStocksByWatchlistId(
    req.params.pid
  );
  res.json(stockWatchlistObj);
};

const findStockNumbersByUserId = async (req, res) => {
  const stockNumbers = await stockWatchlistDao.findStockNumbersByUserId(
    req.params.uid
  );
  console.log("stockNumbers, ", stockNumbers);
  res.json(stockNumbers);
};

const findCurrentUserStocks = async (req, res) => {
  // get user id from sessions
  let uid = null;
  if (req.session.currentUser) {
    uid = req.session.currentUser._id;
  }
  console.log("uid: ", uid);
  // search likedStocks of current user
  const data = await stockWatchlistDao.findStocksByUserId(uid);
  const stockList = data.map((stock) => stock.ticker);
  res.json(stockList);
};

const findLikedStocksByUser = async (req, res) => {
  console.log("req.params.uid", req.params.uid);
  const data = await stockWatchlistDao.findStocksByUserId(req.params.uid);
  res.json(data);
};

const updateStockWatchlist = async (req, res) => {
  const data = await stockWatchlistDao.updateStockWatchlist(req.body);
  console.log("data updateStockWatchlist", data);
  res.json(data);
};

export default (app) => {
  app.get("/api/stockWatchlist", findCurrentUserStocks);
  app.get("/api/stockWatchlist/user/:uid", findLikedStocksByUser);
  app.get("/api/stockWatchlist/stockNumber/:uid", findStockNumbersByUserId);
  app.get("/api/stockWatchlist/:userId/:ticker", findWatchlistByUserStock);
  app.get("/api/stockWatchlist/:pid", findStocksByWatchlistId);
  app.delete("/api/stockWatchlist/:userId/:ticker", deleteStockWatchlist);
  app.post("/api/stockWatchlist", createStockWatchlistOfUser);
  app.put("/api/stockWatchlist", updateStockWatchlist);
};