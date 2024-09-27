import express from 'express';

import * as appleController from '../controllers/appleController';

const router = express.Router();

router.get('/verifySubscription', appleController.verifySubscription);

export default router;