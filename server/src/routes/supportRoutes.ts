import express from 'express';

import * as supportController from '../controllers/supportController';

const router = express.Router();

router.post('/submitTicket', supportController.submitTicket);

export default router;
