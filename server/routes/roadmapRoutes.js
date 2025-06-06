import  express from 'express';
import { deleteRoadmap, generateRoadmap, getRoadmaps, updateRoadmap, exportRoadmapPDF } from '../controllers/roadmapController.js';
import authMiddleware from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { roadmapGenerateSchema, roadmapUpdateSchema } from '../validations/roadmapSchema.js';

const router = express.Router();

router.get('/', authMiddleware, getRoadmaps);
router.post('/generate', authMiddleware, validate(roadmapGenerateSchema), generateRoadmap);
router.put('/update-title/:id', authMiddleware, validate(roadmapUpdateSchema), updateRoadmap);
router.delete('/delete/:id', authMiddleware, deleteRoadmap);

router.post('/export', authMiddleware, exportRoadmapPDF);

export default router;
