
import express from 'express';
import { createPost, getFeed, toggleLike } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/', createPost);
router.get('/feed', getFeed);
router.post('/:id/like', toggleLike);

export default router;
