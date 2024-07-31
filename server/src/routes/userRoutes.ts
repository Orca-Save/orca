import express from 'express';

import * as userController from '../controllers/userController';

const router = express.Router();

router.post('/saveOnboardingProfile', userController.saveOnboardingProfile);
router.post('/onboardUser', userController.onboardUser);
router.post('/setGoalPinned', userController.goalPinned);
router.post('/setGoalTransferPinned', userController.goalTransferPinned);

export default router;
