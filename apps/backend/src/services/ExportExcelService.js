import ExcelJS from 'exceljs'
import logger from '../logger.js'

const HEADER_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1F4E79' },
}

const HEADER_FONT = {
  bold: true,
  color: { argb: 'FFFFFFFF' },
  size: 11,
}

const TOTAL_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE2EFDA' },
}

const TOTAL_FONT = {
  bold: true,
  size: 11,
}

class ExportExcelService {
  async generateCoproprietairesExcel(coproprietaires) {
    logger.info(`[ExportExcelService] Generating coproprietaires Excel (${coproprietaires.length} rows)`)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'CoproPilot'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('Coproprietaires')

    worksheet.columns = [
      { header: 'Nom', key: 'nom', width: 25 },
      { header: 'Prenom', key: 'prenom', width: 25 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Telephone', key: 'telephone', width: 20 },
      { header: 'Adresse correspondance', key: 'adresse_correspondance', width: 45 },
    ]

    this._styleHeaderRow(worksheet)

    for (const c of coproprietaires) {
      worksheet.addRow({
        nom: c.nom || '',
        prenom: c.prenom || '',
        email: c.email || '',
        telephone: c.telephone || '',
        adresse_correspondance: c.adresse_correspondance || '',
      })
    }

    worksheet.autoFilter = {
      from: 'A1',
      to: `E${coproprietaires.length + 1}`,
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
  }

  async generateBalanceComptesExcel(balances, copropriete) {
    logger.info(`[ExportExcelService] Generating balance des comptes Excel (${balances.length} rows)`)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'CoproPilot'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('Balance des comptes')

    // Add copropriete info header
    if (copropriete) {
      worksheet.addRow([`Balance des comptes - ${copropriete.nom}`])
      worksheet.mergeCells('A1:D1')
      const titleRow = worksheet.getRow(1)
      titleRow.font = { bold: true, size: 14 }
      titleRow.alignment = { horizontal: 'center' }
      worksheet.addRow([])
    }

    const headerRowNum = copropriete ? 3 : 1

    worksheet.columns = [
      { header: 'Coproprietaire', key: 'coproprietaire', width: 35 },
      { header: 'Total du', key: 'total_du', width: 18 },
      { header: 'Total paye', key: 'total_paye', width: 18 },
      { header: 'Solde', key: 'solde', width: 18 },
    ]

    // Re-set headers at proper row if copropriete info exists
    if (copropriete) {
      const row = worksheet.getRow(headerRowNum)
      row.values = ['Coproprietaire', 'Total du', 'Total paye', 'Solde']
      this._styleRow(row, HEADER_FILL, HEADER_FONT)
    } else {
      this._styleHeaderRow(worksheet)
    }

    let totalDu = 0
    let totalPaye = 0

    for (const b of balances) {
      const nom = `${b.prenom || ''} ${b.nom || ''}`.trim()
      const du = parseFloat(b.total_du || 0)
      const paye = parseFloat(b.total_paye || 0)
      const solde = du - paye
      totalDu += du
      totalPaye += paye

      const row = worksheet.addRow({
        coproprietaire: nom,
        total_du: du,
        total_paye: paye,
        solde: solde,
      })

      this._formatCurrencyCells(row, [2, 3, 4])
    }

    // Totals row
    const totalRow = worksheet.addRow({
      coproprietaire: 'TOTAL',
      total_du: totalDu,
      total_paye: totalPaye,
      solde: totalDu - totalPaye,
    })
    this._styleRow(totalRow, TOTAL_FILL, TOTAL_FONT)
    this._formatCurrencyCells(totalRow, [2, 3, 4])

    const lastRow = worksheet.rowCount
    worksheet.autoFilter = {
      from: `A${headerRowNum}`,
      to: `D${lastRow}`,
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
  }

  async generateEtatChargesExcel(postes, budget, copropriete) {
    logger.info(`[ExportExcelService] Generating etat des charges Excel (${postes.length} rows)`)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'CoproPilot'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('Etat des charges')

    // Add copropriete and budget info header
    const titleParts = ['Etat des charges']
    if (copropriete) titleParts.push(copropriete.nom)
    if (budget) titleParts.push(`Exercice ${budget.annee}`)

    worksheet.addRow([titleParts.join(' - ')])
    worksheet.mergeCells('A1:E1')
    const titleRow = worksheet.getRow(1)
    titleRow.font = { bold: true, size: 14 }
    titleRow.alignment = { horizontal: 'center' }
    worksheet.addRow([])

    worksheet.columns = [
      { header: 'Poste', key: 'poste', width: 30 },
      { header: 'Categorie', key: 'categorie', width: 25 },
      { header: 'Montant prevu', key: 'montant_prevu', width: 18 },
      { header: 'Montant reel', key: 'montant_reel', width: 18 },
      { header: 'Ecart', key: 'ecart', width: 18 },
    ]

    const headerRowNum = 3
    const row = worksheet.getRow(headerRowNum)
    row.values = ['Poste', 'Categorie', 'Montant prevu', 'Montant reel', 'Ecart']
    this._styleRow(row, HEADER_FILL, HEADER_FONT)

    let totalPrevu = 0
    let totalReel = 0

    for (const p of postes) {
      const prevu = parseFloat(p.montant_prevu || 0)
      const reel = parseFloat(p.montant_reel || 0)
      const ecart = reel - prevu
      totalPrevu += prevu
      totalReel += reel

      const dataRow = worksheet.addRow({
        poste: p.nom || '',
        categorie: p.categorie || '',
        montant_prevu: prevu,
        montant_reel: reel,
        ecart: ecart,
      })

      this._formatCurrencyCells(dataRow, [3, 4, 5])
    }

    // Totals row
    const totalRow = worksheet.addRow({
      poste: 'TOTAL',
      categorie: '',
      montant_prevu: totalPrevu,
      montant_reel: totalReel,
      ecart: totalReel - totalPrevu,
    })
    this._styleRow(totalRow, TOTAL_FILL, TOTAL_FONT)
    this._formatCurrencyCells(totalRow, [3, 4, 5])

    const lastRow = worksheet.rowCount
    worksheet.autoFilter = {
      from: `A${headerRowNum}`,
      to: `E${lastRow}`,
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
  }

  async generateEtatImpayesExcel(impayes, copropriete) {
    logger.info(`[ExportExcelService] Generating etat des impayes Excel (${impayes.length} rows)`)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'CoproPilot'
    workbook.created = new Date()

    const worksheet = workbook.addWorksheet('Etat des impayes')

    // Add copropriete info header
    const titleParts = ['Etat des impayes']
    if (copropriete) titleParts.push(copropriete.nom)

    worksheet.addRow([titleParts.join(' - ')])
    worksheet.mergeCells('A1:E1')
    const titleRow = worksheet.getRow(1)
    titleRow.font = { bold: true, size: 14 }
    titleRow.alignment = { horizontal: 'center' }
    worksheet.addRow([])

    worksheet.columns = [
      { header: 'Coproprietaire', key: 'coproprietaire', width: 35 },
      { header: 'Montant du', key: 'montant_du', width: 18 },
      { header: 'Montant paye', key: 'montant_paye', width: 18 },
      { header: 'Solde', key: 'solde', width: 18 },
      { header: 'Dernier paiement', key: 'date_dernier_paiement', width: 20 },
    ]

    const headerRowNum = 3
    const row = worksheet.getRow(headerRowNum)
    row.values = ['Coproprietaire', 'Montant du', 'Montant paye', 'Solde', 'Dernier paiement']
    this._styleRow(row, HEADER_FILL, HEADER_FONT)

    let totalDu = 0
    let totalPaye = 0

    for (const imp of impayes) {
      const nom = `${imp.prenom || ''} ${imp.nom || ''}`.trim()
      const du = parseFloat(imp.montant_du || 0)
      const paye = parseFloat(imp.montant_paye || 0)
      const solde = du - paye
      totalDu += du
      totalPaye += paye

      const dataRow = worksheet.addRow({
        coproprietaire: nom,
        montant_du: du,
        montant_paye: paye,
        solde: solde,
        date_dernier_paiement: imp.date_dernier_paiement
          ? new Date(imp.date_dernier_paiement).toLocaleDateString('fr-FR')
          : '-',
      })

      this._formatCurrencyCells(dataRow, [2, 3, 4])
    }

    // Totals row
    const totalRow = worksheet.addRow({
      coproprietaire: 'TOTAL',
      montant_du: totalDu,
      montant_paye: totalPaye,
      solde: totalDu - totalPaye,
      date_dernier_paiement: '',
    })
    this._styleRow(totalRow, TOTAL_FILL, TOTAL_FONT)
    this._formatCurrencyCells(totalRow, [2, 3, 4])

    const lastRow = worksheet.rowCount
    worksheet.autoFilter = {
      from: `A${headerRowNum}`,
      to: `E${lastRow}`,
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return buffer
  }

  _styleHeaderRow(worksheet) {
    const headerRow = worksheet.getRow(1)
    this._styleRow(headerRow, HEADER_FILL, HEADER_FONT)
  }

  _styleRow(row, fill, font) {
    row.eachCell((cell) => {
      cell.fill = fill
      cell.font = font
      cell.alignment = { vertical: 'middle' }
    })
  }

  _formatCurrencyCells(row, colNumbers) {
    for (const colNum of colNumbers) {
      const cell = row.getCell(colNum)
      cell.numFmt = '#,##0.00 "EUR"'
    }
  }
}

export const exportExcelService = new ExportExcelService()
