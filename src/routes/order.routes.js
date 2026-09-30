import express from "express";

import {
  getMyOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/my", authenticate, getMyOrders);

router.patch("/:orderId/status", authenticate, updateOrderStatus);

export default router;
