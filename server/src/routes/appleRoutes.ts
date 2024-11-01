import express from 'express';

import * as appleController from '../controllers/appleController';

const router = express.Router();

router.post('/verifySubscription', appleController.verifySubscription);
router.post('/webhook', appleController.appleWebhook);
export default router;
