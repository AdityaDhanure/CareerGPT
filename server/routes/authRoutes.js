import express from 'express';
import { loginUser, registerUser, findUser, editUser, googleLogin } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { googleLoginSchema, loginSchema, registerSchema } from '../validations/userSchema.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/google-login',validate(googleLoginSchema), googleLogin);
router.put('/edit-profile', authMiddleware, editUser);
router.get('/me', authMiddleware, findUser);

export default router;
