import axios from "axios";
import dotenv from "dotenv";
import { Yahoo_API_BASE, TwelveData_API_BASE, TwelveData_API_KEY, Tiingo_API_URL, NEWS_API_URL } from "../constants/constants.js";
import moment from 'moment-timezone';
import portfolioController, { updatePortfolio } from "./portfolio-controller.js";
import { findPortfoliosByUserId } from "../dao/portfolio-dao.js";
import { updatePortfolioLocal } from "./portfolio-controller.js";

dotenv.config();

const fmpApiKey = process.env.FMP_API_KEY;

function getEpoch(date) {
    let time = new Date(date).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
    });
    let epoch = Date.parse(time);
    return epoch;
}

function getTimestamp(date) {
	var date = new Date(date);
	var arr = date.toISOString().split("T");
	let timestamp = arr[0] + " " + arr[1].split(".")[0];
	return timestamp;
}

function getMarketStatus(lastTimestamp) {
    var diff = (new Date() - new Date(lastTimestamp)) / 1000;
    let marketStatus = diff > 60 ? 0 : 1;
    return marketStatus;
}

// convert response data from api to the data for the chart.
const setChartData = (responseData) => {

    const timeStamps = responseData.chart.result[0].timestamp;
    const historicalCloseData = responseData.chart.result[0].indicators.quote[0].close;
    const res = { 'x': [], 'y': [] }
    timeStamps.forEach((timeStamp, index) => { res.x.push(new Date(timeStamp * 1000)); res.y.push(historicalCloseData[index]) });
    return res
}

// get the historical daily data of major index from api and send it to react.
const getDailyIndexBySymbol = async (req, res) => {
    const currentDate = new Date();
    const pastDate = new Date();
    pastDate.setFullYear(currentDate.getFullYear() - 1); // Set the date to one year ago

    const { symbol } = req.params;
    const apiURL = Yahoo_API_BASE + '/chart/%5E' + symbol
    const params = {
        period1: Math.floor(pastDate.getTime() / 1000),
        period2: Math.floor(currentDate.getTime() / 1000),
        interval: "1d"
    }

    axios.get(apiURL, { params }).then(response => {
        res.send(setChartData(response.data));
    }).catch(error => {
        console.error(`Error fetching ${symbol} daily data`, error)
    })
}

// get the latest index data and send it to the frontend.
const getLatestIndexBySymbol = async (req, res) => {
    const { symbol } = req.params;
    const apiURL = TwelveData_API_BASE + '/quote'
    const params = {
        source: 'docs',
        apikey: TwelveData_API_KEY,
        symbol: symbol
    }

    axios.get(apiURL, { params }).then(response => {
        res.send(response.data);
    }).catch(error => {
        console.error(`Error fetching ${symbol} latest data`, error)
    })
}

//const cache = new Map();

const getCloudStock = async (req, res) => {
    var { keyword } = req.params;
   // console.log(keyword, "debug getCloudStock")
    const API_URL = Tiingo_API_URL + '/tiingo/utilities/search?query=' + keyword + `&token=${process.env.Tiingo_API_KEY}`
    await axios.get(API_URL).then((response) => {
       
        res.send(response.data);
    }).catch((error) => {
        if (error.response) {
            
            console.log(`Autocomplete API failed. ${error.response.status}`);
            res.status(error.response.status).send("Too many requests")
        }else{
            res.status(500).send("The server breaks down");
        }
    });
}

const getNews = async (req, res) => {
    var {keyword} = req.params

    const newsUrl = NEWS_API_URL + `?apiKey=${process.env.NEWS_API_KEY}&q=` + keyword;
    var newsObject = []
    let maxLength = 20;
    let results = [];
    await axios.get(newsUrl).then((response) => {
        let maxArticleNum = Math.min(response.data.totalResults, maxLength);
        let articles = response.data.articles;
        for (let i = 0; i < maxArticleNum; i++) {
            if (articles[i].title && articles[i].urlToImage) {
                results.push(articles[i]);
            }
        }

        res.send(results);
    }).catch((error) => {
        console.error(`Error fetching latest news`, error)
    })


}

const getStockSummaryLocal = async (ticker) => {
    console.log("debug get stock summary local function very beggining", ticker)
  //  const { ticker } = req.params;
    let results;
    await axios
        .get(Tiingo_API_URL + `/iex/?tickers=${ticker}&token=${process.env.Tiingo_API_KEY}`)
        .then((response) => {
            let resp = response.data[0];
            console.log("debug get stock summary local function before", response)
            if (!resp) {
                return {};
            }
            console.log("debug get stock summary local function", response)
            let marketStatus = getMarketStatus(resp.timestamp);
            results = {
                high: resp.high,
                low: resp.low,
                open: resp.open,
                close: resp.prevClose,
                volume: resp.volume,
                mid: resp.mid ? resp.mid : "-",
                askPrice: resp.askPrice,
                askSize: resp.askSize,
                bidPrice: resp.bidPrice,
                bidSize: resp.bidSize,
                marketStatus: marketStatus,
                change: resp.last - resp.prevClose,
            };
            return results;
        })
        .catch((error) => {
            if (error.response) {
                console.log(`Summary API failed. ${error.response.status}`);
            }
            return { error: "Invalid ticker for Stock Summary." };
        });

        return results;
};

const getStockSummary = async (req, res) => {
    const { ticker } = req.params;
    axios
        .get(Tiingo_API_URL + `/iex/?tickers=${ticker}&token=${process.env.Tiingo_API_KEY}`)
        .then((response) => {
            let resp = response.data[0];
            if (!resp) {
                res.status(404).send('Not Found');
                return;
            }
            let marketStatus = getMarketStatus(resp.timestamp);
            let results = {
                high: resp.high,
                low: resp.low,
                open: resp.open,
                close: resp.prevClose,
                volume: resp.volume,
                mid: resp.mid ? resp.mid : "-",
                askPrice: resp.askPrice,
                askSize: resp.askSize,
                bidPrice: resp.bidPrice,
                bidSize: resp.bidSize,
                marketStatus: marketStatus,
                change: resp.last - resp.prevClose,
            };

            res.json(results);
        })
        .catch((error) => {
            if (error.response) {
                console.log(`Summary API failed. ${error.response.status}`);
            }
            res.status(500).send('Internal server error');
        });
};

const getStockDescription = (req, res) => {
    const { ticker } = req.params;
    axios
        .get(Tiingo_API_URL + `/tiingo/daily/${ticker}?token=${process.env.Tiingo_API_KEY}`)
        .then((response) => {
            let results = {
                startDate: response.data.startDate,
                name: response.data.name,
                description: response.data.description,
            };

            res.json(results);
        })
        .catch((error) => {
            if (error.response) {
                console.log(`Company details API failed. ${error.response.status}`);
            }
            res.status(404).send("Invalid ticker for Company details.");
        });
}

const getHistoricalStockData = (req, res) => {
    let date = moment().subtract(2, "year").format().split("T")[0];
    const { ticker } = req.params;
    let URL = Tiingo_API_URL + `/tiingo/daily/${ticker}/prices?startDate=${date}&resampleFreq=daily&token=${process.env.Tiingo_API_KEY}`;
    axios
        .get(URL)
        .then((response) => {
            const results = { historicalData: [], Volume: [] };
            response.data.map((result) => {
                let timestamp = getEpoch(result.date);
                results.historicalData.push([
                    timestamp,
                    result.open,
                    result.high,
                    result.low,
                    result.close,
                ]);
                results.Volume.push([timestamp, result.volume]);
            });
            res.json(results);
        })
        .catch((error) => {
            if (error.response) {
                console.log(
                    `Historical Chart Data API failed. ${error.response.status}`
                );
            }
            console.log("Error encountered during Last stock day chart data");
            res.status(500).send('Internal server error');
        });
}

const getStockHighlights = (req, res) => {
    const { ticker } = req.params;
    const tingoo_token = process.env.Tiingo_API_KEY;
    let DAILY_URL = Tiingo_API_URL + `/tiingo/daily/${ticker}?token=${tingoo_token}`;
    let DATA_URL = Tiingo_API_URL + `/iex/?tickers=${ticker}&token=${tingoo_token}`;
    const promises = [axios.get(DAILY_URL), axios.get(DATA_URL)]

    axios
        .all(promises)
        .then(
            axios.spread((...responses) => {
                const resp_One = responses[0].data;
                const resp_Two = responses[1].data[0];
               // console.log(resp_One, resp_Two, "debug")
                let change = resp_Two.last - resp_Two.prevClose;
                var currentTimestamp = moment()
                    .tz("America/Los_Angeles")
                    .format("YYYY-MM-DD HH:mm:ss");
                var lastTimestamp = getTimestamp(resp_Two.timestamp);
                let marketStatus = getMarketStatus(resp_Two.timestamp);
                
                let results = {
                    ticker: resp_One.ticker,
                    name: resp_One.name,
                    exchangeCode: resp_One.exchangeCode,
                    last: resp_Two.last,
                    change: change,
                    changePercent: (change * 100) / resp_Two.prevClose,
                    currentTimestamp: currentTimestamp,
                    marketStatus: marketStatus,
                    lastTimestamp: lastTimestamp,
                };
                res.json(results);
            })
        )
        .catch((errors) => {
            if (errors.response) {
                console.log(
                    `Stock Highlights API failed. Error Status:  ${errors.response.status}`
                );
                res.status(errors.response.status).send("Internal server error");
            } else {
                console.log(`Stock Highlights API failed`)
                res.status(501).send("Internal server error");
            }
        });
}

export const getLatestChartData = (req, res) => {
    const { ticker } = req.params;// Assuming ticker is received as a parameter

    let timestamp_URL = Tiingo_API_URL + `/iex/?tickers=${ticker}&token=${process.env.Tiingo_API_KEY}`;
    let timestampPromise = axios.get(timestamp_URL);
    let chartPromise = timestampPromise
        .then((response) => {
            return response.data[0].timestamp;
        })
        .then((timestamp) => {
            let stamp = timestamp.split("T")[0];
            return axios.get(
                `https://api.tiingo.com/iex/${ticker}/prices?startDate=${stamp}&resampleFreq=4min&token=${process.env.Tiingo_API_KEY}`
            );
        });

    axios
        .all([timestampPromise, chartPromise])
        .then(
            axios.spread((...responses) => {
                let results = {};

                const changeResponse = responses[0].data[0];
                results.change = changeResponse.last - changeResponse.prevClose;
                results.marketStatus = getMarketStatus(changeResponse.timestamp);

                const dataResponse = responses[1];
                results.chart = dataResponse.data.map((instance) => {
                    return [getEpoch(instance.date), instance.close];
                });

                res.status(200).json(results); // Sending JSON response
            })
        )
        .catch((errors) => {
            if (errors.response) {
                console.log(`Daily Chart Data failed. Error Status: ${errors.response.status}`);
                res.status(errors.response.status).send(`Error: ${errors.response.status}`);
            } else {
                res.status(400).json({ error: "Invalid ticker for Stock Daily data." });
            }
        });
};

export const updatePortfolioPriceByUser = async (req, res) => {
    // get the latest close price and update it:
    const { uid } = req.params;
    console.log("debug portfolio update before", uid);
    
    try {
      const response = await findPortfoliosByUserId(uid);
      const stocksInPortfolio = response;
    
      const updateOperations = stocksInPortfolio.map(async (portfolio) => {
        const data = await getStockSummaryLocal(portfolio.ticker);
       // console.log("debug get stock summary local results", portfolio);
        portfolio.currentPrice = data.close;
        portfolio.return = (data.close - portfolio.buyPrice) * portfolio.shares;
        await updatePortfolioLocal(portfolio);
      });
    
      await Promise.all(updateOperations);
      
      console.log("debug update end 001");
      res.status(200).send("Update successful");
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error updating portfolios");
    }
    
}



export default (app) => {
    //get major index historical daily data
    app.get("/api/remoteApi/index/historical-chart/:symbol", getDailyIndexBySymbol);

    // get current index data by symbol
    app.get("/api/remoteApi/index/quote/:symbol", getLatestIndexBySymbol);

    // get the search results by the keyword
    app.get("/api/remoteApi/cloud-stock/:keyword", getCloudStock);

    // get news by the keyword
    app.get("/api/remoteApi/news/:keyword", getNews);

    // get stock data summary
    app.get("/api/remoteApi/summary/:ticker", getStockSummary);

    // get latest stock data
    app.get("/api/remoteApi/summary/chart/:ticker", getLatestChartData);

    // get stock description
    app.get("/api/remoteApi/description/:ticker", getStockDescription);

    // get historical chart data
    app.get("/api/remoteApi/historical-chart/:ticker", getHistoricalStockData)

    // get stock highlights data
    app.get("/api/remoteApi/highlights/:ticker", getStockHighlights);

    // update stocks in portfolio
    app.put("/api/remoteApi/portfolio/:uid", updatePortfolioPriceByUser)


}