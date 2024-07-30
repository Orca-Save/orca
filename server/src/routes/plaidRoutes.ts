import express from 'express';

import * as plaidController from '../controllers/plaidController';

const router = express.Router();

router.get('/linkedItems', plaidController.linkedItems);
router.get('/linkToken', plaidController.linkToken);
router.post('/exchangeToken', plaidController.exchangeToken);

export default router;
