import express from 'express';
import * as pageController from '../controllers/pageController';
// const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/dashboardPage', pageController.dashboardPage);
router.post('/quickSaveButtons', pageController.quickSaveButtons);
// router.post('/', userController.createUser);
// other user routes

export default router;
