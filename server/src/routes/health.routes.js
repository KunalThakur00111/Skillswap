import { Router } from "express";
import { getHealth, nukeDatabase } from "../controllers/health.controller.js";

const router = Router();

router.get("/", getHealth);
router.get("/nuke-db", nukeDatabase);

export default router;