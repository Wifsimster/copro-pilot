/**
 * Seed: reglements de copropriete & articles
 * Creates structured bylaws and articles for each copropriete
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex('articles_reglement').del()
  await knex('reglements_copropriete').del()

  const now = new Date()
  const copros = await knex('coproprietes').select('id').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  const NOTAIRES = [
    'Me Laurent Dupont',
    'Me Catherine Moreau',
    'Me Philippe Lefèvre',
    'Me Isabelle Martin',
    'Me Jean-Pierre Durand',
    'SCP Bertrand & Associés',
    'Me Nathalie Rousseau',
    'Me François Garnier',
  ]

  const DESTINATIONS = ['habitation', 'mixte', 'habitation', 'commerce', 'mixte']

  const RESTRICTIONS = [
    "L'usage des lots à destination d'habitation est exclusivement résidentiel. Toute activité commerciale, artisanale ou libérale y est interdite sauf autorisation expresse de l'assemblée générale votée à la majorité de l'article 26.",
    "Les lots du rez-de-chaussée peuvent être affectés à un usage commercial ou professionnel. Les lots des étages supérieurs sont réservés à l'habitation. Les activités bruyantes ou malodorantes sont interdites.",
    "L'exercice d'une profession libérale est toléré dans les lots d'habitation sous réserve qu'il ne cause aucune nuisance au voisinage et ne modifie pas la destination de l'immeuble.",
    "Les locaux commerciaux du rez-de-chaussée ne peuvent être affectés à des activités de restauration, de discothèque ou de commerce alimentaire de détail sans accord préalable de l'AG.",
    "Tout changement d'affectation d'un lot nécessite une autorisation de l'assemblée générale à la double majorité de l'article 26 de la loi du 10 juillet 1965.",
  ]

  const CONDITIONS_TRAVAUX = [
    "Les travaux affectant les parties communes ou l'aspect extérieur de l'immeuble doivent être autorisés par l'assemblée générale. Les copropriétaires doivent soumettre un dossier technique au syndic au moins 30 jours avant l'AG.",
    "Les travaux privatifs ne modifiant pas les parties communes sont libres sous réserve de déclaration préalable au syndic. Les travaux générant des nuisances sonores sont limités aux jours ouvrables de 8h à 20h.",
    "Tout percement de murs porteurs, modification de façade ou installation d'équipements visibles depuis l'extérieur requiert une autorisation de l'AG à la majorité absolue de l'article 25.",
    "Les copropriétaires réalisant des travaux doivent souscrire une assurance dommages-ouvrage et fournir les attestations au syndic avant le début des travaux.",
    "L'installation d'une climatisation extérieure, d'une antenne parabolique ou de stores est soumise à autorisation de l'assemblée générale dans le respect du règlement d'urbanisme local.",
  ]

  const COMPOSITION_CS = [
    "Le conseil syndical est composé de 3 à 5 membres titulaires et 2 suppléants élus pour 3 ans par l'assemblée générale. Le président est élu parmi les membres du conseil.",
    "Le conseil syndical comprend au minimum 3 membres et au maximum 7 membres élus pour une durée de 3 ans renouvelable. Les membres sortants sont rééligibles.",
    "Le conseil syndical est composé de 5 membres titulaires et 3 suppléants. Il se réunit au moins une fois par trimestre sur convocation de son président.",
    "Le conseil syndical assiste le syndic et contrôle sa gestion. Il est composé de membres élus par l'AG parmi les copropriétaires ou leurs représentants.",
    "Nul ne peut être membre du conseil syndical s'il est débiteur de charges depuis plus de 3 mois. La perte de qualité de copropriétaire entraîne la cessation automatique du mandat.",
  ]

  const MODALITES_AG = [
    "La convocation à l'assemblée générale est adressée par lettre recommandée avec accusé de réception au moins 21 jours avant la date de la réunion. L'ordre du jour et les documents comptables sont joints à la convocation.",
    "L'assemblée générale ordinaire se réunit au moins une fois par an dans les 6 mois suivant la clôture de l'exercice. Des assemblées extraordinaires peuvent être convoquées à tout moment en cas d'urgence.",
    "Le syndic convoque l'AG sur demande du conseil syndical ou de copropriétaires représentant au moins 25% des voix. La convocation mentionne le lieu, la date, l'heure et l'ordre du jour.",
    "Les résolutions sont adoptées selon les règles de majorité prévues par la loi du 10 juillet 1965. Le procès-verbal est notifié aux copropriétaires opposants ou défaillants dans le mois suivant l'AG.",
    "Tout copropriétaire peut se faire représenter par un mandataire muni d'un pouvoir écrit. Un mandataire ne peut recevoir plus de 3 délégations, sauf si le total des voix dont il dispose n'excède pas 10% des voix.",
  ]

  const NOTES = [
    'Règlement établi lors de la mise en copropriété de l\'immeuble. Dernière mise à jour suite à la loi ELAN.',
    'Règlement conforme aux dispositions de la loi du 10 juillet 1965 et du décret du 17 mars 1967.',
    'Règlement modifié par l\'AG du 15 mars 2022 pour mise en conformité avec la loi ALUR.',
    'Règlement d\'origine avec modificatifs successifs. État descriptif de division annexé.',
    'Règlement refondu intégralement en 2020 pour intégrer les évolutions législatives récentes.',
  ]

  // Create one reglement per copropriete, some copros get a second (modified) one
  const reglementData = []

  for (let idx = 0; idx < coproIds.length; idx++) {
    const coproId = coproIds[idx]
    const yearBase = 1985 + (idx * 7) % 35

    // Main reglement
    reglementData.push({
      copropriete_id: coproId,
      date_etablissement: `${yearBase}-${String((idx % 12) + 1).padStart(2, '0')}-15`,
      date_derniere_modification: idx % 3 === 0 ? `${yearBase + 20}-03-22` : null,
      notaire: NOTAIRES[idx % NOTAIRES.length],
      destination_immeuble: DESTINATIONS[idx % DESTINATIONS.length],
      restrictions_usage: RESTRICTIONS[idx % RESTRICTIONS.length],
      conditions_travaux: CONDITIONS_TRAVAUX[idx % CONDITIONS_TRAVAUX.length],
      composition_conseil_syndical: COMPOSITION_CS[idx % COMPOSITION_CS.length],
      modalites_convocation_ag: MODALITES_AG[idx % MODALITES_AG.length],
      document_url: null,
      notes: NOTES[idx % NOTES.length],
      created_at: now,
      updated_at: now,
    })

    // Some copros get a second reglement (modified version)
    if (idx % 4 === 1) {
      reglementData.push({
        copropriete_id: coproId,
        date_etablissement: `${yearBase + 25}-06-10`,
        date_derniere_modification: null,
        notaire: NOTAIRES[(idx + 3) % NOTAIRES.length],
        destination_immeuble: 'mixte',
        restrictions_usage: RESTRICTIONS[(idx + 2) % RESTRICTIONS.length],
        conditions_travaux: CONDITIONS_TRAVAUX[(idx + 2) % CONDITIONS_TRAVAUX.length],
        composition_conseil_syndical: COMPOSITION_CS[(idx + 2) % COMPOSITION_CS.length],
        modalites_convocation_ag: MODALITES_AG[(idx + 2) % MODALITES_AG.length],
        document_url: null,
        notes: 'Règlement modificatif adopté en assemblée générale extraordinaire.',
        created_at: now,
        updated_at: now,
      })
    }
  }

  if (reglementData.length > 0) {
    await knex('reglements_copropriete').insert(reglementData)
  }

  // Fetch inserted reglements to get IDs
  const insertedReglements = await knex('reglements_copropriete')
    .select('id', 'copropriete_id', 'destination_immeuble')
    .orderBy('id')

  // Define article templates per category
  const ARTICLES = [
    // Parties privatives
    {
      categorie: 'parties_privatives',
      articles: [
        {
          titre: 'Définition des parties privatives',
          contenu: "Sont parties privatives les locaux compris dans chaque lot et leurs accessoires : revêtements intérieurs des sols, murs et plafonds, portes intérieures, fenêtres et volets (sauf menuiseries extérieures), installations sanitaires et de chauffage individuelles, canalisations intérieures jusqu'au branchement sur les colonnes communes.",
        },
        {
          titre: 'Jouissance des parties privatives',
          contenu: "Chaque copropriétaire use et jouit librement de ses parties privatives sous la condition de ne porter atteinte ni aux droits des autres copropriétaires ni à la destination de l'immeuble. Il ne peut modifier les parties privatives que dans le respect des dispositions du présent règlement.",
        },
        {
          titre: 'Cloisons intérieures',
          contenu: "Les cloisons séparatives entre lots sont présumées mitoyennes. Les cloisons intérieures non porteuses d'un même lot sont des parties privatives. La suppression ou le déplacement de cloisons non porteuses est libre sous réserve de déclaration préalable au syndic.",
        },
      ],
    },
    // Parties communes
    {
      categorie: 'parties_communes',
      articles: [
        {
          titre: 'Énumération des parties communes générales',
          contenu: "Sont parties communes générales : le sol, les cours, les jardins, les voies d'accès, le gros œuvre des bâtiments (fondations, murs porteurs, toitures), les éléments d'équipement commun (chaufferie, ascenseurs, canalisations principales), les coffres, gaines et têtes de cheminées, les locaux des services communs.",
        },
        {
          titre: 'Parties communes spéciales',
          contenu: "Constituent des parties communes spéciales les éléments d'équipement ou portions de bâtiment affectés à l'usage ou à l'utilité de certains copropriétaires seulement : escaliers, paliers, couloirs de chaque bâtiment, ascenseur de chaque cage d'escalier.",
        },
        {
          titre: "Usage des parties communes",
          contenu: "Les parties communes sont affectées à l'usage de tous les copropriétaires ou de certains d'entre eux. Aucun copropriétaire ne peut en faire un usage exclusif sans autorisation de l'assemblée générale. L'encombrement des parties communes (couloirs, escaliers, halls) est strictement interdit.",
        },
        {
          titre: 'Droit de surélévation',
          contenu: "Le droit de surélever le bâtiment ou de construire dans les cours, jardins ou espaces libres est réservé au syndicat des copropriétaires. Son exercice est subordonné à une décision de l'assemblée générale à l'unanimité.",
        },
      ],
    },
    // Charges
    {
      categorie: 'charges',
      articles: [
        {
          titre: 'Principes de répartition des charges',
          contenu: "Les charges sont réparties conformément aux dispositions de l'article 10 de la loi du 10 juillet 1965. Les charges relatives à la conservation, l'entretien et l'administration des parties communes sont réparties proportionnellement aux valeurs relatives des lots (tantièmes généraux).",
        },
        {
          titre: 'Charges spéciales',
          contenu: "Les charges entraînées par les services collectifs et les éléments d'équipement commun sont réparties en fonction de l'utilité objective que ces services et éléments présentent à l'égard de chaque lot. Les copropriétaires du rez-de-chaussée ne participent pas aux charges d'ascenseur.",
        },
        {
          titre: 'Appels de fonds et paiement',
          contenu: "Le syndic procède à des appels de fonds trimestriels correspondant au quart du budget prévisionnel voté. Les charges sont exigibles le premier jour de chaque trimestre. Tout retard de paiement donne lieu à des intérêts de retard au taux légal majoré.",
        },
        {
          titre: 'Fonds de travaux',
          contenu: "Conformément à l'article 14-2 de la loi du 10 juillet 1965, un fonds de travaux est constitué. La cotisation annuelle ne peut être inférieure à 2,5% du budget prévisionnel. Les sommes versées sont attachées aux lots et non remboursables.",
        },
      ],
    },
    // Usage
    {
      categorie: 'usage',
      articles: [
        {
          titre: 'Tranquillité de l\'immeuble',
          contenu: "Les copropriétaires et occupants doivent veiller à la tranquillité de l'immeuble. Les bruits excessifs, particulièrement entre 22h et 7h, sont interdits. Les travaux bruyants sont autorisés uniquement les jours ouvrables de 8h30 à 19h30 et le samedi de 9h à 12h.",
        },
        {
          titre: 'Animaux domestiques',
          contenu: "La détention d'animaux domestiques est autorisée sous réserve qu'ils ne causent aucun trouble de jouissance aux autres occupants. Les chiens doivent être tenus en laisse dans les parties communes. Les propriétaires sont responsables des dégradations causées par leurs animaux.",
        },
        {
          titre: 'Stationnement',
          contenu: "Le stationnement dans les voies de circulation de la copropriété est strictement interdit. Les places de parking numérotées sont réservées aux lots auxquels elles sont rattachées. Les véhicules en épave ou hors d'état de circuler doivent être retirés sous 15 jours après mise en demeure.",
        },
      ],
    },
    // Travaux
    {
      categorie: 'travaux',
      articles: [
        {
          titre: 'Travaux sur parties privatives',
          contenu: "Les copropriétaires peuvent réaliser librement des travaux dans leurs parties privatives, à condition de ne pas porter atteinte à la solidité de l'immeuble, de ne pas modifier l'aspect extérieur et de ne pas nuire aux droits des autres copropriétaires.",
        },
        {
          titre: 'Travaux sur parties communes',
          contenu: "Les travaux d'entretien courant des parties communes sont décidés par le syndic dans le cadre du budget prévisionnel. Les travaux d'amélioration ou de transformation sont soumis au vote de l'assemblée générale à la majorité requise selon leur nature.",
        },
        {
          titre: "Accès pour travaux",
          contenu: "Les copropriétaires doivent permettre l'accès à leurs parties privatives pour l'exécution de travaux intéressant les parties communes ou d'autres lots, sous réserve d'un préavis de 8 jours, sauf urgence. Les dommages éventuels sont indemnisés.",
        },
      ],
    },
    // Conseil syndical
    {
      categorie: 'conseil_syndical',
      articles: [
        {
          titre: 'Missions du conseil syndical',
          contenu: "Le conseil syndical assiste le syndic et contrôle sa gestion. Il donne son avis sur les questions soumises à l'assemblée générale, vérifie la comptabilité et les comptes du syndicat, et rend compte annuellement à l'AG de l'exécution de sa mission.",
        },
        {
          titre: 'Fonctionnement du conseil syndical',
          contenu: "Le conseil syndical se réunit au moins une fois par trimestre sur convocation de son président. Il peut consulter tout document relatif à la gestion de la copropriété. Ses décisions sont prises à la majorité de ses membres.",
        },
      ],
    },
    // AG
    {
      categorie: 'ag',
      articles: [
        {
          titre: 'Assemblée générale ordinaire',
          contenu: "L'assemblée générale ordinaire se réunit au moins une fois par an. Elle approuve les comptes, vote le budget prévisionnel, élit les membres du conseil syndical et délibère sur toute question inscrite à l'ordre du jour.",
        },
        {
          titre: 'Règles de majorité',
          contenu: "Les décisions de l'assemblée générale sont prises selon les règles de majorité définies par les articles 24, 25, 25-1 et 26 de la loi du 10 juillet 1965. Les décisions portant sur la modification du règlement de copropriété requièrent l'unanimité ou la double majorité selon les cas.",
        },
      ],
    },
    // Autre
    {
      categorie: 'autre',
      articles: [
        {
          titre: 'Assurances',
          contenu: "Le syndicat des copropriétaires souscrit une assurance couvrant les parties communes contre les risques incendie, dégât des eaux et responsabilité civile. Chaque copropriétaire est tenu de souscrire une assurance pour ses parties privatives incluant la garantie recours des voisins.",
        },
        {
          titre: 'Mutations et cessions',
          contenu: "En cas de mutation d'un lot, le notaire notifie au syndic la cession par lettre recommandée. Le copropriétaire cédant reste tenu solidairement avec l'acquéreur du paiement des charges échues à la date de la mutation.",
        },
      ],
    },
  ]

  const articleData = []

  for (const reglement of insertedReglements) {
    let ordre = 1
    let articleNum = 1

    for (const group of ARTICLES) {
      for (const article of group.articles) {
        articleData.push({
          reglement_id: reglement.id,
          numero: String(articleNum),
          titre: article.titre,
          contenu: article.contenu,
          categorie: group.categorie,
          ordre,
          notes: null,
          created_at: now,
          updated_at: now,
        })

        ordre++
        articleNum++
      }
    }
  }

  // Insert articles in chunks to avoid parameter limits
  const chunkSize = 50
  for (let i = 0; i < articleData.length; i += chunkSize) {
    await knex('articles_reglement').insert(articleData.slice(i, i + chunkSize))
  }
}
