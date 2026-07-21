const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRouter = require("./modules/auth/auth.routes");
const restaurantRouter = require("./modules/restaurant/restaurant.routes");
const categoryRouter = require("./modules/category/category.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/categories", categoryRouter);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
