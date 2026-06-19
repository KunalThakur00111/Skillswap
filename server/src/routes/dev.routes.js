import { Router } from "express";
import { createTestUser } from "../controllers/dev.controller.js";

const router = Router();

router.post("/test-user", createTestUser);

export default router;