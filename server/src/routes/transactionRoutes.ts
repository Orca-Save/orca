import express from 'express';

import * as transactionController from '../controllers/transactionController';

const router = express.Router();

router.post('/', transactionController.save);

export default router;
