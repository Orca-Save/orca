import express from 'express';

import * as pageController from '../controllers/pageController';

const router = express.Router();

router.post('/dashboardPage', pageController.dashboardPage);
router.get('/savingsPage', pageController.savingsPage);
router.get('/transactionsPage', pageController.transactionsPage);
router.post('/transactionPage', pageController.transactionPage);
router.get('/onboardingPage', pageController.onboardingPage);

export default router;
