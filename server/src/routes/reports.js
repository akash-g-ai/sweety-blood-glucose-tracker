import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getSummary, getTrend } from "../controllers/reportController.js";

const router = Router();

router.use(authenticate);

router.get("/summary", getSummary);
router.get("/trend", getTrend);

export default router;