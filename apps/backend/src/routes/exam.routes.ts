import { Router } from 'express';
import { examController } from '../controllers/ExamController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', (req, res, next) => examController.getExams(req, res, next));
router.get('/eligibility', authenticate, (req, res, next) => examController.getMyEligibility(req, res, next));
router.get('/:id', (req, res, next) => examController.getExamById(req, res, next));

export default router;
