export interface FaqItem {
  question: string
  answer: string
}

export const faqs: FaqItem[] = [
  {
    question: "C'est vraiment gratuit ?",
    answer:
      "Oui. Le plan Cloud Gratuit vous donne accès à la gestion"
      + " complète d'une copropriété de 20 lots maximum, sans"
      + " limite de durée et sans carte bancaire. Vous n'évoluez"
      + " vers un plan payant que si vous en avez besoin.",
  },
  {
    question:
      'Je suis syndic bénévole, est-ce fait pour moi ?',
    answer:
      "Absolument, c'est notre cible principale. CoproPilot a"
      + " été conçu pour être utilisable sans formation, même si"
      + " vous n'êtes pas à l'aise avec l'informatique."
      + " L'interface est simple et vous guide à chaque étape.",
  },
  {
    question:
      'Est-ce que mes données sont en sécurité ?',
    answer:
      'Vos données sont hébergées en France, conformément au'
      + ' RGPD. Nous effectuons des sauvegardes quotidiennes et'
      + ' utilisons un chiffrement pour toutes les'
      + ' communications. Le code source est auditable'
      + ' publiquement.',
  },
  {
    question:
      'Puis-je importer mes données existantes ?',
    answer:
      "Nous vous accompagnons pour la reprise de vos données"
      + " (copropriétés, lots, soldes) lors de la mise en route."
      + " Pour les plans Entreprise, cette reprise est prise en"
      + " charge par notre équipe. L'import en autonomie depuis un"
      + " fichier Excel est en cours de développement.",
  },
  {
    question: 'Que se passe-t-il si je dépasse 20 lots ?',
    answer:
      "Vous recevrez une notification vous invitant à passer au"
      + " plan Essentiel (19 €/mois). Vos données restent"
      + " accessibles en lecture, vous ne perdez jamais rien."
      + " La mise à niveau se fait en un clic.",
  },
  {
    question: "Y a-t-il un engagement ?",
    answer:
      "Aucun engagement. Tous les plans payants sont mensuels,"
      + " résiliables à tout moment. Vous pouvez exporter"
      + " l'intégralité de vos données en un clic à tout moment.",
  },
]
