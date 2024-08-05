import express from 'express';

import * as pageController from '../controllers/pageController';

const router = express.Router();

router.post('/dashboardPage', pageController.dashboardPage);
router.get('/savingsPage', pageController.savingsPage);
router.get('/transactionsPage', pageController.transactionsPage);
router.post('/transactionPage', pageController.transactionPage);
router.post('/goalTransferPage', pageController.goalTransferPage);
router.get('/onboardingPage', pageController.onboardingPage);
router.get('/reviewPage', pageController.reviewPage);
router.get('/userPage', pageController.userPage);
router.post('/editGoalPage', pageController.editGoalPage);

export default router;
