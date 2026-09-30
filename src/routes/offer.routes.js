import express from "express";

import {
  createOffer,
  acceptOffer,
  rejectOffer,
  counterOffer,
  acceptCounterOffer,
  getMyOffers,
  getOfferById,
} from "../controllers/offer.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/product/:productId", authenticate, createOffer);
router.post("/:offerId/accept", authenticate, acceptOffer);
router.post("/:offerId/accept-counter", authenticate, acceptCounterOffer);
router.post("/:offerId/reject", authenticate, rejectOffer);
router.post("/:offerId/counter", authenticate, counterOffer);
router.get("/my", authenticate, getMyOffers);
router.get("/:offerId", authenticate, getOfferById);
export default router;
