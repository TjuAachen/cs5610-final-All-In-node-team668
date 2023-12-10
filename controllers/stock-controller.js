import * as stockDao from "../dao/stock-dao.js";

// find a stock object by ticker
const findStockByTickers = async (req, res) => {
  const stockList = req.body.stocklist;
  const stocks = await stockDao.findStockByTickers(stockList);
  res.json(stocks);
};

// create a stock object
const createStock = async (req, res) => {
  const newStock = req.body;
  const insertedStock = await stockDao.createStock(newStock);
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
  const stock = await stockDao.findStocksByTicker(req.body.ticker);
  res.json(stock);
};



export default (app) => {
  app.get("/api/stocks", findStockByTickers);
  app.post("/api/stocks", createStock);
  app.put("/api/stocks", insertStockIfNotExist);

  app.post("/api/local-stocks", findStockByName);
};