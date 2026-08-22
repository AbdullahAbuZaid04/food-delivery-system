const rateLimit = (windowMs = 15 * 60 * 1000, max = 10) => {
  const clients = new Map();

  const getRequests = (ip) => {
    const now = Date.now();
    const requests = (clients.get(ip) || []).filter(
      (time) => now - time < windowMs
    );
    clients.set(ip, requests);
    return requests;
  };

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const requests = getRequests(ip);

    if (requests.length >= max) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
      });
    }

    requests.push(Date.now());
    next();
  };
};

module.exports = rateLimit;
