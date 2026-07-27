import express from "express"

import * as tasks from "../controllers/tasks.controllers.js"
import { authMiddleware } from "../middlewares/auth.middlewares.js";

import { validationMiddleware } from "../middlewares/validation.middlewares.js";
import { taskSchema } from "../validation/task.schema.js";

const router = express.Router();


router.get("/", authMiddleware,  tasks.listTasks);
router.post("/",  authMiddleware, validationMiddleware(taskSchema),  tasks.addTask)
router.patch("/:id",  authMiddleware, validationMiddleware(taskSchema), tasks.updateTask)
router.patch("/:id/complete", authMiddleware, tasks.markTaskAsComplete)
router.delete("/:id", authMiddleware, tasks.removeTask)

export default router;