import PDFDocument from 'pdfkit'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import logger from '../logger.js'

const TRIMESTRE_LABELS = {
  1: '1er trimestre',
  2: '2e trimestre',
  3: '3e trimestre',
  4: '4e trimestre',
}

const STATUT_LABELS = {
  present: 'Present',
  absent: 'Absent',
  represente: 'Represente',
}

const ROW_LIMIT_WARNING = 5000

class ExportPdfService {
  generateBudgetPdf(budget, postes, copropriete) {
    if (postes.length > ROW_LIMIT_WARNING) {
      logger.warn(
        `[ExportPdfService] Budget PDF for ${budget.id} has ${postes.length} rows — large PDF generation may use significant memory`
      )
    }
    logger.info(`[ExportPdfService] Generating budget PDF for budget ${budget.id}`)

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Budget previsionnel ${budget.annee}`,
        Author: 'CoproPilot',
      },
    })

    // Header
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('BUDGET PREVISIONNEL', { align: 'center' })
      .moveDown(0.3)
      .fontSize(14)
      .text(`Exercice ${budget.annee}`, { align: 'center' })
      .moveDown(1.5)

    // Copropriete info
    doc.fontSize(10).font('Helvetica')
    if (copropriete) {
      doc.font('Helvetica-Bold').text('Copropriete : ', { continued: true })
      doc.font('Helvetica').text(copropriete.nom)
      if (copropriete.adresse) {
        doc.text(`Adresse : ${copropriete.adresse}, ${copropriete.code_postal || ''} ${copropriete.ville || ''}`)
      }
      doc.moveDown(0.5)
    }

    doc.font('Helvetica-Bold').text('Annee : ', { continued: true })
    doc.font('Helvetica').text(String(budget.annee))

    if (budget.statut) {
      doc.font('Helvetica-Bold').text('Statut : ', { continued: true })
      doc.font('Helvetica').text(budget.statut)
    }

    if (budget.date_vote) {
      doc.font('Helvetica-Bold').text('Date de vote : ', { continued: true })
      doc.font('Helvetica').text(format(new Date(budget.date_vote), 'dd/MM/yyyy'))
    }

    doc.moveDown(1)
    this._drawLine(doc)
    doc.moveDown(0.5)

    // Table header
    const tableTop = doc.y
    const col1 = 50
    const col2 = 200
    const col3 = 310
    const col4 = 420

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('Poste', col1, tableTop, { width: 145 })
      .text('Categorie', col2, tableTop, { width: 105 })
      .text('Montant prevu', col3, tableTop, { width: 105, align: 'right' })
      .text('Montant reel', col4, tableTop, { width: 105, align: 'right' })

    let yPos = tableTop + 18
    doc
      .moveTo(col1, yPos - 3)
      .lineTo(545, yPos - 3)
      .lineWidth(0.5)
      .stroke()

    // Table rows
    doc.font('Helvetica').fontSize(9)
    let totalPrevu = 0
    let totalReel = 0

    for (const poste of postes) {
      if (yPos > 730) {
        doc.addPage()
        doc.x = 50
        yPos = 50
      }

      const montantPrevu = parseFloat(poste.montant_prevu || 0)
      const montantReel = parseFloat(poste.montant_reel || 0)
      totalPrevu += montantPrevu
      totalReel += montantReel

      doc
        .text(poste.nom || '-', col1, yPos, { width: 145 })
        .text(poste.categorie || '-', col2, yPos, { width: 105 })
        .text(this._formatMontant(montantPrevu), col3, yPos, { width: 105, align: 'right' })
        .text(this._formatMontant(montantReel), col4, yPos, { width: 105, align: 'right' })

      yPos += 16
    }

    // Total row
    yPos += 4
    doc
      .moveTo(col1, yPos - 3)
      .lineTo(545, yPos - 3)
      .lineWidth(0.5)
      .stroke()

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('TOTAL', col1, yPos, { width: 145 })
      .text(this._formatMontant(totalPrevu), col3, yPos, { width: 105, align: 'right' })
      .text(this._formatMontant(totalReel), col4, yPos, { width: 105, align: 'right' })

    doc.x = 50
    doc.y = yPos + 30

    if (budget.notes) {
      doc.font('Helvetica').fontSize(9)
      doc.font('Helvetica-Bold').text('Notes : ', { continued: true })
      doc.font('Helvetica').text(budget.notes)
    }

    // Footer
    this._addGenerationFooter(doc)

    doc.end()
    return doc
  }

  generateAppelFondsPdf(appel, lignes, copropriete) {
    if (lignes.length > ROW_LIMIT_WARNING) {
      logger.warn(
        `[ExportPdfService] Appel de fonds PDF for ${appel.id} has ${lignes.length} rows — large PDF generation may use significant memory`
      )
    }
    logger.info(`[ExportPdfService] Generating appel de fonds PDF for appel ${appel.id}`)

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Appel de fonds ${TRIMESTRE_LABELS[appel.trimestre] || ''} ${appel.annee}`,
        Author: 'CoproPilot',
      },
    })

    // Header
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('APPEL DE FONDS', { align: 'center' })
      .moveDown(0.3)
      .fontSize(14)
      .text(
        `${TRIMESTRE_LABELS[appel.trimestre] || `Trimestre ${appel.trimestre}`} ${appel.annee}`,
        { align: 'center' }
      )
      .moveDown(1.5)

    // Copropriete info
    doc.fontSize(10).font('Helvetica')
    if (copropriete) {
      doc.font('Helvetica-Bold').text('Copropriete : ', { continued: true })
      doc.font('Helvetica').text(copropriete.nom)
      if (copropriete.adresse) {
        doc.text(`Adresse : ${copropriete.adresse}, ${copropriete.code_postal || ''} ${copropriete.ville || ''}`)
      }
      doc.moveDown(0.5)
    }

    if (appel.date_emission) {
      doc.font('Helvetica-Bold').text('Date d\'emission : ', { continued: true })
      doc.font('Helvetica').text(format(new Date(appel.date_emission), 'dd/MM/yyyy'))
    }

    if (appel.date_echeance) {
      doc.font('Helvetica-Bold').text('Date d\'echeance : ', { continued: true })
      doc.font('Helvetica').text(format(new Date(appel.date_echeance), 'dd/MM/yyyy'))
    }

    doc.font('Helvetica-Bold').text('Montant total : ', { continued: true })
    doc.font('Helvetica').text(this._formatMontant(appel.montant_total))

    doc.moveDown(1)
    this._drawLine(doc)
    doc.moveDown(0.5)

    // Table header
    const tableTop = doc.y
    const col1 = 50
    const col2 = 200
    const col3 = 310
    const col4 = 420

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('Coproprietaire', col1, tableTop, { width: 145 })
      .text('Lot', col2, tableTop, { width: 105 })
      .text('Tantiemes', col3, tableTop, { width: 105, align: 'right' })
      .text('Montant', col4, tableTop, { width: 105, align: 'right' })

    let yPos = tableTop + 18
    doc
      .moveTo(col1, yPos - 3)
      .lineTo(545, yPos - 3)
      .lineWidth(0.5)
      .stroke()

    // Table rows
    doc.font('Helvetica').fontSize(9)
    let totalMontant = 0

    for (const ligne of lignes) {
      if (yPos > 730) {
        doc.addPage()
        doc.x = 50
        yPos = 50
      }

      const nom = `${ligne.coproprietaire_prenom || ''} ${ligne.coproprietaire_nom || ''}`.trim() || '-'
      const montant = parseFloat(ligne.montant || 0)
      totalMontant += montant

      doc
        .text(nom, col1, yPos, { width: 145 })
        .text(ligne.lot_numero || '-', col2, yPos, { width: 105 })
        .text(String(ligne.tantiemes || '-'), col3, yPos, { width: 105, align: 'right' })
        .text(this._formatMontant(montant), col4, yPos, { width: 105, align: 'right' })

      yPos += 16
    }

    // Total row
    yPos += 4
    doc
      .moveTo(col1, yPos - 3)
      .lineTo(545, yPos - 3)
      .lineWidth(0.5)
      .stroke()

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('TOTAL', col1, yPos, { width: 145 })
      .text(this._formatMontant(totalMontant), col4, yPos, { width: 105, align: 'right' })

    doc.x = 50
    doc.y = yPos + 30

    // Footer
    this._addGenerationFooter(doc)

    doc.end()
    return doc
  }

  generateFeuillePresencePdf(ag, presences, copropriete) {
    if (presences.length > ROW_LIMIT_WARNING) {
      logger.warn(
        `[ExportPdfService] Feuille de presence PDF for AG ${ag.id} has ${presences.length} rows — large PDF generation may use significant memory`
      )
    }
    logger.info(`[ExportPdfService] Generating feuille de presence PDF for AG ${ag.id}`)

    const dateStr = ag.date
      ? format(new Date(ag.date), 'dd MMMM yyyy', { locale: fr })
      : '-'

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Feuille de presence AG ${dateStr}`,
        Author: 'CoproPilot',
      },
    })

    // Header
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('FEUILLE DE PRESENCE', { align: 'center' })
      .moveDown(0.3)
      .fontSize(14)
      .text(
        `Assemblee Generale ${ag.type === 'ordinaire' ? 'Ordinaire' : 'Extraordinaire'}`,
        { align: 'center' }
      )
      .moveDown(1.5)

    // Copropriete info
    doc.fontSize(10).font('Helvetica')
    if (copropriete) {
      doc.font('Helvetica-Bold').text('Copropriete : ', { continued: true })
      doc.font('Helvetica').text(copropriete.nom)
      if (copropriete.adresse) {
        doc.text(`Adresse : ${copropriete.adresse}, ${copropriete.code_postal || ''} ${copropriete.ville || ''}`)
      }
      doc.moveDown(0.5)
    }

    doc.font('Helvetica-Bold').text('Date : ', { continued: true })
    doc.font('Helvetica').text(dateStr)

    if (ag.heure) {
      doc.font('Helvetica-Bold').text('Heure : ', { continued: true })
      doc.font('Helvetica').text(ag.heure)
    }

    if (ag.lieu) {
      doc.font('Helvetica-Bold').text('Lieu : ', { continued: true })
      doc.font('Helvetica').text(ag.lieu)
    }

    doc.moveDown(1)
    this._drawLine(doc)
    doc.moveDown(0.5)

    // Table header
    const tableTop = doc.y
    const col1 = 50
    const col2 = 180
    const col3 = 260
    const col4 = 370
    const col5 = 460

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('Coproprietaire', col1, tableTop, { width: 125 })
      .text('Statut', col2, tableTop, { width: 75 })
      .text('Represente par', col3, tableTop, { width: 105 })
      .text('Tantiemes', col4, tableTop, { width: 85, align: 'right' })
      .text('Signature', col5, tableTop, { width: 85 })

    let yPos = tableTop + 18
    doc
      .moveTo(col1, yPos - 3)
      .lineTo(545, yPos - 3)
      .lineWidth(0.5)
      .stroke()

    // Table rows
    doc.font('Helvetica').fontSize(9)

    for (const p of presences) {
      if (yPos > 730) {
        doc.addPage()
        doc.x = 50
        yPos = 50
      }

      const nom = `${p.coproprietaire_prenom || ''} ${p.coproprietaire_nom || ''}`.trim() || '-'
      const repPar =
        p.statut === 'represente' && p.represente_par_nom
          ? `${p.represente_par_prenom || ''} ${p.represente_par_nom}`.trim()
          : '-'

      doc
        .text(nom, col1, yPos, { width: 125 })
        .text(STATUT_LABELS[p.statut] || p.statut, col2, yPos, { width: 75 })
        .text(repPar, col3, yPos, { width: 105 })
        .text(String(p.tantiemes || 0), col4, yPos, { width: 85, align: 'right' })

      // Signature box (empty rectangle)
      doc
        .rect(col5, yPos - 2, 70, 14)
        .lineWidth(0.5)
        .stroke()

      yPos += 18
    }

    // Summary
    const totalTantiemes = presences.reduce((s, p) => s + (p.tantiemes || 0), 0)
    const presents = presences.filter((p) => p.statut === 'present')
    const representes = presences.filter((p) => p.statut === 'represente')
    const absents = presences.filter((p) => p.statut === 'absent')

    doc.x = 50
    doc.y = yPos + 10
    this._drawLine(doc)
    doc.moveDown(0.5)

    doc.fontSize(10).font('Helvetica')
    doc.text(
      `Total convoques : ${presences.length} | Presents : ${presents.length} | Representes : ${representes.length} | Absents : ${absents.length}`
    )
    doc.text(`Total tantiemes representes : ${totalTantiemes}`)

    doc.moveDown(1)

    // Footer
    this._addGenerationFooter(doc)

    doc.end()
    return doc
  }

  generateCarnetEntretienPdf(entries, copropriete) {
    if (entries.length > ROW_LIMIT_WARNING) {
      logger.warn(
        `[ExportPdfService] Carnet d'entretien PDF for copropriete ${copropriete?.id} has ${entries.length} rows — large PDF generation may use significant memory`
      )
    }
    logger.info(`[ExportPdfService] Generating carnet d'entretien PDF for copropriete ${copropriete?.id}`)

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Carnet d'entretien - ${copropriete?.nom || ''}`,
        Author: 'CoproPilot',
      },
    })

    // Header
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('CARNET D\'ENTRETIEN', { align: 'center' })
      .moveDown(1.5)

    // Copropriete info
    doc.fontSize(10).font('Helvetica')
    if (copropriete) {
      doc.font('Helvetica-Bold').text('Copropriete : ', { continued: true })
      doc.font('Helvetica').text(copropriete.nom)
      if (copropriete.adresse) {
        doc.text(`Adresse : ${copropriete.adresse}, ${copropriete.code_postal || ''} ${copropriete.ville || ''}`)
      }
      doc.moveDown(0.5)
    }

    doc.moveDown(1)
    this._drawLine(doc)
    doc.moveDown(0.5)

    // Table header
    const tableTop = doc.y
    const col1 = 50
    const col2 = 115
    const col3 = 225
    const col4 = 335
    const col5 = 430
    const col6 = 495

    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('Date', col1, tableTop, { width: 60 })
      .text('Titre', col2, tableTop, { width: 105 })
      .text('Description', col3, tableTop, { width: 105 })
      .text('Prestataire', col4, tableTop, { width: 90 })
      .text('Montant', col5, tableTop, { width: 60, align: 'right' })
      .text('Categorie', col6, tableTop, { width: 50 })

    let yPos = tableTop + 16
    doc
      .moveTo(col1, yPos - 3)
      .lineTo(545, yPos - 3)
      .lineWidth(0.5)
      .stroke()

    // Table rows
    doc.font('Helvetica').fontSize(8)

    for (const entry of entries) {
      if (yPos > 730) {
        doc.addPage()
        doc.x = 50
        yPos = 50
      }

      const dateStr = entry.date_realisation
        ? format(new Date(entry.date_realisation), 'dd/MM/yyyy')
        : '-'

      doc
        .text(dateStr, col1, yPos, { width: 60 })
        .text(entry.titre || '-', col2, yPos, { width: 105 })
        .text(entry.description || '-', col3, yPos, { width: 105 })
        .text(entry.prestataire || '-', col4, yPos, { width: 90 })
        .text(
          entry.montant ? this._formatMontant(entry.montant) : '-',
          col5, yPos, { width: 60, align: 'right' }
        )
        .text(entry.categorie || '-', col6, yPos, { width: 50 })

      yPos += 18
    }

    if (entries.length === 0) {
      doc.text('Aucune entree dans le carnet d\'entretien.', col1, yPos)
      yPos += 18
    }

    doc.x = 50
    doc.y = yPos + 10

    // Footer
    this._addGenerationFooter(doc)

    doc.end()
    return doc
  }

  generateEtatImpayesPdf(impayes, copropriete) {
    if (impayes.length > ROW_LIMIT_WARNING) {
      logger.warn(
        `[ExportPdfService] Etat des impayes PDF for copropriete ${copropriete?.id} has ${impayes.length} rows — large PDF generation may use significant memory`
      )
    }
    logger.info(`[ExportPdfService] Generating etat des impayes PDF for copropriete ${copropriete?.id}`)

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Etat des impayes - ${copropriete?.nom || ''}`,
        Author: 'CoproPilot',
      },
    })

    // Header
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('ETAT DES IMPAYES', { align: 'center' })
      .moveDown(1.5)

    // Copropriete info
    doc.fontSize(10).font('Helvetica')
    if (copropriete) {
      doc.font('Helvetica-Bold').text('Copropriete : ', { continued: true })
      doc.font('Helvetica').text(copropriete.nom)
      if (copropriete.adresse) {
        doc.text(`Adresse : ${copropriete.adresse}, ${copropriete.code_postal || ''} ${copropriete.ville || ''}`)
      }
      doc.moveDown(0.5)
    }

    doc.font('Helvetica-Bold').text('Date d\'edition : ', { continued: true })
    doc.font('Helvetica').text(format(new Date(), 'dd/MM/yyyy'))

    doc.moveDown(1)
    this._drawLine(doc)
    doc.moveDown(0.5)

    // Table header
    const tableTop = doc.y
    const col1 = 50
    const col2 = 200
    const col3 = 300
    const col4 = 390
    const col5 = 470

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('Coproprietaire', col1, tableTop, { width: 145 })
      .text('Montant du', col2, tableTop, { width: 95, align: 'right' })
      .text('Montant paye', col3, tableTop, { width: 85, align: 'right' })
      .text('Solde', col4, tableTop, { width: 75, align: 'right' })
      .text('Dernier paiement', col5, tableTop, { width: 75 })

    let yPos = tableTop + 18
    doc
      .moveTo(col1, yPos - 3)
      .lineTo(545, yPos - 3)
      .lineWidth(0.5)
      .stroke()

    // Table rows
    doc.font('Helvetica').fontSize(9)
    let totalDu = 0
    let totalPaye = 0

    for (const imp of impayes) {
      if (yPos > 730) {
        doc.addPage()
        doc.x = 50
        yPos = 50
      }

      const nom = `${imp.prenom || ''} ${imp.nom || ''}`.trim() || '-'
      const montantDu = parseFloat(imp.montant_du || 0)
      const montantPaye = parseFloat(imp.montant_paye || 0)
      const solde = montantDu - montantPaye
      totalDu += montantDu
      totalPaye += montantPaye

      const dernierPaiement = imp.date_dernier_paiement
        ? format(new Date(imp.date_dernier_paiement), 'dd/MM/yyyy')
        : '-'

      doc
        .text(nom, col1, yPos, { width: 145 })
        .text(this._formatMontant(montantDu), col2, yPos, { width: 95, align: 'right' })
        .text(this._formatMontant(montantPaye), col3, yPos, { width: 85, align: 'right' })

      // Highlight negative solde in red
      if (solde > 0) {
        doc.fillColor('#cc0000')
      }
      doc.text(this._formatMontant(solde), col4, yPos, { width: 75, align: 'right' })
      doc.fillColor('#000000')

      doc.text(dernierPaiement, col5, yPos, { width: 75 })

      yPos += 16
    }

    if (impayes.length === 0) {
      doc.text('Aucun impaye.', col1, yPos)
      yPos += 16
    }

    // Total row
    yPos += 4
    doc
      .moveTo(col1, yPos - 3)
      .lineTo(545, yPos - 3)
      .lineWidth(0.5)
      .stroke()

    const totalSolde = totalDu - totalPaye

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('TOTAL', col1, yPos, { width: 145 })
      .text(this._formatMontant(totalDu), col2, yPos, { width: 95, align: 'right' })
      .text(this._formatMontant(totalPaye), col3, yPos, { width: 85, align: 'right' })

    if (totalSolde > 0) {
      doc.fillColor('#cc0000')
    }
    doc.text(this._formatMontant(totalSolde), col4, yPos, { width: 75, align: 'right' })
    doc.fillColor('#000000')

    doc.x = 50
    doc.y = yPos + 30

    // Footer
    this._addGenerationFooter(doc)

    doc.end()
    return doc
  }

  _formatMontant(value) {
    const num = parseFloat(value || 0)
    return num.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    })
  }

  _addGenerationFooter(doc) {
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#999999')
      .text(
        `Document généré par CoproPilot le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`,
        { align: 'center' }
      )
      .fillColor('#000000')
  }

  _drawLine(doc) {
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .lineWidth(0.5)
      .strokeColor('#cccccc')
      .stroke()
      .strokeColor('#000000')
  }
}

export const exportPdfService = new ExportPdfService()
