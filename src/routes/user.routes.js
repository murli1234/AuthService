import express from 'express';

import * as controller from '../controllers/user.controller.js';
import multer from 'multer';
import { authenticateUser } from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post('/sent-otp', controller.sendOtp)

userRouter.post('/verify-otp',controller.verifyOtp)

userRouter.post('/adminLogin',controller.adminLogin)

export default userRouter;
