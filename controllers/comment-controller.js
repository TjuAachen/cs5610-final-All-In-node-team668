import * as commentDao from "../dao/comment-dao.js";
// import * as watchlistDao from "../dao/watchlist-dao.js";
import * as userDao from "../dao/user-dao.js";

// create a comment record
const createComment = async (req, res) => {
  const newComment = req.body;
  const { rating, watchlist, newAvgRating } = newComment;
  const insertedComment = await commentDao.createComment(newComment);
  await watchlistDao.updateWatchlist({ _id: watchlist, rating: newAvgRating });
  res.json(insertedComment);
};

// find the comments belongs to the user
// also get the watchlistname for displaying in Profile page
const findCommentsOfUser = async (req, res) => {
  const uid = req.params.uid;
  const comments = await commentDao.findCommentsByUserId(uid);
  const watchlistIds = comments.map((c) => c.watchlist);
  const watchlists = await watchlistDao.findPlaylistByIds(watchlistIds);
  const userIds = watchlists.map((p) => p.user);
  const authorsOfWatchlists = await userDao.findUserByIds(userIds);
  console.log("all watchlists: ", watchlists);
  console.log("all comments:", comments);
  //for each comment, find the watchlist details
  const commentsWithDetails = comments.map((c) => {
    const watchlistObj = watchlists.filter(
      (p) => p._id.toString() == c.watchlist.toString()
    )[0];
    console.log("pid from comment: ", c.watchlist.toString());
    console.log("watchlistObj in findComments", watchlistObj);
    const wName = watchlistObj.watchListName;
    const wCover = watchlistObj.img;
    const userObj = authorsOfWatchlists.filter(
      (u) => u._id.toString() == watchlistObj.user.toString()
    )[0];
    return {
      _id: c._id,
      watchlist: c.watchlist,
      user: c.user,
      content: c.content,
      watchListName: wName,
      rating: c.rating,
      userName: userObj.userName,
      userImg: wCover,
    };
  });
  res.json(commentsWithDetails);
};

// delete comment by commentId(_id in comment schema)
const deleteComments = async (req, res) => {
  const commentObj = req.body.commentObj;
  const watchlistObj = await watchlistDao.findWatchlistById(commentObj.watchlist);
  const number = await commentDao.findCommentNumberByWatchlist(
    commentObj.watchlist
  );
  if (number === 1) {
    watchlistObj.rating = 0;
  } else {
    watchlistObj.rating =
      ((watchlistObj.rating * number - commentObj.rating) * 1.0) / (number - 1);
  }
  await watchlistDao.updateWatchlist(watchlistObj);
  const status = await commentDao.deleteComment({ _id: commentObj._id });
  res.json(status);
};

const findCommentsByWatchlist = async (req, res) => {
  const wid = req.params.wid;
  const comments = await commentDao.findCommentsByWatchlist(wid);
  res.json(comments);
};

export default (app) => {
  app.post("/api/comment", createComment);
  app.get("/api/comment/:uid", findCommentsOfUser);
  app.get("/api/comment/watchlist/:wid", findCommentsByWatchlist);
  app.delete("/api/comment", deleteComments);
};