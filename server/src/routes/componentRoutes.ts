import express from 'express';

import * as componentController from '../controllers/componentController';

const router = express.Router();

router.get('/goalCard', componentController.goalCard);
router.get('/subscription', componentController.subscription);

export default router;
