import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { examRepository } from '../repositories/ExamRepository';
import { eligibilityService } from '../services/EligibilityService';
import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../middleware/error';

export class ExamController {
  async getExams(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, department, qualification, minAge, maxAge, search } = req.query;

      const exams = await examRepository.queryExams({
        status: status as string,
        department: department as string,
        qualification: qualification as string,
        minAge: minAge ? parseInt(minAge as string, 10) : undefined,
        maxAge: maxAge ? parseInt(maxAge as string, 10) : undefined,
        search: search as string,
      });

      res.status(200).json({
        status: 'success',
        results: exams.length,
        data: {
          exams,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getExamById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const exam = await examRepository.findById(id);

      if (!exam) {
        throw new AppError(404, 'Exam not found');
      }

      res.status(200).json({
        status: 'success',
        data: {
          exam,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyEligibility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const user = await userRepository.findById(req.user.id);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      if (!user.profileCompleted || !user.profile) {
        res.status(200).json({
          status: 'success',
          code: 'PROFILE_INCOMPLETE',
          message: 'Complete your profile details to evaluate eligibility matching.',
          data: {
            eligibilityMatches: [],
          },
        });
        return;
      }

      const matches = await eligibilityService.evaluateUserEligibility(user.profile);

      res.status(200).json({
        status: 'success',
        data: {
          eligibilityMatches: matches,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const examController = new ExamController();
