import express from 'express';

import * as userController from '../controllers/userController';

const router = express.Router();

router.post('/saveOnboardingProfile', userController.saveOnboardingProfile);
router.post('/onboardUser', userController.onboardUser);
router.post('/updateTour', userController.updateUserTour);
router.post(
  '/setGoogleSubscriptionToken',
  userController.setGoogleSubscriptionToken
);
router.get('/cancelGoogleSub', userController.cancelGoogleSub);
router.post('/setGoalPinned', userController.goalPinned);
router.post('/setGoalTransferPinned', userController.goalTransferPinned);
router.get('/clearAllUserData', userController.clearAllUserData);

export default router;
