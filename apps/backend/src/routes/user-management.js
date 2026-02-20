import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { UserManagementController } from '../controllers/UserManagementController.js'
import { BulkUserCreationController } from '../controllers/BulkUserCreationController.js'

const router = Router()

// Copropriétaire user management (syndic + admin)
router.get(
  '/coproprietaires',
  requireAuth(),
  UserManagementController.listCoproprietaireUsers
)
router.get(
  '/coproprietaires/:userId',
  requireAuth(),
  UserManagementController.getUserDetails
)

// Password management
router.post(
  '/reset-password',
  requireAuth(),
  UserManagementController.triggerPasswordReset
)
router.post(
  '/set-password',
  requireAuth(),
  UserManagementController.setPasswordDirectly
)

// Bulk user creation (syndic + admin)
router.get(
  '/bulk-preview/:coproprieteId',
  requireAuth(),
  BulkUserCreationController.getBulkCreationPreview
)
router.post(
  '/bulk-create/:coproprieteId',
  requireAuth(),
  BulkUserCreationController.bulkCreate
)

// Set initial password after OTP verification
router.post(
  '/set-initial-password',
  requireAuth(),
  BulkUserCreationController.setInitialPassword
)

export default router
