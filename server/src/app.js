const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimiter = require("./middlewares/rateLimiter");
const authRouter = require("./modules/auth/auth.routes");
const restaurantRouter = require("./modules/restaurant/restaurant.routes");
const categoryRouter = require("./modules/category/category.routes");
const mealRouter = require("./modules/meal/meal.routes");
const cartRouter = require("./modules/cart/cart.routes");
const orderRouter = require("./modules/order/order.routes");
const reviewRouter = require("./modules/review/review.routes");
const adminRouter = require("./modules/admin/admin.routes");
const dashboardRouter = require("./modules/dashboard/dashboard.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Middlewares
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Global rate limit: 100 requests per 15 minutes per IP
app.use("/api", rateLimiter(15 * 60 * 1000, 100));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/meals", mealRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRouter);
app.use("/api/dashboard", dashboardRouter);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
