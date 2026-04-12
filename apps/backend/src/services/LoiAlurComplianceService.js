import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

class LoiAlurComplianceService {
  /**
   * Check a copropriete's compliance with Loi ALUR requirements.
   *
   * Returns a compliance report with individual check results.
   *
   * @param {number|string} coproprieteId
   * @returns {Promise<{compliant: boolean, checks: Array}>}
   */
  async checkCompliance(coproprieteId) {
    const db = getDb()

    const copropriete = await db('coproprietes')
      .where('id', coproprieteId)
      .first()

    if (!copropriete) {
      return null
    }

    const currentYear = new Date().getFullYear()

    const [
      ficheSynthetique,
      carnetEntries,
      diagnostics,
      declarations,
      budget,
    ] = await Promise.all([
      // 1. Fiche synthetique — the copropriete record itself holds the
      //    fields required by loi ALUR (numero_immatriculation, etc.)
      db('coproprietes')
        .where('id', coproprieteId)
        .select(
          'numero_immatriculation',
          'nombre_batiments',
          'nombre_ascenseurs',
          'periode_construction',
          'type_chauffage'
        )
        .first(),

      // 2. Carnet d'entretien — should have entries within the last 3 years
      db('carnet_entretien')
        .where('copropriete_id', coproprieteId)
        .orderBy('date_realisation', 'desc')
        .limit(1)
        .first(),

      // 3. Diagnostics — DPE, DTG, etc. must be valid (not expired)
      db('diagnostics')
        .where('copropriete_id', coproprieteId)
        .select('type', 'statut', 'date_validite'),

      // 4. Immatriculation declarations — must have current year
      db('declarations_registre')
        .where('copropriete_id', coproprieteId)
        .where('annee', currentYear)
        .first(),

      // 5. Annual budget — must exist for current year
      db('budgets_previsionnels')
        .where('copropriete_id', coproprieteId)
        .where('annee', currentYear)
        .first(),
    ])

    const checks = []

    // --- Check 1: Fiche synthetique ---
    const hasFiche = !!(
      ficheSynthetique &&
      ficheSynthetique.numero_immatriculation
    )
    checks.push({
      name: 'fiche_synthetique',
      status: hasFiche ? 'pass' : 'fail',
      details: hasFiche
        ? 'Fiche synthetique renseignee avec numero immatriculation'
        : 'Fiche synthetique incomplete — le numero '
          + 'immatriculation est manquant',
    })

    // --- Check 2: Carnet d'entretien up to date ---
    const threeYearsAgo = new Date()
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
    const carnetUpToDate = !!(
      carnetEntries &&
      new Date(carnetEntries.date_realisation) >= threeYearsAgo
    )
    checks.push({
      name: 'carnet_entretien',
      status: carnetUpToDate ? 'pass' : 'fail',
      details: carnetUpToDate
        ? `Derniere entree le ${carnetEntries.date_realisation}`
        : 'Aucune entree dans le carnet d\'entretien '
          + 'au cours des 3 dernieres annees',
    })

    // --- Check 3: Diagnostics valid ---
    const today = new Date().toISOString().slice(0, 10)
    const expiredDiagnostics = diagnostics.filter(
      d =>
        d.statut === 'expire' ||
        (d.date_validite && d.date_validite < today)
    )
    const diagnosticsValid = expiredDiagnostics.length === 0
      && diagnostics.length > 0
    checks.push({
      name: 'diagnostics',
      status: diagnosticsValid ? 'pass' : 'fail',
      details: diagnosticsValid
        ? `${diagnostics.length} diagnostic(s) valide(s)`
        : diagnostics.length === 0
          ? 'Aucun diagnostic enregistre'
          : `${expiredDiagnostics.length} diagnostic(s) expire(s) : `
            + expiredDiagnostics.map(d => d.type).join(', '),
    })

    // --- Check 4: Immatriculation declarations current ---
    const declarationCurrent = !!(
      declarations &&
      (declarations.statut === 'soumis'
        || declarations.statut === 'valide')
    )
    checks.push({
      name: 'immatriculation',
      status: declarationCurrent ? 'pass' : 'fail',
      details: declarationCurrent
        ? `Declaration ${currentYear} au statut ${declarations.statut}`
        : `Aucune declaration validee ou soumise pour ${currentYear}`,
    })

    // --- Check 5: Annual budget exists ---
    const budgetExists = !!budget
    checks.push({
      name: 'budget_annuel',
      status: budgetExists ? 'pass' : 'fail',
      details: budgetExists
        ? `Budget ${currentYear} present (statut : ${budget.statut})`
        : `Aucun budget previsionnel pour ${currentYear}`,
    })

    const compliant = checks.every(c => c.status === 'pass')

    logger.info(
      `[LoiAlurComplianceService] Compliance check for `
        + `copropriete ${coproprieteId}: `
        + `${compliant ? 'compliant' : 'non-compliant'}`
    )

    return { compliant, checks }
  }
}

export const loiAlurComplianceService =
  new LoiAlurComplianceService()
