import express from 'express';

import * as stripeController from '../controllers/stripeController';

const router = express.Router();

router.get('/productPrice', stripeController.productPrice);
router.get('/createSubscription', stripeController.createSub);
router.get('/createCheckout', stripeController.createCheckout);
router.get('/paymentIntent', stripeController.paymentIntent);
router.get('/webhook', stripeController.handleStripeWebhook);
router.post('/completeCheckout', stripeController.completeCheckout);
router.post('/updateSubscription', stripeController.updateSub);
router.post('/addSubscription', stripeController.addSubscription);

export default router;
