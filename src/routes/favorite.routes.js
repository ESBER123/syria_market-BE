import express from "express";

import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../controllers/favorite.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getFavorites);

router.post("/:id", authenticate, addFavorite);

router.delete("/:id", authenticate, removeFavorite);

export default router;
