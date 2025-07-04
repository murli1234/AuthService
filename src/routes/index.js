import express from "express";
import helloRouter from "./hello.route.js";
import userRouter from "./user.routes.js";
// Import other route modules here as they are created
// import userRouter from "./user.route.js";

const router = express.Router();

// Mount the routers
router.use("/hello", helloRouter);
router.use("/users", userRouter);


export default router;
