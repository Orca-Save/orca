import express from 'express';

import * as goalController from '../controllers/goalController';

const router = express.Router();

router.post('/deleteGoal', goalController.deleteGoal);
router.get('/', goalController.listGoal);
router.post('/createGoal', goalController.createGoal);
router.post('/updateGoal', goalController.updateGoalRecord);
router.post('/quickSave', goalController.quickSave);
router.post('/setGoalPinned', goalController.quickSave);
router.post('/quickGoalTransfer', goalController.quickGoalTransfer);
router.post('/updateGoalTransfer', goalController.updateTransfer);
router.post('/addGoalTransfer', goalController.addTransfer);
router.post('/deleteGoalTransfer', goalController.deleteTransfer);
router.post('/setGoalTransferPinned', goalController.quickSave);

export default router;
