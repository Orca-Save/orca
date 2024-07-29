import express from 'express';
import * as pageController from '../controllers/pageController';
// const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/dashboardPage', pageController.dashboardPage);
router.get('/savingsPage', pageController.savingsPage);

export default router;
