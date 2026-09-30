import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImages,
} from "../controllers/product.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
const router = express.Router();

router.post("/", authenticate, createProduct);
router.get("/:id", getProductById);
router.get("/", getProducts);
router.patch("/:id", authenticate, updateProduct);
router.delete("/:id", authenticate, deleteProduct);
router.post(
  "/:id/images",
  authenticate,
  upload.array("images", 8),
  uploadProductImages,
);
export default router;
