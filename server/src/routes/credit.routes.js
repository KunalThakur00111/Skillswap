import { Router } from "express";
import { getMyCreditTransactions } from "../controllers/credit.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/transactions", protect, getMyCreditTransactions);

export default router;