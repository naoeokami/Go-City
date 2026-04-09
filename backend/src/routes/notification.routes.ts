// src/routes/notification.routes.ts
import { Router }          from 'express'
import {
  getNotifications, markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller'
import { authMiddleware }   from '../middlewares/auth.middleware'

const router = Router()

router.get('/',           authMiddleware, getNotifications)
router.patch('/read-all', authMiddleware, markAllAsRead)
router.patch('/:id/read', authMiddleware, markAsRead)

export default router
