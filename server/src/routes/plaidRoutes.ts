import express from 'express';

import * as plaidController from '../controllers/plaidController';

const router = express.Router();

router.get('/linkedItems', plaidController.linkedItems);
router.get('/linkToken', plaidController.linkToken);
router.get('/refreshItems', plaidController.refreshItems);
router.get('/syncUserItems', plaidController.syncUserItems);
router.get('/markAllUnread', plaidController.markAllTransactionsRead);
router.post('/exchangeToken', plaidController.exchangeToken);
router.post('/readTransaction', plaidController.readTransaction);
router.post('/unreadTransaction', plaidController.unreadTransaction);
router.post('/webhook', plaidController.webhook);
router.get('/listAllLinkedItems', plaidController.listAllLinkedItems);

export default router;
