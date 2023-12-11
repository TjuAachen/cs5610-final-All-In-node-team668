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
   // console.log("new portfolio", newPortfolio);
    const insertedPortfolio = await portfolioDao.createPortfolio(newPortfolio);
    res.json(insertedPortfolio);
  };


export const deletePortfolioByPortfolioId = async (req, res) => {
    const {pid} = req.params;
  //  console.log("delete portfolio by id before")
    await portfolioDao.deletePortfolioByPortfolioId(pid)
    res.status(200).send("delete successfully");
   // console.log("delete portfolio by id after")

};
export const updatePortfolio = async (req, res) => {
    const newPortfolio = req.body;
    await portfolioDao.updatePortfolio(newPortfolio)
    res.status(200).send("update successfully");
}

export const updatePortfolioLocal = async (newPortfolio) => {
    await portfolioDao.updatePortfolio(newPortfolio);
    console.log("update portfolio local end")
}

export default (app) => {
    app.get("/api/portfolio", findPortfolio);
    app.post("/api/portfolio", createPortfolio);
    app.delete("/api/portfolio/:pid", deletePortfolioByPortfolioId);
    app.put("/api/portfolio", updatePortfolio);
}