require("dotenv").config();

const express = require(`express`);
const mongoose = require(`mongoose`);
const cookieParser = require(`cookie-parser`);
const cors = require(`cors`);
const authRouter = require("./routes/auth/auth-routes");
const adminProductRouter = require("./routes/admin/products-routes");
const adminUserRouter = require("./routes/admin/user-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const adminAnalyticsRouter = require("./routes/admin/order-analytics");
const adminFeatureRouter = require("./routes/common/feature-rotes");
const productRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const {
  authMiddleware,
  isAdminMiddleware,
} = require("./controllers/auth/auth-controller");
const app = express();

// Create a database connection -> u can also
// create a seprate file for this and then import/use that file here

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" Mongodb connection"))
  .catch((err) => console.log("Error : ", err.message));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: [`GET`, `POST`, `DELETE`, `PUT`],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use(
  "/api/admin/products",
  authMiddleware,
  isAdminMiddleware,
  adminProductRouter,
);
app.use(
  "/api/admin/order",
  authMiddleware,
  isAdminMiddleware,
  adminOrderRouter,
);
app.use(
  "/api/admin/analytics",
  authMiddleware,
  isAdminMiddleware,
  adminAnalyticsRouter,
);
app.use("/api/admin/user", authMiddleware, isAdminMiddleware, adminUserRouter);
app.use("/api/common/features-image", authMiddleware, adminFeatureRouter);
app.use("/api/shop/products", authMiddleware, productRouter);
app.use("/api/shop/cart", authMiddleware, shopCartRouter);
app.use("/api/shop/address", authMiddleware, shopAddressRouter);
app.use("/api/shop/order", authMiddleware, shopOrderRouter);
app.use(
  "/api/shop/search",
  authMiddleware,

  shopSearchRouter,
);
app.use("/api/shop/review", authMiddleware, shopReviewRouter);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server is now rounning on port 5000");
});
