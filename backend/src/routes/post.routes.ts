// src/routes/post.routes.ts
import { Router } from 'express'
import {
  createPost, getFeed,
  toggleLike, addComment, getComments,
} from '../controllers/post.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.get('/feed',          authMiddleware, getFeed)
router.post('/',             authMiddleware, createPost)
router.post('/:id/like',     authMiddleware, toggleLike)
router.get('/:id/comments',  authMiddleware, getComments)
router.post('/:id/comments', authMiddleware, addComment)

export default router