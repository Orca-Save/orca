import express from 'express';
import * as userController from '../controllers/userController';
// const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/onboardingProfileCount', userController.getOnboardingProfileCount);
// router.post('/', userController.createUser);
// other user routes

export default router;
