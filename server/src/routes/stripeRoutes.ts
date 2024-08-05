import express from 'express';

import * as stripeController from '../controllers/stripeController';

const router = express.Router();

router.get('/productPrice', stripeController.productPrice);
router.get('createSubscription', stripeController.createSub);

export default router;
