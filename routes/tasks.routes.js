import express from "express"
import * as tasks from "../controllers/tasks.controllers.js"

const router = express.Router();


router.get("/", tasks.getTasks);
router.post("/", tasks.createTask)
router.patch("/:id", tasks.changeTask)
router.delete("/:id", tasks.deleteTask)

export default router;