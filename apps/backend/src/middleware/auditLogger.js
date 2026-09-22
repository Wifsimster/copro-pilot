import { auditService } from '../services/AuditService.js'

const ENTITY_MAP = {
  '/coproprietes': 'copropriete',
  '/coproprietaires': 'coproprietaire',
  '/lots': 'lot',
  '/parties-communes': 'partie_commune',
  '/cles-repartition': 'cle_repartition',
  '/locataires': 'locataire',
  '/mutations': 'mutation',
  '/budgets': 'budget',
  '/appels-fonds': 'appel_fonds',
  '/paiements': 'paiement',
  '/fonds-travaux': 'fonds_travaux',
  '/comptes-bancaires': 'compte_bancaire',
  '/mouvements-bancaires': 'mouvement_bancaire',
  '/assemblees': 'assemblee',
  '/convocations': 'convocation',
  '/incidents': 'incident',
  '/interventions': 'intervention',
  '/carnet-entretien': 'carnet_entretien',
  '/documents': 'document',
  '/diagnostics': 'diagnostic',
  '/conseil-syndical': 'conseil_syndical',
  '/assurances': 'assurance',
  '/sinistres': 'sinistre',
  '/relances': 'relance',
  '/procedures': 'procedure',
  '/prestataires': 'prestataire',
  '/contrats': 'contrat',
  '/employes-syndicat': 'employe_syndicat',
  '/reglements-copropriete': 'reglement_copropriete',
  '/declarations-registre': 'declaration_registre',
  '/contrats-syndic': 'contrat_syndic',
  '/propositions-syndic': 'proposition_syndic',
  '/notifications': 'notification',
  '/gdpr': 'gdpr',
  '/comptabilite': 'comptabilite',
  '/compta-tresorerie': 'compta_tresorerie',
  '/regularisations': 'regularisation',
  '/reprise-gestion': 'reprise_gestion',
  '/cycle-annuel': 'cycle_annuel',
  '/tickets': 'ticket',
  '/votes': 'vote',
  '/procurations': 'procuration',
  '/signatures': 'signature',
  '/extranet': 'extranet',
  '/user-management': 'user',
}

export function getEntityType(path) {
  // Match the first segment exactly ('/contrats-syndic' is not '/contrats')
  const segment = `/${path.split('/')[1] ?? ''}`
  return ENTITY_MAP[segment] ?? 'unknown'
}

function getAction(method) {
  switch (method) {
    case 'POST':
      return 'create'
    case 'PUT':
    case 'PATCH':
      return 'update'
    case 'DELETE':
      return 'delete'
    default:
      return null
  }
}

/**
 * Middleware: automatically logs POST/PUT/PATCH/DELETE
 * operations on success for GDPR audit trail.
 */
export const auditLogger = (req, res, next) => {
  const action = getAction(req.method)
  if (!action) return next()

  // Capture the full path now: inside the route handler req.path has the
  // router mount prefixes stripped (e.g. '/42' instead of '/lots/42').
  const apiPath = (req.originalUrl || req.url || '')
    .split('?')[0]
    .replace(/^\/api(\/v1)?/, '')

  const originalJson = res.json
  res.json = function (body) {
    if (res.statusCode < 300) {
      const entityType = getEntityType(apiPath)
      const entityId =
        req.params?.id || body?.data?.id || null

      auditService.log({
        user_id: req.user?.id || null,
        action,
        entity_type: entityType,
        entity_id: entityId ? String(entityId) : null,
        description: `${req.method} ${apiPath}`,
        ip: req.ip,
      })
    }
    return originalJson.call(this, body)
  }
  next()
}
