import express from 'express';

import * as fileController from '../controllers/fileController';

const router = express.Router();

router.post('/image', fileController.saveImage);

export default router;
