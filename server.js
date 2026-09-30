import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import categoryRoutes from "./src/routes/category.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import favoriteRoutes from "./src/routes/favorite.routes.js";
import offerRoutes from "./src/routes/offer.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import reviewRoutes from "./src/routes/review.routes.js";
import messageRoutes from "./src/routes/message.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/reviews", reviewRoutes);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Syria Market API is running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
