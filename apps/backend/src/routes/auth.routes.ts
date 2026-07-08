import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/register', (req, res, next) => authController.register(req, res, next));
router.post('/verify-otp', (req, res, next) => authController.verifyOTP(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

router.post('/complete-profile', authenticate, (req, res, next) => authController.completeProfile(req, res, next));
router.put('/update-profile', authenticate, (req, res, next) => authController.updateProfile(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.getCurrentUser(req, res, next));
router.post('/parse-resume', authenticate, upload.single('resume'), (req, res, next) => authController.parseResume(req, res, next));
router.post('/upload-avatar', authenticate, upload.single('avatar'), (req, res, next) => authController.uploadAvatar(req, res, next));

export default router;
