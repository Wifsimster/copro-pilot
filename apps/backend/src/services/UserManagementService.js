import knexDatabase from '../config/knex-database.js'
import { getAuth } from '../config/auth.js'
import { validatePasswordOWASP } from '../utils/password-validator.js'
import { sendEmail } from '../utils/email.js'
import { generateResetPasswordEmail } from '../utils/email-templates.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

function assertAdminOrSyndic(user) {
  const role = user?.role?.toLowerCase()
  if (role !== 'admin' && role !== 'syndic') {
    const err = new Error('Accès refusé')
    err.status = 403
    throw err
  }
  return role
}

function assertCanManageUser(requestingRole, targetUser) {
  if (requestingRole === 'admin') return
  if (requestingRole === 'syndic') {
    if (targetUser.role !== 'coproprietaire') {
      const err = new Error(
        'Les syndics ne peuvent gérer que les copropriétaires'
      )
      err.status = 403
      throw err
    }
  }
}

export class UserManagementService {
  static async listCoproprietaireUsers(requestingUser) {
    assertAdminOrSyndic(requestingUser)

    const db = getDb()
    const users = await db('user')
      .select(
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'user.emailVerified',
        'user.banned',
        'user.createdAt'
      )
      .where('user.role', 'coproprietaire')
      .orderBy('user.name', 'asc')

    // Attach linked copropriétés for each user
    for (const u of users) {
      const coproprietes = await db('coproprietaires')
        .select(
          'coproprietes.id',
          'coproprietes.nom'
        )
        .join('lots', 'lots.coproprietaire_id', 'coproprietaires.id')
        .join('coproprietes', 'lots.copropriete_id', 'coproprietes.id')
        .where('coproprietaires.user_id', u.id)
        .groupBy('coproprietes.id')
        .orderBy('coproprietes.nom', 'asc')
      u.coproprietes = coproprietes
    }

    return users
  }

  static async getUserDetails(requestingUser, targetUserId) {
    const requestingRole = assertAdminOrSyndic(requestingUser)

    const db = getDb()
    const targetUser = await db('user')
      .where('id', targetUserId)
      .first()

    if (!targetUser) {
      const err = new Error('Utilisateur non trouvé')
      err.status = 404
      throw err
    }

    assertCanManageUser(requestingRole, targetUser)

    const coproprietaires = await db('coproprietaires')
      .where('user_id', targetUserId)

    const coproprietes = await db('coproprietaires')
      .select('coproprietes.id', 'coproprietes.nom')
      .join('lots', 'lots.coproprietaire_id', 'coproprietaires.id')
      .join('coproprietes', 'lots.copropriete_id', 'coproprietes.id')
      .where('coproprietaires.user_id', targetUserId)
      .groupBy('coproprietes.id')

    return {
      ...targetUser,
      coproprietaires,
      coproprietes,
    }
  }

  static async triggerPasswordReset(requestingUser, targetUserId) {
    const requestingRole = assertAdminOrSyndic(requestingUser)

    const db = getDb()
    const targetUser = await db('user')
      .where('id', targetUserId)
      .first()

    if (!targetUser) {
      const err = new Error('Utilisateur non trouvé')
      err.status = 404
      throw err
    }

    assertCanManageUser(requestingRole, targetUser)

    // Use Better Auth API to generate reset token and send email
    const auth = getAuth()
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'

    try {
      await auth.api.forgetPassword({
        body: {
          email: targetUser.email,
          redirectTo: `${baseURL}/reset-password`,
        },
      })
    } catch (error) {
      logger.error(
        `[UserManagement] Failed to trigger password reset for ${targetUser.email}: ${error.message}`
      )
      throw error
    }

    logger.info(
      `[UserManagement] Password reset triggered for ${targetUser.email} by ${requestingUser.email}`
    )

    return { message: 'Email de réinitialisation envoyé' }
  }

  static async setPasswordDirectly(
    requestingUser,
    targetUserId,
    newPassword
  ) {
    const role = requestingUser?.role?.toLowerCase()
    if (role !== 'admin') {
      const err = new Error('Accès réservé aux administrateurs')
      err.status = 403
      throw err
    }

    const validation = validatePasswordOWASP(newPassword)
    if (!validation.valid) {
      const err = new Error(validation.errors.join('. '))
      err.status = 400
      throw err
    }

    const db = getDb()
    const targetUser = await db('user')
      .where('id', targetUserId)
      .first()

    if (!targetUser) {
      const err = new Error('Utilisateur non trouvé')
      err.status = 404
      throw err
    }

    const auth = getAuth()
    await auth.api.setUserPassword({
      body: {
        userId: targetUserId,
        newPassword,
      },
    })

    logger.info(
      `[UserManagement] Password set directly for ${targetUser.email} by admin ${requestingUser.email}`
    )

    return { message: 'Mot de passe modifié' }
  }
}
