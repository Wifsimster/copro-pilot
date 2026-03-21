import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { requirePlan } from '../middleware/requirePlan.js'
import { UserManagementController } from '../controllers/UserManagementController.js'
import { BulkUserCreationController } from '../controllers/BulkUserCreationController.js'

const router = Router()

// All user management requires Entreprise plan
// (mass user creation, SSO management = enterprise feature)

// Copropriétaire user management (syndic + admin)
router.get(
  '/coproprietaires',
  requireAuth(),
  requirePlan('entreprise'),
  UserManagementController.listCoproprietaireUsers
)
router.get(
  '/coproprietaires/:userId',
  requireAuth(),
  requirePlan('entreprise'),
  UserManagementController.getUserDetails
)

// Password management
router.post(
  '/reset-password',
  requireAuth(),
  requirePlan('entreprise'),
  UserManagementController.triggerPasswordReset
)
router.post(
  '/set-password',
  requireAuth(),
  requirePlan('entreprise'),
  UserManagementController.setPasswordDirectly
)

// Bulk user creation (syndic + admin)
router.get(
  '/bulk-preview/:coproprieteId',
  requireAuth(),
  requirePlan('entreprise'),
  BulkUserCreationController.getBulkCreationPreview
)
router.post(
  '/bulk-create/:coproprieteId',
  requireAuth(),
  requirePlan('entreprise'),
  BulkUserCreationController.bulkCreate
)

// Set initial password after OTP verification
router.post(
  '/set-initial-password',
  requireAuth(),
  BulkUserCreationController.setInitialPassword
)

export default router
