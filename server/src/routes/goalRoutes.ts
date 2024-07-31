import express from 'express';
import * as goalController from '../controllers/goalController';
const router = express.Router();

router.delete('/', goalController.deleteGoal);
router.get('/', goalController.listGoal);
router.post('/quickSave', goalController.quickSave);
router.post('/setGoalPinned', goalController.quickSave);
router.post('/setGoalTransferPinned', goalController.quickSave);

export default router;
