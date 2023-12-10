import stockModel from "./models/stock-model.js";
import watchlistModel from "./models/watchlist-model.js";

export async function findStocksByTicker(ticker) {
    return stockModel.find({ ticker: ticker });
}


export const findStocks = (page, limit) => {
    const skipIndex = (page - 1) * limit;
    return stockModel.find().skip(skipIndex).limit(limit);
};

export const insertStockIfNotExist = (stock) =>
  stockModel.updateOne(
    { ticker: stock.ticker },
    { $set: stock },
    { upsert: true }
  );
// export const findStockById = (stockId) => stockModel.find({ _id: stockId });
/*export const findStockByApiStockId = (apiStockId) =>
  stockModel.find({ apiStockId: apiStockId });*/
export const findStockByIds = (ids) => stockModel.find({ _id: { $in: ids } });
export const createStock = (stock) => stockModel.create(stock);
//export const findStockByStockName = (stockName) => stockModel.find({ stockName: { $in: stockName } });


export const findStockByName = (name) => {
    // Create a regex pattern for fuzzy matching
    const fuzzyRegex = new RegExp(name.split('').join('.*'), 'i');

    const stock = stockModel.find({
      stockName: {
        $regex: fuzzyRegex,
      },
    });

    return stock;
};
