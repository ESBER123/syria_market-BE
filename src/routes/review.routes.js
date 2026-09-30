import express from "express";

import {
  createReview,
  getSellerReviews,
} from "../controllers/review.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/seller/:sellerId", authenticate, createReview);

router.get("/seller/:sellerId", getSellerReviews);

export default router;
