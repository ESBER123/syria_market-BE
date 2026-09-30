import express from "express";

import {
  sendMessage,
  getConversation,
  getMyConversations,
} from "../controllers/message.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, sendMessage);

router.get("/", authenticate, getMyConversations);

router.get("/:userId", authenticate, getConversation);

export default router;
