import * as portfolioDao from "../dao/portfolio-dao.js";

const findPortfolio = async (req, res) => {
    let uid = null;
    // logged in
    if (req.session["currentUser"] !== undefined) {
        uid = req.session.currentUser._id;
    }
    // console.log("homecontroller:", req.session.id);
    // console.log(req.session["currentUser"]);
    const portfolios = await portfolioDao.findPortfoliosByUserId(uid);
    res.json(portfolios);
}

const createPortfolio = async (req, res) => {
    const newPortfolio = req.body;
    //console.log("newWatchlist in createWatchlist", newWatchlist);
    const insertedPortfolio = await portfolioDao.createPortfolio(newPortfolio);
    res.json(insertedPortfolio);
  };


export const deletePortfolioByUserStock = async (req, res) => {
    const {uid, ticker} = req.params;
    portfolioDao.deletePortfolioByUserStock(uid, ticker)
};
export const updatePortfolio = async (req, res) => {
    const newPortfolio = req.body;
    await portfolioDao.updatePortfolio(newPortfolio)
}

export default (app) => {
    app.get("/api/portfolio", findPortfolio);
    app.post("/api/portfolio", createPortfolio);
    app.delete("/api/portfolio", deletePortfolioByUserStock);
    app.put("/api/portfolio", updatePortfolio);
}