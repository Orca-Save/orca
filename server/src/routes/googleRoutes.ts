import express from 'express';

import * as googleController from '../controllers/googleController';

const router = express.Router();

router.post('/webhook', googleController.webhookHandler);

export default router;
