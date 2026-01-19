function verifyToken(req, res, next) {
  const token = req.headers["x-api-key"];
  if (token !== process.env.VOTE_API_KEY) {
    return res.status(403).json({ message: "Accès interdit" });
  }
  next();
}

module.exports = verifyToken;