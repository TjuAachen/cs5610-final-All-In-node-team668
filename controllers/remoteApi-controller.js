import axios from "axios";
import dotenv from "dotenv";
import { Yahoo_API_BASE, TwelveData_API_BASE, TwelveData_API_KEY, Tiingo_API_URL, NEWS_API_URL } from "../constants/constants.js";
import moment from 'moment-timezone';

dotenv.config();

const fmpApiKey = process.env.FMP_API_KEY;

function getEpoch(date) {
	let epoch = new Date(date).toLocaleString("en-US", {
		timeZone: "America/Los_Angeles",
	});
	return epoch - 0;
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
    const API_URL = Tiingo_API_URL + '/tiingo/utilities/search?query=' + keyword + `&token=${process.env.Tiingo_API_KEY}`
    await axios.get(API_URL).then((response) => {
        response.json().then((data) => {
            res.send(data);
        })
    }).catch((error) => {
        if (error.response) {
            console.log(`Autocomplete API failed. ${error.response.status}`);
        }
        return {
            error: "Error encountered during fetching Autocomplete suggestions",
        };
    });
}

const getNews = async (req, res) => {
    var keyword = req.query.keyword

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
            return { error: "Invalid ticker for Stock Summary." };
        });
};

const getStockDescription = (req, res) => {
    const { ticker } = req.params;
    axios
        .get(Tiingo_API_URL + `/tiingo/daily/${ticker}?token=${process.env.Tiingo_API_KEY}`)
        .then((response) => {
            let results = {
                startDate: response.data.startDate,
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
			results = { historicalData: [], Volume: [] };
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
		});
}

const getStockRecentData = (req, res) => {
    const {ticker} = req.params;
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
					`StockRecent API failed. Error Status:  ${errors.response.status}`
				);
			} else {
				console.log(`StockRecent API failed`)
			}
		});


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

    // get stock description
    app.get("/api/remoteApi/description/:ticker", getStockDescription);

    // get historical chart data
    app.get("/api/remoteApi/historical-chart/:ticker", getHistoricalStockData)

    // get stock recent data
    app.get("/api/remoteApi/recent/:ticker", getStockRecentData);


}