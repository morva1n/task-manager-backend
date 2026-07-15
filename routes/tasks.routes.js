import express from "express"
import * as tasks from "../controllers/tasks.controllers.js"
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();


router.get("/", authMiddleware,  tasks.getTasks);
router.post("/", authMiddleware, tasks.createTask)
router.patch("/:id", authMiddleware, tasks.changeTask)
router.patch("/:id/complete", authMiddleware, tasks.completeTask)
router.delete("/:id", authMiddleware, tasks.deleteTask)

export default router;