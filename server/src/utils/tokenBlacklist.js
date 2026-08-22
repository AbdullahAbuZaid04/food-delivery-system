const blacklistedTokens = new Map();

const blacklistToken = (token, expiresAt) => {
  blacklistedTokens.set(token, expiresAt);
};

const isBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

const cleanup = () => {
  const now = Date.now();
  for (const [token, expiresAt] of blacklistedTokens) {
    if (expiresAt < now) {
      blacklistedTokens.delete(token);
    }
  }
};

setInterval(cleanup, 60 * 60 * 1000);

module.exports = { blacklistToken, isBlacklisted };
