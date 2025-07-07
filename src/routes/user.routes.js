import express from 'express';

import * as controller from '../controllers/user.controller.js';
import multer from 'multer';
import { authenticateUser } from '../middlewares/auth.js';

const userRouter = express.Router();

// const storage = multer.memoryStorage();
// const upload = multer({ storage }); 

// userRouter.post('/add-user',upload.fields([
//     { name: 'profile_image' },
//     { name: 'pan_card_image' },
//     { name: 'bike_image' },
//     { name: 'driving_license_image' }
//   ]), controller.addUser);


userRouter.post('/sent-otp', controller.sendOtp)

userRouter.post('/verify-otp',controller.verifyOtp)

//userRouter.get('/get-user', authenticateUser ,controller.getUser);

export default userRouter;
