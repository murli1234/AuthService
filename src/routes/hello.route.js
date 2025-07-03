import express from "express";
import { helloMiddleware } from "../middlewares/hello.middleware.js";
import { helloController } from "../controllers/hello.controller.js";

const router = express.Router();

// GET /api/hello - Example route with middleware
router.get("/", helloMiddleware, helloController);

export default router;
