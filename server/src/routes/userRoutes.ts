import express from 'express';

import * as userController from '../controllers/userController';

const router = express.Router();

router.post('/saveOnboardingProfile', userController.saveOnboardingProfile);
router.post('/onboardUser', userController.onboardUser);

export default router;
