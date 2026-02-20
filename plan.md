# Authentication Enhancement Plan — CoproPilot

## Overview

Enhance Better Auth authentication with: password reset, syndic user management, OTP for first authentication, existing account auto-linking, email verification, and OWASP password compliance.

**Dependencies are installed first, then 6 phases in order.**

---

## Phase 0: Dependencies & Infrastructure

### 0.1 Install nodemailer
```bash
npm install nodemailer --workspace=@copro-pilot/backend
```

### 0.2 New file: `apps/backend/src/utils/email.js`
Email transport utility:
- **Dev mode**: Log email content to console (subject, to, body preview)
- **Production**: Send via SMTP using `nodemailer` with env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`)
- Export `sendEmail({ to, subject, html, text })`

### 0.3 New file: `apps/backend/src/utils/email-templates.js`
HTML email templates (simple responsive design with CoproPilot branding):
- `generateResetPasswordEmail(name, url)` — Password reset link
- `generateVerificationEmail(name, url)` — Email verification link
- `generateOTPEmail(name, otp)` — 6-digit OTP code
- `generateWelcomeEmail(name, email, loginUrl)` — Welcome + first-login link for bulk-created accounts
- `generateAccountLinkedEmail(name, coproprieteNom)` — Notification that a copropriété was linked to existing account

### 0.4 Add env vars to `apps/backend/.env.example`
```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@copropilot.fr
```

---

## Phase 1: OWASP Password Compliance

**Rationale:** Foundation for all password-related features. Must be done first.

### OWASP ASVS 2.1 Rules
- Min 12 characters (up from 8)
- Max 128 characters
- Block top 10,000 common passwords (NCSC/HIBP list)
- Block passwords containing user email local part
- Allow all Unicode characters
- No composition rules (no forced uppercase/digit/symbol — OWASP moved away from this)

### 1.1 New file: `apps/backend/src/utils/password-validator.js`
- Load common passwords from embedded Set (top 10,000)
- Export `validatePasswordOWASP(password, context)` → `{ valid, errors[] }`
- Checks: length 12-128, not in blocklist, doesn't contain email local part

### 1.2 New file: `apps/backend/src/data/common-passwords.json`
JSON array of top 10,000 most common passwords (from SecLists/HIBP)

### 1.3 Modify: `apps/backend/src/config/auth.js`
Update `emailAndPassword` block:
```javascript
emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
}
```

### 1.4 New file: `apps/frontend/src/utils/passwordValidation.ts`
Client-side OWASP validation:
```typescript
export interface PasswordValidation {
  valid: boolean
  errors: string[]
  strength: { score: number; label: string; color: string }
}
export function validatePassword(password: string, context?: { email?: string }): PasswordValidation
```
- Include small client-side blocklist (~1,000 most common passwords)
- Scoring: length + diversity + not-in-blocklist

### 1.5 Modify: `apps/frontend/src/pages/LoginPage.tsx`
- Update `PasswordStrength` component to use new `validatePassword` utility
- Change `minLength` from 8 to 12 on signup password inputs (lines 188, 418, 429)
- Update error message: "Le mot de passe doit contenir au moins 12 caractères"
- Show OWASP validation errors below password field during signup

### 1.6 Extract reusable components: `apps/frontend/src/components/auth/PasswordInput.tsx`
Extract `PasswordInput` and `PasswordStrength` from `LoginPage.tsx` (lines 66-145) into reusable components. LoginPage imports them from here. These will be reused by ResetPasswordPage and FirstLoginPage.

---

## Phase 2: Password Reset / Forgot Password

**Uses Better Auth built-in `sendResetPassword` and `resetPassword` — no plugin needed.**

### 2.1 Modify: `apps/backend/src/config/auth.js`
Add to `emailAndPassword` block:
```javascript
emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    sendResetPassword: async ({ user, url }) => {
        const { sendEmail } = await import('../utils/email.js')
        const { generateResetPasswordEmail } = await import('../utils/email-templates.js')
        await sendEmail({
            to: user.email,
            subject: 'CoproPilot - Réinitialisation de votre mot de passe',
            html: generateResetPasswordEmail(user.name, url),
        })
    },
}
```

### 2.2 New file: `apps/frontend/src/pages/ForgotPasswordPage.tsx`
Public page with:
- Email input form
- Submit calls `authClient.forgetPassword({ email, redirectTo: '/#/reset-password' })`
- Success message (always same regardless of email existence — prevents enumeration)
- Link back to login

### 2.3 New file: `apps/frontend/src/pages/ResetPasswordPage.tsx`
Public page that:
- Extracts `token` from URL query params
- New password + confirm password form
- Uses `PasswordInput` + `PasswordStrength` from Phase 1
- Uses `validatePassword()` for client-side OWASP check
- Submit calls `authClient.resetPassword({ newPassword, token })`
- On success: redirect to login with success toast

### 2.4 Modify: `apps/frontend/src/pages/LoginPage.tsx`
Add "Mot de passe oublié ?" link after the password field in sign-in form (after line 306):
```tsx
<a href="/#/forgot-password" className="text-xs text-primary hover:underline">
  Mot de passe oublié ?
</a>
```

### 2.5 Modify: `apps/frontend/src/routes/index.tsx`
Add public routes:
```tsx
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))

{ path: '/forgot-password', element: <PublicRoute><ForgotPasswordPage /></PublicRoute> }
{ path: '/reset-password', element: <ResetPasswordPage /> } // Not PublicRoute — accessible with token
```

---

## Phase 3: Email Verification for Copropriétaires

**Uses Better Auth built-in `emailVerification` (top-level config block).**

### 3.1 Modify: `apps/backend/src/config/auth.js`
Add top-level `emailVerification` block:
```javascript
emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
        const { sendEmail } = await import('../utils/email.js')
        const { generateVerificationEmail } = await import('../utils/email-templates.js')
        await sendEmail({
            to: user.email,
            subject: 'CoproPilot - Vérifiez votre adresse email',
            html: generateVerificationEmail(user.name, url),
        })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
}
```

Add `requireEmailVerification: true` inside `emailAndPassword` block:
```javascript
emailAndPassword: {
    ...existing,
    requireEmailVerification: true,
}
```

**Note:** When creating users via admin API (Phase 4/5), we explicitly set `emailVerified: true` for syndic/admin users, and leave it `false` for copropriétaire users who go through OTP flow.

### 3.2 New file: `apps/frontend/src/pages/VerifyEmailPage.tsx`
Page displayed when user clicks verification link from email:
- Extracts `token` from URL params
- Calls `authClient.verifyEmail({ token })` on mount
- Shows success/error state
- On success: redirect to login or dashboard

### 3.3 Modify: `apps/frontend/src/store/authStore.ts`
Update `signUp` function:
- After successful signup, show message: "Un email de vérification a été envoyé à votre adresse."
- Do NOT redirect to `/#/` — stay on login page with verification pending message
- Add `emailVerificationPending` state flag

### 3.4 Modify: `apps/frontend/src/routes/index.tsx`
Add route:
```tsx
{ path: '/verify-email', element: <VerifyEmailPage /> }
```

### 3.5 Modify: `apps/frontend/src/pages/LoginPage.tsx`
Update signup success message (line 377-385) to show email verification instructions instead of "Vous êtes maintenant connecté".

---

## Phase 4: Syndic User Management & Password Reset for Copropriétaires

**Uses Better Auth admin plugin server-side API (`auth.api.*`). Custom service layer controls what syndics can do (syndics are NOT full Better Auth admins).**

### 4.1 New file: `apps/backend/src/services/UserManagementService.js`
Service class with methods:
- `listCoproprietaireUsers(requestingUser)` — Only admin/syndic. Query `user` table where `role = 'coproprietaire'`, join with `coproprietaires` for extra data.
- `triggerPasswordReset(requestingUser, targetUserId)` — Syndic can only reset for copropriétaire users. Sends reset password email.
- `setPasswordDirectly(requestingUser, targetUserId, newPassword)` — Admin-only. Uses `auth.api.setUserPassword`. Validates OWASP.
- `getUserDetails(requestingUser, targetUserId)` — Admin/syndic. Returns user + linked copropriétaire records + copropriétés.

Authorization logic:
- Admin: can manage all users
- Syndic: can only manage users with `role = 'coproprietaire'`
- Others: rejected with 403

### 4.2 New file: `apps/backend/src/controllers/UserManagementController.js`
Standard controller pattern:
- `listCoproprietaireUsers(req, res)` — GET
- `triggerPasswordReset(req, res)` — POST, body: `{ userId }`
- `setPasswordDirectly(req, res)` — POST, body: `{ userId, newPassword }`
- `getUserDetails(req, res)` — GET /:userId

### 4.3 New file: `apps/backend/src/routes/user-management.js`
```javascript
router.get('/coproprietaires', requireAuth(), controller.listCoproprietaireUsers)
router.get('/coproprietaires/:userId', requireAuth(), controller.getUserDetails)
router.post('/reset-password', requireAuth(), controller.triggerPasswordReset)
router.post('/set-password', requireAuth(), controller.setPasswordDirectly)
```

### 4.4 Modify: `apps/backend/src/routes/index.js`
Register route:
```javascript
import userManagementRoutes from './user-management.js'
router.use('/user-management', userManagementRoutes)
```

### 4.5 New file: `apps/frontend/src/api/userManagement.ts`
Typed fetch functions wrapping the new endpoints.

### 4.6 New file: `apps/frontend/src/hooks/useUserManagement.ts`
React Query hooks: `useCoproprietaireUsers()`, `useResetUserPassword()`, `useSetUserPassword()`.

### 4.7 New file: `apps/frontend/src/pages/UserManagementPage.tsx`
Page accessible to syndic and admin (`RoleGuard allowedRoles={['syndic']}`):
- Table of copropriétaire user accounts (name, email, verified status, linked copropriétés)
- "Réinitialiser le mot de passe" action per user
- Status indicators (verified email, active/banned)
- Search/filter

### 4.8 New file: `apps/frontend/src/components/user-management/UserManagementTable.tsx`
Table component with columns: Nom, Email, Statut vérification, Copropriétés, Actions.

### 4.9 New file: `apps/frontend/src/components/user-management/ResetPasswordDialog.tsx`
Confirmation dialog before triggering password reset.

### 4.10 Modify: `apps/frontend/src/routes/index.tsx`
Add route:
```tsx
{ path: '/gestion-utilisateurs', element: <RoleGuard allowedRoles={['syndic']}><UserManagementPage /></RoleGuard> }
```

### 4.11 Modify: `apps/frontend/src/utils/roleAccess.ts`
Add `/gestion-utilisateurs` to syndic accessible routes.

### 4.12 Modify: `apps/frontend/src/components/layout/MainLayout.tsx`
Add "Gestion utilisateurs" navigation item visible to syndic and admin roles.

---

## Phase 5: OTP for First Authentication + Bulk User Creation

**Uses `emailOTP` plugin from Better Auth for OTP-based first login.**

### 5.1 Database migration
New migration: `apps/backend/migrations/YYYYMMDDHHMMSS_add_must_change_password.js`
```javascript
export async function up(knex) {
    await knex.schema.alterTable('user', table => {
        table.boolean('mustChangePassword').defaultTo(false)
    })
}
```
This flag is set `true` when creating users via bulk creation. After user sets password via OTP flow, flag is cleared.

### 5.2 Modify: `apps/backend/src/config/auth.js`
Add `emailOTP` plugin:
```javascript
import { admin } from 'better-auth/plugins'
import { emailOTP } from 'better-auth/plugins'

plugins: [
    admin({ ... }),
    emailOTP({
        otpLength: 6,
        expiresIn: 900, // 15 minutes
        async sendVerificationOTP({ email, otp, type }) {
            const { sendEmail } = await import('../utils/email.js')
            const { generateOTPEmail } = await import('../utils/email-templates.js')
            await sendEmail({
                to: email,
                subject: 'CoproPilot - Votre code de connexion',
                html: generateOTPEmail(email, otp),
            })
        },
    }),
]
```

### 5.3 Modify: `apps/frontend/src/lib/auth-client.ts`
Add `emailOTPClient` plugin:
```typescript
import { emailOTPClient } from 'better-auth/client/plugins'

plugins: [adminClient(), emailOTPClient()],
```

### 5.4 New file: `apps/backend/src/services/BulkUserCreationService.js`
Core service for bulk copropriétaire user provisioning:

`createUsersForCopropriete(requestingUser, coproprieteId)`:
1. Verify requesting user is admin or syndic
2. Get all copropriétaires linked to this copropriété (via lots) who have email but no `user_id`
3. For each copropriétaire:
   a. Check if `user` record exists with same email → **auto-link** (Phase 6)
   b. If no existing user: create via `auth.api.createUser()` with random temp password, role `'coproprietaire'`, `mustChangePassword: true`
   c. Update `coproprietaires.user_id` to the new/existing user
   d. Send welcome email with link to `/first-login`
4. Return results: `{ created: [], linked: [], errors: [] }`

### 5.5 New file: `apps/backend/src/controllers/BulkUserCreationController.js`
- `bulkCreate(req, res)` — POST /api/user-management/bulk-create/:coproprieteId
- `getBulkCreationPreview(req, res)` — GET /api/user-management/bulk-preview/:coproprieteId (returns list of copropriétaires who would get accounts)

### 5.6 Modify: `apps/backend/src/routes/user-management.js`
Add routes:
```javascript
router.get('/bulk-preview/:coproprieteId', requireAuth(), controller.getBulkCreationPreview)
router.post('/bulk-create/:coproprieteId', requireAuth(), controller.bulkCreate)
```

### 5.7 New endpoint for setting password after OTP: `apps/backend/src/routes/user-management.js`
```javascript
router.post('/set-initial-password', requireAuth(), controller.setInitialPassword)
```
This endpoint:
- Checks `req.user.mustChangePassword === true`
- Validates new password against OWASP
- Sets password via `auth.api.setUserPassword`
- Clears `mustChangePassword` flag
- Sets `emailVerified = true` (since they verified via OTP)

### 5.8 New file: `apps/frontend/src/pages/FirstLoginPage.tsx`
Multi-step public page for first-time copropriétaire login:
1. **Step 1**: Enter email address
2. **Step 2**: Click "Envoyer le code" → calls `authClient.emailOtp.sendVerificationOtp({ email, type: 'sign-in' })`
3. **Step 3**: Enter 6-digit OTP → calls `authClient.emailOtp.verifyOtp({ email, otp })`
4. **Step 4**: If authenticated and `mustChangePassword` is true: set new password form with OWASP validation → calls custom endpoint to set password + clear flag
5. Redirect to extranet dashboard

### 5.9 New file: `apps/frontend/src/components/auth/OTPInput.tsx`
6-digit OTP input component (individual boxes, auto-focus next, paste support).

### 5.10 Modify: `apps/frontend/src/routes/index.tsx`
Add route:
```tsx
{ path: '/first-login', element: <FirstLoginPage /> }
```

### 5.11 Modify: `apps/frontend/src/pages/CoproprieteDetailPage.tsx`
Add "Créer les comptes extranet" button (visible to syndic/admin) that:
- Shows a preview dialog of copropriétaires who will get accounts
- Triggers bulk creation on confirm
- Shows results dialog (created, linked, errors)

### 5.12 New file: `apps/frontend/src/components/coproprietes/BulkCreateAccountsDialog.tsx`
Dialog with:
- Preview tab: list of copropriétaires to create accounts for
- Auto-link preview: existing accounts that will be linked
- Confirm button
- Results display after creation

### 5.13 Modify: `apps/frontend/src/pages/LoginPage.tsx`
Add a "Première connexion (copropriétaire)" link below the sign-in form that links to `/first-login`.

---

## Phase 6: Existing Account Auto-Linking

**Integrated into the bulk creation flow (Phase 5.4). This phase handles edge cases and notifications.**

### 6.1 Already handled in `BulkUserCreationService.js` (Phase 5.4)
When a copropriétaire's email matches an existing user:
- If existing user has role `'coproprietaire'`: auto-link and send notification email
- If existing user has role `'syndic'` or `'admin'`: skip and report as "review needed"
- Update `coproprietaires.user_id` to point to existing user

### 6.2 Notification email for auto-linked accounts
The `generateAccountLinkedEmail(name, coproprieteNom)` template (from Phase 0.3) informs the user: "Vous avez été ajouté comme copropriétaire dans [Copropriété X]. Vous pouvez accéder à vos informations via l'extranet."

### 6.3 Frontend display
The `BulkCreateAccountsDialog` (Phase 5.12) shows a dedicated section for "Comptes existants liés automatiquement" with name, email, and linked copropriété.

---

## Security Considerations

### Rate Limiting
- Existing `authLimiter` (10 req/15 min) already covers `/api/auth/*` (password reset, OTP, email verification)
- User management endpoints protected by `requireAuth()` + role check
- OTP has built-in attempt limiting (Better Auth emailOTP: `expiresIn: 900`, internal retry protection)

### Token Expiry
- Password reset tokens: 1 hour (`resetPasswordTokenExpiresIn: 3600`)
- OTP codes: 15 minutes (`expiresIn: 900`)
- Email verification: Better Auth default (24 hours)

### Anti-Enumeration
- Forgot password always returns same message regardless of email existence
- OTP send always returns success

### Password Storage
- Better Auth uses scrypt (N=16384, r=16, p=1, dkLen=64) — OWASP compliant
- No changes needed to hashing algorithm

---

## Files Summary

### New Backend Files (10)
1. `apps/backend/src/utils/email.js`
2. `apps/backend/src/utils/email-templates.js`
3. `apps/backend/src/utils/password-validator.js`
4. `apps/backend/src/data/common-passwords.json`
5. `apps/backend/src/services/UserManagementService.js`
6. `apps/backend/src/services/BulkUserCreationService.js`
7. `apps/backend/src/controllers/UserManagementController.js`
8. `apps/backend/src/controllers/BulkUserCreationController.js`
9. `apps/backend/src/routes/user-management.js`
10. `apps/backend/migrations/*_add_must_change_password.js`

### New Frontend Files (10)
1. `apps/frontend/src/pages/ForgotPasswordPage.tsx`
2. `apps/frontend/src/pages/ResetPasswordPage.tsx`
3. `apps/frontend/src/pages/VerifyEmailPage.tsx`
4. `apps/frontend/src/pages/FirstLoginPage.tsx`
5. `apps/frontend/src/pages/UserManagementPage.tsx`
6. `apps/frontend/src/components/auth/PasswordInput.tsx`
7. `apps/frontend/src/components/auth/OTPInput.tsx`
8. `apps/frontend/src/components/user-management/UserManagementTable.tsx`
9. `apps/frontend/src/components/user-management/ResetPasswordDialog.tsx`
10. `apps/frontend/src/components/coproprietes/BulkCreateAccountsDialog.tsx`

### New Frontend API/Hooks/Utils (3)
1. `apps/frontend/src/api/userManagement.ts`
2. `apps/frontend/src/hooks/useUserManagement.ts`
3. `apps/frontend/src/utils/passwordValidation.ts`

### Modified Backend Files (3)
1. `apps/backend/src/config/auth.js` — emailOTP plugin, sendResetPassword, emailVerification, OWASP settings
2. `apps/backend/src/routes/index.js` — register user-management routes
3. `apps/backend/.env.example` — SMTP variables

### Modified Frontend Files (7)
1. `apps/frontend/src/lib/auth-client.ts` — add emailOTPClient plugin
2. `apps/frontend/src/pages/LoginPage.tsx` — forgot password link, first-login link, OWASP validation, extract components
3. `apps/frontend/src/store/authStore.ts` — email verification pending state
4. `apps/frontend/src/routes/index.tsx` — new routes
5. `apps/frontend/src/utils/roleAccess.ts` — new route permissions
6. `apps/frontend/src/components/layout/MainLayout.tsx` — navigation item
7. `apps/frontend/src/pages/CoproprieteDetailPage.tsx` — bulk create accounts button

### New Dependencies (1)
- `nodemailer` in `apps/backend/package.json`
