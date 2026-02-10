import PDFDocument from 'pdfkit'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import logger from '../logger.js'

const MAJORITE_LABELS = {
  article_24: 'Article 24 (majorite simple)',
  article_25: 'Article 25 (majorite absolue)',
  article_26: 'Article 26 (double majorite)',
  unanimite: 'Unanimite',
}

const RESULTAT_LABELS = {
  adoptee: 'ADOPTEE',
  rejetee: 'REJETEE',
  ajournee: 'AJOURNEE',
}

const STATUT_LABELS = {
  present: 'Present',
  absent: 'Absent',
  represente: 'Represente',
}

class PvGenerationService {
  generatePdf(ag, copropriete) {
    logger.info(`[PvGenerationService] Generating PV for AG ${ag.id}`)

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `PV AG ${format(new Date(ag.date), 'dd/MM/yyyy')}`,
        Author: 'CoproPilot',
      },
    })

    this._addHeader(doc, ag, copropriete)
    this._addPresenceSection(doc, ag)
    this._addResolutionsSection(doc, ag)
    this._addFooter(doc, ag)

    doc.end()
    return doc
  }

  _addHeader(doc, ag, copropriete) {
    const dateStr = format(new Date(ag.date), 'dd MMMM yyyy', { locale: fr })

    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('PROCES-VERBAL', { align: 'center' })
      .moveDown(0.3)
      .fontSize(14)
      .text(
        `Assemblee Generale ${ag.type === 'ordinaire' ? 'Ordinaire' : 'Extraordinaire'}`,
        { align: 'center' }
      )
      .moveDown(1.5)

    doc.fontSize(10).font('Helvetica')
    if (copropriete) {
      doc.font('Helvetica-Bold').text('Copropriete : ', { continued: true })
      doc.font('Helvetica').text(copropriete.nom)
      if (copropriete.adresse) {
        doc.text(`Adresse : ${copropriete.adresse}`)
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

    if (ag.date_convocation) {
      doc.font('Helvetica-Bold').text('Date de convocation : ', { continued: true })
      doc
        .font('Helvetica')
        .text(format(new Date(ag.date_convocation), 'dd/MM/yyyy'))
    }

    doc.moveDown(1)

    // Separator line
    this._drawLine(doc)
    doc.moveDown(0.5)
  }

  _addPresenceSection(doc, ag) {
    const presences = ag.presences || []
    if (presences.length === 0) return

    const presents = presences.filter((p) => p.statut === 'present')
    const representes = presences.filter((p) => p.statut === 'represente')
    const absents = presences.filter((p) => p.statut === 'absent')
    const totalTantiemes = presences.reduce((s, p) => s + (p.tantiemes || 0), 0)
    const presentTantiemes = presences
      .filter((p) => p.statut !== 'absent')
      .reduce((s, p) => s + (p.tantiemes || 0), 0)

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('FEUILLE DE PRESENCE')
      .moveDown(0.5)

    doc.fontSize(10).font('Helvetica')
    doc.text(
      `Coproprietaires convoques : ${presences.length} | Presents : ${presents.length} | Representes : ${representes.length} | Absents : ${absents.length}`
    )
    doc.text(
      `Tantiemes representes : ${presentTantiemes} / ${totalTantiemes} (${totalTantiemes > 0 ? Math.round((presentTantiemes / totalTantiemes) * 100) : 0}%)`
    )
    doc.moveDown(0.5)

    // Presence table
    const tableTop = doc.y
    const col1 = 50
    const col2 = 250
    const col3 = 350
    const col4 = 460

    // Header row
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .text('Coproprietaire', col1, tableTop)
      .text('Statut', col2, tableTop)
      .text('Represente par', col3, tableTop)
      .text('Tantiemes', col4, tableTop)

    let yPos = tableTop + 18
    doc
      .moveTo(col1, yPos - 3)
      .lineTo(545, yPos - 3)
      .lineWidth(0.5)
      .stroke()

    doc.font('Helvetica').fontSize(9)
    for (const p of presences) {
      if (yPos > 730) {
        doc.addPage()
        yPos = 50
      }
      const nom = `${p.coproprietaire_prenom || ''} ${p.coproprietaire_nom || ''}`.trim()
      const repPar =
        p.statut === 'represente' && p.represente_par_nom
          ? `${p.represente_par_prenom || ''} ${p.represente_par_nom}`.trim()
          : '-'

      doc
        .text(nom, col1, yPos, { width: 195 })
        .text(STATUT_LABELS[p.statut] || p.statut, col2, yPos)
        .text(repPar, col3, yPos, { width: 105 })
        .text(String(p.tantiemes), col4, yPos)

      yPos += 16
    }

    doc.x = 50
    doc.y = yPos + 10
    this._drawLine(doc)
    doc.moveDown(0.5)
  }

  _addResolutionsSection(doc, ag) {
    const resolutions = ag.resolutions || []
    if (resolutions.length === 0) return

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('RESOLUTIONS')
      .moveDown(0.5)

    if (ag.ordre_du_jour) {
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Ordre du jour :')
        .font('Helvetica')
        .text(ag.ordre_du_jour)
        .moveDown(0.5)
    }

    for (const res of resolutions) {
      if (doc.y > 680) {
        doc.addPage()
      }

      // Resolution header
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`Resolution n\u00b0${res.numero} - ${res.titre}`)
        .moveDown(0.2)

      doc.fontSize(9).font('Helvetica')

      // Majorite
      doc.text(`Majorite requise : ${MAJORITE_LABELS[res.majorite] || res.majorite}`)

      if (res.description) {
        doc.text(res.description)
      }

      // Vote results
      if (res.voix_pour > 0 || res.voix_contre > 0 || res.abstentions > 0) {
        doc.moveDown(0.2)
        doc.text(
          `Voix pour : ${res.voix_pour}  |  Voix contre : ${res.voix_contre}  |  Abstentions : ${res.abstentions}`
        )
      }

      // Result
      if (res.resultat) {
        doc
          .moveDown(0.2)
          .font('Helvetica-Bold')
          .text(`Resultat : ${RESULTAT_LABELS[res.resultat] || res.resultat}`)
          .font('Helvetica')
      }

      doc.moveDown(0.8)
    }

    this._drawLine(doc)
    doc.moveDown(0.5)
  }

  _addFooter(doc, ag) {
    if (doc.y > 620) {
      doc.addPage()
    }

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text('SIGNATURES')
      .moveDown(0.5)

    doc.fontSize(10).font('Helvetica')

    if (ag.notes) {
      doc.text(`Notes : ${ag.notes}`).moveDown(0.5)
    }

    doc
      .text(
        "L'ordre du jour etant epuise, la seance est levee."
      )
      .moveDown(1.5)

    // Signature lines
    const sigY = doc.y
    const sigWidth = 200

    doc.font('Helvetica-Bold')
    doc.text('Le President de seance', 50, sigY)
    doc.text('Le Secretaire', 310, sigY)

    doc
      .moveTo(50, sigY + 50)
      .lineTo(50 + sigWidth, sigY + 50)
      .lineWidth(0.5)
      .stroke()

    doc
      .moveTo(310, sigY + 50)
      .lineTo(310 + sigWidth, sigY + 50)
      .lineWidth(0.5)
      .stroke()

    doc.y = sigY + 80

    // Generated mention
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#999999')
      .text(
        `Document genere par CoproPilot le ${format(new Date(), 'dd/MM/yyyy a HH:mm')}`,
        { align: 'center' }
      )
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

export const pvGenerationService = new PvGenerationService()
