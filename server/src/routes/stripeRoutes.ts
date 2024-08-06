import express from 'express';

import * as stripeController from '../controllers/stripeController';

const router = express.Router();

router.get('/productPrice', stripeController.productPrice);
router.post('/createSubscription', stripeController.createSub);
router.post('/updateSubscription', stripeController.updateSub);
router.post('/addSubscription', stripeController.addSubscription);

export default router;
