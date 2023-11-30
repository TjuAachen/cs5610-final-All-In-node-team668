import * as stockDao from "../dao/stock-dao.js"
import {findStocks} from "../dao/stock-dao.js";
import * as stocklistDao from "../dao/stocklist-dao.js";


// find a stock object by id
const findStockByIds = async (req, res) => {
  const stockList = req.body.stocklist;
  const stocks = await stockDao.findStockByIds(stockList);
  res.json(stocks);
};

// create a song object
const createStock = async (req, res) => {
  const newStock = req.body;
  const insertedStock = await stockDao.createSong(newStock);
  res.json(insertedStock);
};


const findStockByName = async (req, res) => {
  const searchObj = req.body;
  // console.log("ffffffff: ", searchObj)
  const foundStocks = await stockDao.findStockByName(searchObj.name);
  console.log("foundStocks", foundStocks);
  if (foundStocks) {
    res.json(foundStocks);
  } else {
    res.json(null);
  }
};

const insertStockIfNotExist = async (req, res) => {
    const status = await stockDao.insertStockIfNotExist(req.body);
  const stock = await stockDao.findStockByTicker(req.body.ticker);
  res.json(stock);
};



export default (app) => {
  app.get("/api/stocks", findStockByIds);
  app.post("/api/stocks", createStock);
  app.put("/api/stocks", insertStockIfNotExist);

  app.post("/api/local-stocks", findStockByName);
};