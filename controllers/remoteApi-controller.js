import axios from "axios";
import dotenv from "dotenv";
import { Yahoo_API_BASE, TwelveData_API_BASE, TwelveData_API_KEY } from "../constants/constants.js";

dotenv.config();

const fmpApiKey = process.env.FMP_API_KEY;

// convert response data from api to the data for the chart.
const setChartData = (responseData) => {

    const timeStamps = responseData.chart.result[0].timestamp;
    const historicalCloseData = responseData.chart.result[0].indicators.quote[0].close;
    const res = {'x': [], 'y': []}
    timeStamps.forEach((timeStamp, index) => {res.x.push(new Date(timeStamp * 1000)); res.y.push(historicalCloseData[index])});
    return res
}

// get the historical daily data of major index from api and send it to react.
const getDailyIndexBySymbol = async (req, res) => {
    const currentDate = new Date();
    const pastDate = new Date();
    pastDate.setFullYear(currentDate.getFullYear() - 1); // Set the date to one year ago
  
    const { symbol } = req.params;
    const apiURL = Yahoo_API_BASE + '/chart/%5E' +symbol
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
    
    axios.get(apiURL, {params}).then(response => {
        res.send(response.data);
    }).catch(error => {
        console.error(`Error fetching ${symbol} latest data`, error)
    })
}

export default (app) => {
    //get major index historical daily data
    app.get("/api/remoteApi/index/historical-chart/:symbol", getDailyIndexBySymbol);

    // get current index data by symbol
    app.get("/api/remoteApi/index/quote/:symbol", getLatestIndexBySymbol);
}