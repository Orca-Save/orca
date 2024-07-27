import express from 'express';
import * as goalController from '../controllers/goalController';
// const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.delete('/', goalController.deleteGoal);
router.get('/', goalController.listGoal);
// router.post('/', userController.createUser);
// other user routes

export default router;
