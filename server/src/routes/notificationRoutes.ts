import express from 'express';

import * as notificationController from '../controllers/notificationController';

const router = express.Router();

router.post('/sendHelloMessage', notificationController.sendHelloMessage);
router.post('/registerDeviceToken', notificationController.registerDeviceToken);

export default router;
