const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || "1d";
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES_IN || "7d";

const generateToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: ACCESS_EXPIRES,
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    algorithm: "HS256",
    expiresIn: REFRESH_EXPIRES,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET, { algorithms: ["HS256"] });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET, { algorithms: ["HS256"] });
};

const getRefreshExpiresMs = () => {
  const val = REFRESH_EXPIRES;
  if (val.endsWith("d")) return parseInt(val) * 24 * 60 * 60 * 1000;
  if (val.endsWith("h")) return parseInt(val) * 60 * 60 * 1000;
  return 7 * 24 * 60 * 60 * 1000;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  getRefreshExpiresMs,
};
