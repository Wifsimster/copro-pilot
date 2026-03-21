import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

class CashFlowService {
  async getForecast(coproprieteId) {
    try {
      const db = getDb()

      // 1. Get emis appels de fonds (amounts DUE)
      const [totalDuResult] = await db('appels_fonds')
        .where('copropriete_id', coproprieteId)
        .where('statut', 'emis')
        .sum('montant_total as total')

      const totalDu = parseFloat(
        totalDuResult?.total || 0
      )

      // 2. Get paiements for last 12 months (amounts RECEIVED)
      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setMonth(
        twelveMonthsAgo.getMonth() - 12
      )

      const [totalPayeResult] = await db('paiements')
        .join(
          'appels_fonds',
          'paiements.appel_fonds_id',
          'appels_fonds.id'
        )
        .where(
          'appels_fonds.copropriete_id',
          coproprieteId
        )
        .where(
          'paiements.date_paiement',
          '>=',
          twelveMonthsAgo.toISOString().split('T')[0]
        )
        .sum('paiements.montant as total')

      const totalPaye = parseFloat(
        totalPayeResult?.total || 0
      )

      // 3. Calculate recovery rate
      const tauxRecouvrement =
        totalDu > 0
          ? Math.round(
              (totalPaye / totalDu) * 100 * 100
            ) / 100
          : 100

      const soldeImpaye = totalDu - totalPaye

      // 4. Build 30/60/90 day projections
      const now = new Date()

      const in30d = new Date(now)
      in30d.setDate(in30d.getDate() + 30)

      const in60d = new Date(now)
      in60d.setDate(in60d.getDate() + 60)

      const in90d = new Date(now)
      in90d.setDate(in90d.getDate() + 90)

      const nowStr = now.toISOString().split('T')[0]
      const in30dStr = in30d.toISOString().split('T')[0]
      const in60dStr = in60d.toISOString().split('T')[0]
      const in90dStr = in90d.toISOString().split('T')[0]

      const rate = tauxRecouvrement / 100

      const [upcoming30] = await db('appels_fonds')
        .where('copropriete_id', coproprieteId)
        .where('date_echeance', '>=', nowStr)
        .where('date_echeance', '<=', in30dStr)
        .whereIn('statut', ['emis', 'brouillon'])
        .sum('montant_total as total')

      const [upcoming60] = await db('appels_fonds')
        .where('copropriete_id', coproprieteId)
        .where('date_echeance', '>=', nowStr)
        .where('date_echeance', '<=', in60dStr)
        .whereIn('statut', ['emis', 'brouillon'])
        .sum('montant_total as total')

      const [upcoming90] = await db('appels_fonds')
        .where('copropriete_id', coproprieteId)
        .where('date_echeance', '>=', nowStr)
        .where('date_echeance', '<=', in90dStr)
        .whereIn('statut', ['emis', 'brouillon'])
        .sum('montant_total as total')

      const j30 =
        Math.round(
          parseFloat(upcoming30?.total || 0) *
            rate *
            100
        ) / 100
      const j60 =
        Math.round(
          parseFloat(upcoming60?.total || 0) *
            rate *
            100
        ) / 100
      const j90 =
        Math.round(
          parseFloat(upcoming90?.total || 0) *
            rate *
            100
        ) / 100

      // 5. Identify at-risk coproprietaires
      const paiementsParCopro = await db('paiements')
        .select(
          'paiements.coproprietaire_id',
          'coproprietaires.nom',
          'coproprietaires.prenom'
        )
        .sum('paiements.montant as total_paye')
        .join(
          'coproprietaires',
          'paiements.coproprietaire_id',
          'coproprietaires.id'
        )
        .join(
          'appels_fonds',
          'paiements.appel_fonds_id',
          'appels_fonds.id'
        )
        .where(
          'appels_fonds.copropriete_id',
          coproprieteId
        )
        .groupBy(
          'paiements.coproprietaire_id',
          'coproprietaires.nom',
          'coproprietaires.prenom'
        )

      const appelLignesParCopro = await db(
        'appels_fonds_lignes'
      )
        .select('coproprietaire_id')
        .sum('montant as total_du')
        .join(
          'appels_fonds',
          'appels_fonds_lignes.appel_fonds_id',
          'appels_fonds.id'
        )
        .where(
          'appels_fonds.copropriete_id',
          coproprieteId
        )
        .where('appels_fonds.statut', 'emis')
        .whereNotNull(
          'appels_fonds_lignes.coproprietaire_id'
        )
        .groupBy('coproprietaire_id')

      const duParCopro = {}
      for (const row of appelLignesParCopro) {
        duParCopro[row.coproprietaire_id] = parseFloat(
          row.total_du || 0
        )
      }

      const coproprietairesARisque = []

      for (const copro of paiementsParCopro) {
        const duTotal =
          duParCopro[copro.coproprietaire_id] || 0
        const payeTotal = parseFloat(
          copro.total_paye || 0
        )

        if (duTotal <= 0) continue

        const coproTaux =
          Math.round(
            (payeTotal / duTotal) * 100 * 100
          ) / 100
        const montantImpaye = duTotal - payeTotal

        if (coproTaux < 70) {
          coproprietairesARisque.push({
            coproprietaire_id: copro.coproprietaire_id,
            nom: copro.nom,
            prenom: copro.prenom,
            taux_recouvrement: coproTaux,
            montant_impaye:
              Math.round(montantImpaye * 100) / 100,
          })
        }
      }

      // Sort by taux ascending (worst first)
      coproprietairesARisque.sort(
        (a, b) =>
          a.taux_recouvrement - b.taux_recouvrement
      )

      const result = {
        total_du: totalDu,
        total_paye: totalPaye,
        taux_recouvrement: tauxRecouvrement,
        solde_impaye:
          Math.round(soldeImpaye * 100) / 100,
        projections: { j30, j60, j90 },
        coproprietaires_a_risque: coproprietairesARisque,
      }

      logger.info(
        `[CashFlowService] Forecast generated for copropriete ${coproprieteId}`
      )

      return result
    } catch (error) {
      logger.error(
        `[CashFlowService] Error generating forecast: ${error.message}`
      )
      throw error
    }
  }
}

export const cashFlowService = new CashFlowService()
