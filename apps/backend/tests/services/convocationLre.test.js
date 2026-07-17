import { describe, it, expect } from 'vitest'
import {
  modeUsesLre,
  buildConvocationLrePayload,
  toLreTracking,
} from '../../src/services/lre/convocationLre.js'

describe('modeUsesLre', () => {
  it('is true for recommandé modes', () => {
    expect(modeUsesLre('courrier_recommande')).toBe(true)
    expect(modeUsesLre('les_deux')).toBe(true)
  })

  it('is false for email-only and unknown modes', () => {
    expect(modeUsesLre('email')).toBe(false)
    expect(modeUsesLre(undefined)).toBe(false)
    expect(modeUsesLre('')).toBe(false)
  })
})

describe('buildConvocationLrePayload', () => {
  const convocation = {
    id: 7,
    contenu: 'Ordre du jour…',
    mode_envoi: 'les_deux',
  }

  it('builds a payload from the snapshot email', () => {
    const payload = buildConvocationLrePayload(convocation, {
      id: 3,
      email_envoye_a: 'copro@example.com',
      coproprietaire_nom: 'Durand',
      coproprietaire_prenom: 'Marie',
    })
    expect(payload).toMatchObject({
      to: 'copro@example.com',
      subject: expect.stringContaining('assemblée générale'),
      content: 'Ordre du jour…',
    })
    expect(payload.metadata).toMatchObject({
      convocationId: 7,
      destinataireId: 3,
      toFirstname: 'Marie',
      toLastname: 'Durand',
    })
  })

  it('falls back to the joined coproprietaire email', () => {
    const payload = buildConvocationLrePayload(convocation, {
      id: 4,
      email_envoye_a: null,
      coproprietaire_email: 'joined@example.com',
    })
    expect(payload.to).toBe('joined@example.com')
  })

  it('falls back to a default body when the convocation has no content', () => {
    const payload = buildConvocationLrePayload(
      { id: 1, contenu: null },
      { id: 5, email_envoye_a: 'a@b.com' }
    )
    expect(payload.content).toMatch(/convoqué/i)
  })

  it('returns null when there is no usable e-mail', () => {
    expect(
      buildConvocationLrePayload(convocation, { id: 6, email_envoye_a: null })
    ).toBeNull()
    expect(
      buildConvocationLrePayload(convocation, {
        id: 7,
        email_envoye_a: 'not-an-email',
      })
    ).toBeNull()
  })
})

describe('toLreTracking', () => {
  it('maps a real provider result to persisted columns', () => {
    expect(
      toLreTracking({
        providerId: 'ar24',
        trackingId: 'eml_42',
        proofUrl: 'https://ar24/proof/42',
        status: 'sent',
      })
    ).toEqual({
      lre_provider: 'ar24',
      lre_tracking_id: 'eml_42',
      lre_proof_url: 'https://ar24/proof/42',
      lre_statut: 'sent',
    })
  })

  it('maps the noop result to null tracking with its status', () => {
    expect(
      toLreTracking({
        providerId: 'noop',
        trackingId: null,
        status: 'not_configured',
        simulated: true,
      })
    ).toEqual({
      lre_provider: 'noop',
      lre_tracking_id: null,
      lre_proof_url: null,
      lre_statut: 'not_configured',
    })
  })
})
