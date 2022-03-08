import express from "express";

const router = express.Router();

import {
  prices,
  createSubscription,
  subscriptionStatus,
  subscriptions,
  customerPortal,
  webhook,
} from "../controller/subs";
import { requireSignIn } from "../middlewares";

router.get("/prices", prices);
router.get("/webhook", webhook);
router.post("/create-subscription", requireSignIn, createSubscription);
router.get("/subscription-status", requireSignIn, subscriptionStatus);
router.get(
  "/subscriptions",
  express.json({ type: "application/json" }),
  requireSignIn,
  subscriptions
);
router.get("/customer-portal", requireSignIn, customerPortal);

module.exports = router;
