# GDPR (RGPD) Compliance Review - CoproPilot

**Date:** 2026-02-19
**Application:** CoproPilot - Plateforme de gestion de copropriete
**Scope:** Full-stack review (backend Express API + frontend React SPA + PostgreSQL database)

---

## Executive Summary

**Overall Compliance Rating: ~25% - NON-COMPLIANT**

CoproPilot processes substantial personal data (names, emails, phone numbers, addresses, IBANs, salaries, financial records, legal proceedings, voting history) but lacks the foundational GDPR compliance mechanisms. The application has basic authentication and role-based access control, but is missing consent management, data subject rights implementation, privacy documentation, encryption at rest, audit logging, and data retention policies.

**Risk Level: HIGH** - The application should not process EU personal data without remediation.

---

## Table of Contents

1. [Personal Data Inventory](#1-personal-data-inventory)
2. [Authentication & Session Management](#2-authentication--session-management)
3. [Consent Management](#3-consent-management)
4. [Data Subject Rights](#4-data-subject-rights)
5. [Access Control & Data Segregation](#5-access-control--data-segregation)
6. [Logging & PII Leakage](#6-logging--pii-leakage)
7. [Security Measures](#7-security-measures)
8. [Data Retention & Deletion](#8-data-retention--deletion)
9. [Client-Side Data Handling](#9-client-side-data-handling)
10. [Third-Party Data Processing](#10-third-party-data-processing)
11. [GDPR Article-by-Article Compliance](#11-gdpr-article-by-article-compliance)
12. [Prioritized Recommendations](#12-prioritized-recommendations)

---

## 1. Personal Data Inventory

### Tables Storing PII

| Table | PII Fields | Sensitivity | Encryption |
|---|---|---|---|
| `user` | name, email, displayName, givenName, familyName, image, azureId | CRITICAL | NO |
| `session` | token, ipAddress, userAgent | CRITICAL | NO |
| `account` | password, accessToken, refreshToken | CRITICAL | Partial (password hashed by Better Auth) |
| `coproprietaires` | nom, prenom, email, telephone, adresse_correspondance, notes | CRITICAL | NO |
| `locataires` | nom, prenom, email, telephone, date_entree, date_sortie | HIGH | NO |
| `comptes_bancaires` | **IBAN**, BIC, banque, solde | CRITICAL | NO |
| `employes_syndicat` | nom, prenom, poste, type_contrat, date_embauche, **salaire_brut** | CRITICAL | NO |
| `paiements` | montant, date_paiement, mode, reference (linked to coproprietaire) | CRITICAL | NO |
| `appels_fonds_lignes` | montant (linked to coproprietaire) | HIGH | NO |
| `mouvements_bancaires` | montant, date, libelle (linked to compte with IBAN) | HIGH | NO |
| `ecritures_comptables` | debit, credit, libelle (linked to coproprietaire) | HIGH | NO |
| `prestataires` | contact_nom, contact_email, contact_telephone, adresse, siret | HIGH | NO |
| `mutations` | ancien_nom, ancien_prenom, nouveau_nom, nouveau_prenom | HIGH | NO |
| `procedures` | avocat, tribunal, reference_dossier, decision, montant_reclame | CRITICAL | NO |
| `relances` | montant_du, type (linked to coproprietaire debt history) | CRITICAL | NO |
| `destinataires_convocation` | email_envoye_a (duplicated from coproprietaires.email) | HIGH | NO |
| `presences_ag` | attendance/voting records (linked to coproprietaire) | MEDIUM | NO |
| `conseil_syndical` | role, date_election (linked to coproprietaire) | MEDIUM | NO |
| `notifications` | titre, message (linked to user) | MEDIUM | NO |
| `documents` | nom, fichier_path, description | MEDIUM | NO |
| `sinistres` | numero_sinistre, description, montant_estime | MEDIUM | NO |

### Key Finding

**20+ tables store PII with zero encryption at rest.** Particularly critical: IBANs, salaries, legal proceedings, and debt/collection records are stored in plaintext.

---

## 2. Authentication & Session Management

### Positive Findings
- Better Auth handles password hashing (industry standard)
- Session-based authentication with cookie management
- Email verification field exists (`emailVerified` on user table)
- Request logger redacts passwords in POST/PUT/PATCH bodies

### Issues Found

| Issue | Location | Severity |
|---|---|---|
| No explicit session timeout configured | `apps/backend/src/config/auth.js:113-129` | HIGH |
| Cookie security flags not explicitly set (`secure`, `httpOnly`, `sameSite`) | `apps/backend/src/createApp.js:52` | HIGH |
| Email verification not enforced (users can login unverified) | `apps/backend/src/config/auth.js` | MEDIUM |
| No email sending service found (verification emails not sent) | N/A | HIGH |
| Password strength enforced only on frontend, not backend | `apps/frontend/src/pages/LoginPage.tsx:186` | MEDIUM |
| IP address and user agent stored in sessions without consent | `session` table in migration | MEDIUM |
| Admin impersonation field (`impersonatedBy`) without audit trail | `session` table | MEDIUM |

---

## 3. Consent Management

### Status: NOT IMPLEMENTED

| Requirement | Status | Details |
|---|---|---|
| Explicit consent checkbox on registration | MISSING | `LoginPage.tsx:457` has generic footer text "By continuing, you accept..." but no affirmative checkbox |
| Granular consent options (marketing, analytics, cookies) | MISSING | No consent options exist |
| Consent records stored in database | MISSING | No consent tracking table |
| Withdrawal of consent mechanism | MISSING | No UI or API for consent withdrawal |
| Cookie consent banner | MISSING | No cookie banner component found |
| Privacy policy page | MISSING | No privacy policy page in frontend |
| Terms of service page | MISSING | No ToS page in frontend |

### Impact
- **GDPR Article 6**: No documented lawful basis for data processing
- **GDPR Article 7**: No mechanism for consent withdrawal
- **ePrivacy Directive**: No cookie consent (localStorage usage requires consent)

---

## 4. Data Subject Rights

### Article 15 - Right of Access: PARTIAL

Users can view their own data through the extranet portal:
- `/extranet/mon-profil` - Personal profile
- `/extranet/mon-compte` - Account balance
- `/extranet/mes-charges` - Charges
- `/extranet/mes-appels-fonds` - Fund calls
- `/extranet/mon-fonds-travaux` - Works fund

**Missing:** No consolidated view of ALL personal data. No way to see session history, admin notes, or processing activities.

### Article 16 - Right to Rectification: NOT IMPLEMENTED

- Profile pages are **read-only** display components
- No self-service UI for users to update their own email, phone, address, or name
- No `PUT` endpoints accessible to users for self-update
- Only admins can modify user data

### Article 17 - Right to Erasure: NOT COMPLIANT

- **Hard-delete only**: Records permanently deleted via `db('table').where('id', id).del()`
- **No self-service deletion**: Users cannot delete their own account
- **No deletion request workflow**: No formal process for erasure requests
- **Cascading deletes destroy financial records** (paiements deleted with CASCADE) violating French legal retention requirements
- **No audit trail**: No logging of who deleted what, when, or why
- **No anonymization option**: Cannot anonymize instead of delete
- **No confirmation period**: No 30-day cooling-off before permanent deletion

### Article 20 - Right to Data Portability: NOT IMPLEMENTED

- Export functionality exists (`ExportService`, `ExportExcelService`, `ExportPdfService`) but only for business reports
- **No personal data export** in structured, machine-readable format (JSON/CSV)
- **No DSAR (Data Subject Access Request) endpoint**

### Article 21 - Right to Object: NOT IMPLEMENTED

- No opt-out mechanism for data processing
- No objection handling workflow

---

## 5. Access Control & Data Segregation

### Backend RBAC

```
Roles: admin | user | syndic | coproprietaire
Middleware: requireAuth() (session check), requireAdmin() (admin role check)
```

### Issues Found

| Issue | Severity |
|---|---|
| Most DELETE endpoints only require `requireAuth()`, not `requireAdmin()` - any authenticated user can delete records | CRITICAL |
| No data ownership checks - controllers don't verify if user owns the data they're modifying | CRITICAL |
| Only two effective permission levels (admin / not-admin) - no granular permissions | HIGH |
| Conseil syndical members can view all coproprietaires' emails and financial balances via extranet | MEDIUM |
| No component-level access control on frontend (delete buttons not conditionally rendered) | MEDIUM |

### Example of Missing Ownership Check

```javascript
// CoproprietaireController.delete() deletes by ID without checking ownership
static async delete(req, res) {
  const { id } = req.params
  const deleted = await coproprietaireService.delete(id) // No ownership verification
}
```

---

## 6. Logging & PII Leakage

### Issues Found

| Issue | Location | Severity |
|---|---|---|
| Client IP address logged on every request | `requestLogger.js:18` - `logger.info(\`[\${req.method}] \${req.path} - \${req.ip}\`)` | HIGH |
| User email logged in auth warnings | `auth.js:93-96` - `userEmail: req.user.email` | HIGH |
| Sensitive field redaction only covers 4 fields (password, token, apikey, secret) | `requestLogger.js:25-31` | MEDIUM |
| Request headers with auth tokens NOT redacted | `requestLogger.js` | MEDIUM |
| Query parameters NOT checked for sensitive data | `requestLogger.js` | MEDIUM |
| CoproprietaireService logs full names on create/delete | Service files | MEDIUM |
| No date-based log rotation (only size-based 5x10MB) | `logger.js:55-65` | MEDIUM |

### IP Address Logging (GDPR Recital 30)

IP addresses are personal data under GDPR. Logging them on every request without consent or documented legitimate interest violates Article 5(1)(b) and Article 6.

---

## 7. Security Measures

### Missing Security Controls

| Control | Status | GDPR Relevance |
|---|---|---|
| Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) | MISSING | Art. 32 |
| Rate limiting (brute-force protection) | MISSING | Art. 32 |
| HTTPS enforcement in application code | MISSING | Art. 32 |
| Field-level encryption for sensitive data (IBAN, salaries) | MISSING | Art. 32 |
| Database encryption at rest | NOT CONFIGURED | Art. 32 |
| Audit logging (who accessed what data, when) | MISSING | Art. 5(2) |
| Data breach detection mechanisms | MISSING | Art. 33 |
| Incident response procedure | MISSING | Art. 33-34 |

### CORS Configuration

```javascript
// apps/backend/src/createApp.js
app.use(cors({
    origin: process.env.NODE_ENV === 'development'
      ? ['http://localhost:5173', 'http://127.0.0.1:5173', ...]
      : frontendUrl,
    credentials: true
}))
```

Production CORS is correctly restricted, but development mode is permissive. Risk of misconfiguration if `NODE_ENV` is not properly set.

---

## 8. Data Retention & Deletion

### Status: NO RETENTION POLICY

- No data retention schedule defined
- No automated data purification or anonymization
- Session data retained indefinitely (IP addresses, user agents)
- Verification tokens have expiry but are not auto-deleted
- Financial records subject to CASCADE delete (violates French 6-10 year retention law)
- Employee records retained indefinitely after employment ends
- No archival strategy for historical data

### Cascade Deletion Analysis

When a coproprietaire is deleted:
```
DELETE coproprietaires WHERE id = X
  CASCADE DELETE: presences_ag, paiements, appels_fonds_lignes
  SET NULL: lots, mutations, incidents, conseil_syndical
  ORPHANED: user account still exists
```

**Problem:** Financial records (paiements) permanently deleted via CASCADE, violating French accounting law.

---

## 9. Client-Side Data Handling

### localStorage Usage

```typescript
// apps/frontend/src/store/authStore.ts:42-45
localStorage.setItem('user', JSON.stringify(userData))  // Full user object
localStorage.setItem('email', userData.email)            // Email in plaintext
localStorage.setItem('role', userData.role)               // User role
```

| Issue | Severity |
|---|---|
| Full user object in localStorage (plaintext, accessible to any JS on page) | HIGH |
| Email stored separately in localStorage (redundant PII) | HIGH |
| localStorage persists across browser sessions (even after tab close) | MEDIUM |
| No evidence localStorage is cleared on logout | HIGH |
| Vulnerable to XSS attacks (browser extensions, injected scripts) | HIGH |

### Frontend Console Logging

Development mode logs auth errors to browser console (`logger.error('Sign in failed:', error)`). Disabled in production but could leak error details in dev.

---

## 10. Third-Party Data Processing

### Identified Third Parties

| Service | Data Processed | DPA Status |
|---|---|---|
| Better Auth | User credentials, sessions, tokens | NOT DOCUMENTED |
| PostgreSQL provider | All application data | NOT DOCUMENTED |
| Microsoft OAuth (optional) | Azure ID, display name, given/family name | NOT DOCUMENTED |
| DockerHub | Application images | NOT DOCUMENTED |

### Missing Documentation
- No Data Processing Agreements (DPA) documented
- No sub-processor list
- No international data transfer assessment
- No vendor security assessment

---

## 11. GDPR Article-by-Article Compliance

| Article | Requirement | Status | Notes |
|---|---|---|---|
| **Art. 5(1)(a)** | Lawfulness, fairness, transparency | NON-COMPLIANT | No privacy policy, no consent mechanism |
| **Art. 5(1)(b)** | Purpose limitation | NON-COMPLIANT | No documented processing purposes |
| **Art. 5(1)(c)** | Data minimization | PARTIAL | Redundant email storage, excessive data in API responses |
| **Art. 5(1)(d)** | Accuracy | PARTIAL | No self-service rectification |
| **Art. 5(1)(e)** | Storage limitation | NON-COMPLIANT | No retention policy, no automated cleanup |
| **Art. 5(1)(f)** | Integrity & confidentiality | NON-COMPLIANT | No encryption at rest, missing security headers |
| **Art. 5(2)** | Accountability | NON-COMPLIANT | No audit trail, no DPIA, no processing records |
| **Art. 6** | Lawful basis | NON-COMPLIANT | No consent, no documented legitimate interest |
| **Art. 7** | Conditions for consent | NON-COMPLIANT | No consent mechanism |
| **Art. 12** | Transparent information | NON-COMPLIANT | No privacy policy or data processing notice |
| **Art. 13-14** | Information to data subjects | NON-COMPLIANT | No privacy notices at collection |
| **Art. 15** | Right of access | PARTIAL | Extranet shows some data, no complete export |
| **Art. 16** | Right to rectification | NON-COMPLIANT | Read-only profiles |
| **Art. 17** | Right to erasure | NON-COMPLIANT | No self-service, hard-delete only, no audit |
| **Art. 20** | Right to portability | NON-COMPLIANT | No personal data export |
| **Art. 21** | Right to object | NON-COMPLIANT | No objection mechanism |
| **Art. 25** | Data protection by design | NON-COMPLIANT | No privacy-by-design patterns |
| **Art. 28** | Processor agreements | NON-COMPLIANT | No DPAs documented |
| **Art. 30** | Records of processing | NON-COMPLIANT | No processing activity records |
| **Art. 32** | Security of processing | PARTIAL | Auth exists but missing encryption, headers, rate limiting |
| **Art. 33** | Breach notification to authority | NON-COMPLIANT | No breach detection or notification system |
| **Art. 34** | Breach notification to data subjects | NON-COMPLIANT | No breach notification mechanism |
| **Art. 35** | Data Protection Impact Assessment | NON-COMPLIANT | No DPIA conducted |
| **Art. 37** | Data Protection Officer | NOT ASSESSED | May not be required depending on org size |

---

## 12. Prioritized Recommendations

### Phase 1: Critical (Immediate)

#### 1.1 Add Security Headers
Install `helmet.js` and configure in `createApp.js`:
- HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy

#### 1.2 Fix Cookie Security
Configure explicit cookie flags in Better Auth:
- `secure: true` (production), `httpOnly: true`, `sameSite: 'strict'`

#### 1.3 Add Rate Limiting
Install `express-rate-limit` for authentication endpoints to prevent brute-force attacks.

#### 1.4 Remove PII from Logs
- Remove IP address from request logger
- Replace email with hashed user ID in auth middleware logs
- Expand sensitive field redaction list

#### 1.5 Secure Client-Side Storage
- Move user data from `localStorage` to `sessionStorage` or in-memory only
- Clear all storage on logout
- Remove redundant email storage

#### 1.6 Restrict DELETE Endpoints
Add `requireAdmin()` to all DELETE routes. Add ownership verification in controllers.

### Phase 2: High Priority (Short-term)

#### 2.1 Implement Privacy Policy Page
Create a privacy policy page accessible from login/signup and navigation.

#### 2.2 Add Consent Management
- Add explicit consent checkbox on registration (not pre-ticked)
- Create `consent_records` table (user_id, consent_type, granted_at, withdrawn_at)
- Implement consent withdrawal UI

#### 2.3 Implement Right to Rectification
- Add self-service profile editing (email, phone, address, name)
- Create `PUT /api/extranet/mon-profil` endpoint

#### 2.4 Implement Right to Portability
- Create `GET /api/extranet/export-data` endpoint
- Return all personal data in JSON format
- Add "Download my data" button on profile page

#### 2.5 Implement Soft-Delete with Audit Trail
- Add `deleted_at`, `deleted_by`, `deletion_reason` columns to PII tables
- Create `audit_log` table for all data operations
- Replace hard-delete with soft-delete
- Respect French legal retention periods for financial records

#### 2.6 Add Field-Level Encryption
Encrypt at rest: IBAN, BIC, salaire_brut, telephone, adresse_correspondance

### Phase 3: Medium Priority (Medium-term)

#### 3.1 Implement Data Retention Policy
- Define retention periods per data category (respecting French law)
- Implement automated anonymization for expired data
- Create scheduled cleanup jobs

#### 3.2 Add Audit Logging
- Create comprehensive audit trail (who accessed/modified/deleted what, when)
- Separate audit log from application log
- Implement tamper-proof audit storage

#### 3.3 Implement Deletion Request Workflow
- Self-service account deletion request
- 30-day confirmation period
- Anonymization of data that must be retained
- Confirmation notification

#### 3.4 Add Cookie Consent Banner
- Implement cookie consent component
- Track consent preferences
- Block non-essential cookies until consent

#### 3.5 Configure Session Timeout
- Set maximum session duration (recommended: 8 hours)
- Force re-authentication for sensitive operations
- Implement idle session timeout

### Phase 4: Long-term

#### 4.1 Conduct DPIA
- Assess risks of processing financial + personal data
- Document mitigations
- Consult with CNIL (French DPA) if high risk

#### 4.2 Document Processing Activities (Art. 30)
- Create Record of Processing Activities (ROPA)
- Document lawful basis for each processing activity
- Map data flows

#### 4.3 Establish DPA with Processors
- Document Data Processing Agreements with Better Auth, hosting providers
- Maintain sub-processor list

#### 4.4 Implement Breach Notification System
- Automated breach detection
- 72-hour notification to CNIL
- User notification mechanism for high-risk breaches

#### 4.5 Consider DPO Appointment
- Assess if a Data Protection Officer is required
- If processing large-scale financial data of residents, likely required

---

## Legal Context: French Property Management

CoproPilot operates in the French copropriete management domain, which has specific legal requirements:

- **French Accounting Law**: Financial records must be retained 6-10 years
- **Loi ALUR / Loi Elan**: Syndic obligations for document retention
- **CNIL Guidelines**: French data protection authority enforces GDPR with specific guidance for property management
- **Right to Erasure vs. Legal Retention**: Financial records cannot be deleted but must be anonymized after the retention period

These legal obligations provide a lawful basis (Art. 6(1)(c)) for retaining certain data, but this must be documented and communicated to data subjects.

---

## Files Requiring Modification

| File | Required Changes |
|---|---|
| `apps/backend/src/createApp.js` | Add helmet.js, cookie flags, rate limiting, HTTPS redirect |
| `apps/backend/src/middleware/requestLogger.js` | Remove IP logging, expand redaction |
| `apps/backend/src/middleware/auth.js` | Hash user ID in logs, remove email |
| `apps/backend/src/logger.js` | Add date-based log rotation |
| `apps/backend/src/config/auth.js` | Configure session timeout, cookie security |
| `apps/backend/src/routes/*.js` | Add requireAdmin() to DELETE routes |
| `apps/backend/src/controllers/*.js` | Add ownership verification |
| `apps/backend/migrations/` | New migrations: audit_log, consent_records, soft-delete columns |
| `apps/frontend/src/store/authStore.ts` | Move PII from localStorage to sessionStorage |
| `apps/frontend/src/pages/` | New: PrivacyPolicyPage, CookieConsent component |
| `apps/frontend/src/routes/index.tsx` | Add privacy policy route |

---

*This review is based on code analysis as of 2026-02-19. It does not constitute legal advice. Consult with a qualified data protection lawyer and/or the CNIL for definitive compliance guidance.*
