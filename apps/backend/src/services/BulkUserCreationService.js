import { randomBytes } from 'node:crypto'
import knexDatabase from '../config/knex-database.js'
import { getAuth } from '../config/auth.js'
import { sendEmail } from '../utils/email.js'
import {
  generateWelcomeEmail,
  generateAccountLinkedEmail,
} from '../utils/email-templates.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

function generateSecureTemporaryPassword() {
  return randomBytes(24).toString('base64url')
}

function assertAdminOrSyndic(user) {
  const role = user?.role?.toLowerCase()
  if (role !== 'admin' && role !== 'syndic') {
    const err = new Error('Accès refusé')
    err.status = 403
    throw err
  }
}

export class BulkUserCreationService {
  /**
   * Preview which copropriétaires would get accounts.
   */
  static async getPreview(requestingUser, coproprieteId) {
    assertAdminOrSyndic(requestingUser)

    const db = getDb()

    // Get copropriété name
    const copropriete = await db('coproprietes')
      .where('id', coproprieteId)
      .first()

    if (!copropriete) {
      const err = new Error('Copropriété non trouvée')
      err.status = 404
      throw err
    }

    // Get all copropriétaires linked to this copropriété via lots
    const coproprietaires = await db('coproprietaires')
      .select('coproprietaires.*')
      .join('lots', 'lots.coproprietaire_id', 'coproprietaires.id')
      .where('lots.copropriete_id', coproprieteId)
      .whereNull('coproprietaires.user_id')
      .groupBy('coproprietaires.id')
      .orderBy('coproprietaires.nom', 'asc')

    const toCreate = []
    const toLink = []
    const noEmail = []

    // Batch query: fetch all existing users by email in one query
    const emails = coproprietaires
      .map(c => c.email?.toLowerCase())
      .filter(Boolean)
    const existingUsers = emails.length
      ? await db('user').whereIn('email', emails)
      : []
    const emailMap = new Map(existingUsers.map(u => [u.email, u]))

    for (const copro of coproprietaires) {
      if (!copro.email) {
        noEmail.push({
          coproprietaireId: copro.id,
          nom: copro.nom,
          prenom: copro.prenom,
        })
        continue
      }

      // Look up from the pre-fetched map instead of querying
      const existingUser = emailMap.get(copro.email.toLowerCase())

      if (existingUser) {
        toLink.push({
          coproprietaireId: copro.id,
          nom: copro.nom,
          prenom: copro.prenom,
          email: copro.email,
          existingUserId: existingUser.id,
        })
      } else {
        toCreate.push({
          coproprietaireId: copro.id,
          nom: copro.nom,
          prenom: copro.prenom,
          email: copro.email,
        })
      }
    }

    return {
      copropriete: copropriete.nom,
      toCreate,
      toLink,
      noEmail,
    }
  }

  /**
   * Create user accounts for all copropriétaires in a copropriété
   * who have emails but no user_id (no account yet).
   */
  static async createUsersForCopropriete(
    requestingUser,
    coproprieteId
  ) {
    assertAdminOrSyndic(requestingUser)

    const db = getDb()
    const auth = getAuth()
    const baseURL = process.env.BASE_URL || 'http://localhost:3000'

    const copropriete = await db('coproprietes')
      .where('id', coproprieteId)
      .first()

    if (!copropriete) {
      const err = new Error('Copropriété non trouvée')
      err.status = 404
      throw err
    }

    // Get copropriétaires with email but no user account
    const coproprietaires = await db('coproprietaires')
      .select('coproprietaires.*')
      .join('lots', 'lots.coproprietaire_id', 'coproprietaires.id')
      .where('lots.copropriete_id', coproprieteId)
      .whereNotNull('coproprietaires.email')
      .whereNull('coproprietaires.user_id')
      .groupBy('coproprietaires.id')

    const results = {
      created: [],
      linked: [],
      errors: [],
    }

    // Batch query: fetch all existing users by email in one query
    const allEmails = coproprietaires
      .map(c => c.email?.toLowerCase())
      .filter(Boolean)
    const existingUsers = allEmails.length
      ? await db('user').whereIn('email', allEmails)
      : []
    const emailMap = new Map(
      existingUsers.map(u => [u.email, u])
    )

    for (const copro of coproprietaires) {
      try {
        const email = copro.email.toLowerCase()

        // Look up from the pre-fetched map instead of querying
        const existingUser = emailMap.get(email)

        if (existingUser) {
          // Auto-link: only link if existing user is a coproprietaire
          const existingRole = existingUser.role?.toLowerCase()
          if (
            existingRole === 'syndic' ||
            existingRole === 'admin'
          ) {
            results.errors.push({
              coproprietaireId: copro.id,
              email,
              error: `Le compte ${email} est un ${existingRole} — liaison manuelle requise`,
            })
            continue
          }

          await db('coproprietaires')
            .where('id', copro.id)
            .update({
              user_id: existingUser.id,
              updated_at: db.fn.now(),
            })

          // Send notification email
          sendEmail({
            to: email,
            subject: `CoproPilot - Ajout à la copropriété ${copropriete.nom}`,
            html: generateAccountLinkedEmail(
              existingUser.name || copro.prenom,
              copropriete.nom
            ),
          }).catch(err =>
            logger.error(
              `[BulkCreate] Failed to send link notification to ${email}: ${err.message}`
            )
          )

          results.linked.push({
            coproprietaireId: copro.id,
            email,
            userId: existingUser.id,
          })
          continue
        }

        // Create new user via Better Auth admin API
        const tempPassword = generateSecureTemporaryPassword()
        const userName = [copro.prenom, copro.nom]
          .filter(Boolean)
          .join(' ')

        const newUser = await auth.api.createUser({
          body: {
            email,
            password: tempPassword,
            name: userName,
            role: 'coproprietaire',
          },
        })

        const userId = newUser?.user?.id || newUser?.id
        if (!userId) {
          throw new Error('Création utilisateur échouée')
        }

        // Set mustChangePassword flag
        await db('user')
          .where('id', userId)
          .update({ mustChangePassword: true })

        // Link coproprietaire to user
        await db('coproprietaires')
          .where('id', copro.id)
          .update({
            user_id: userId,
            updated_at: db.fn.now(),
          })

        // Send welcome email
        sendEmail({
          to: email,
          subject:
            'CoproPilot - Votre accès extranet copropriétaire',
          html: generateWelcomeEmail(
            copro.prenom || userName,
            email,
            `${baseURL}/first-login`
          ),
        }).catch(err =>
          logger.error(
            `[BulkCreate] Failed to send welcome email to ${email}: ${err.message}`
          )
        )

        results.created.push({
          coproprietaireId: copro.id,
          email,
          userId,
        })

        logger.info(
          `[BulkCreate] Created user ${email} for copropriétaire ${copro.id}`
        )
      } catch (error) {
        logger.error(
          `[BulkCreate] Error for ${copro.email}: ${error.message}`
        )
        results.errors.push({
          coproprietaireId: copro.id,
          email: copro.email,
          error: error.message,
        })
      }
    }

    logger.info(
      `[BulkCreate] Copropriété ${coproprieteId}: ${results.created.length} created, ${results.linked.length} linked, ${results.errors.length} errors`
    )

    return results
  }

  /**
   * Set initial password after OTP verification.
   * User must have mustChangePassword flag set.
   */
  static async setInitialPassword(user, newPassword) {
    const db = getDb()
    const auth = getAuth()

    // Fetch the full user record to check mustChangePassword
    const fullUser = await db('user')
      .where('id', user.id)
      .first()

    if (!fullUser?.mustChangePassword) {
      const err = new Error(
        'Aucun changement de mot de passe requis'
      )
      err.status = 400
      throw err
    }

    const { validatePasswordOWASP } = await import(
      '../utils/password-validator.js'
    )
    const validation = validatePasswordOWASP(newPassword, {
      email: fullUser.email,
    })
    if (!validation.valid) {
      const err = new Error(validation.errors.join('. '))
      err.status = 400
      throw err
    }

    // Set the new password via admin API
    await auth.api.setUserPassword({
      body: {
        userId: user.id,
        newPassword,
      },
    })

    // Clear mustChangePassword and verify email
    await db('user')
      .where('id', user.id)
      .update({
        mustChangePassword: false,
        emailVerified: true,
        updatedAt: new Date().toISOString(),
      })

    logger.info(
      `[BulkCreate] Initial password set for user ${fullUser.email}`
    )

    return { message: 'Mot de passe défini avec succès' }
  }
}
