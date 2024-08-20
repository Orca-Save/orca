import express from 'express';

import * as stripeController from '../controllers/stripeController';

const router = express.Router();

router.get('/productPrice', stripeController.productPrice);
router.get('/createSubscription', stripeController.createSub);
router.post('/createCheckout', stripeController.createCheckout);
router.post('/updateSubscription', stripeController.updateSub);
router.post('/addSubscription', stripeController.addSubscription);

export default router;
