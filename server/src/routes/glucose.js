import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { create, list, getById, update, remove } from "../controllers/glucoseController.js";

const router = Router();

router.use(authenticate);

router.post("/", create);
router.get("/", list);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
