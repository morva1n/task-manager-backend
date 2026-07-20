import express from "express"
import * as tasks from "../controllers/tasks.controllers.js"
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();


router.get("/", authMiddleware,  tasks.listTasks);
router.post("/", authMiddleware, tasks.addTask)
router.patch("/:id", authMiddleware, tasks.updateTask)
router.patch("/:id/complete", authMiddleware, tasks.markTaskAsComplete)
router.delete("/:id", authMiddleware, tasks.removeTask)

export default router;