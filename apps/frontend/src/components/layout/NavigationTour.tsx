import { useEffect, useRef, useCallback } from 'react'
import { driver, type DriveStep, type Driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { isCoproprietaire } from '@/utils/roleAccess'

interface NavigationTourProps {
  run: boolean
  onFinish: () => void
  role?: string
}

const syndicSteps: DriveStep[] = [
  {
    popover: {
      title: 'Bienvenue sur CoproPilot',
      description:
        'Découvrez les fonctionnalités principales de votre outil de gestion de copropriété. Cette visite guidée vous présente les éléments clés de l\'interface.',
    },
  },
  {
    element: '[data-tour="sidebar"]',
    popover: {
      title: 'Menu de navigation',
      description:
        'Le menu latéral vous donne accès à toutes les sections de l\'application. Les catégories sont repliables pour garder une vue claire.',
    },
  },
  {
    element: '[data-tour="copropriete-selector"]',
    popover: {
      title: 'Sélecteur de copropriété',
      description:
        'Choisissez la copropriété sur laquelle vous souhaitez travailler. Les données affichées seront filtrées en conséquence.',
    },
  },
  {
    element: '[data-tour="global-search"]',
    popover: {
      title: 'Recherche globale',
      description:
        'Recherchez rapidement des copropriétés, copropriétaires ou documents. Utilisez le raccourci Ctrl+K (ou Cmd+K sur Mac) pour y accéder instantanément.',
    },
  },
  {
    element: '[data-tour="notifications"]',
    popover: {
      title: 'Notifications',
      description:
        'Consultez vos notifications en temps réel : alertes, rappels d\'assemblées, échéances de contrats et bien plus.',
    },
  },
  {
    element: '[data-tour="section-overview"]',
    popover: {
      title: 'Vue d\'ensemble',
      description:
        'Accédez au tableau de bord, à la liste des copropriétés et des copropriétaires depuis cette section.',
    },
  },
  {
    element: '[data-tour="section-gestion"]',
    popover: {
      title: 'Gestion courante',
      description:
        'Gérez les charges, les assemblées générales, le conseil syndical et consultez les fiches synthétiques de vos copropriétés.',
    },
  },
  {
    element: '[data-tour="section-finances"]',
    popover: {
      title: 'Finances',
      description:
        'Suivez la comptabilité réglementaire, les comptes bancaires, les assurances et les dossiers contentieux.',
    },
  },
  {
    element: '[data-tour="section-administration"]',
    popover: {
      title: 'Administration',
      description:
        'Gérez les documents, les règlements, l\'immatriculation, les contrats syndic et les exports de données.',
    },
  },
  {
    element: '[data-tour="user-profile"]',
    popover: {
      title: 'Votre profil',
      description:
        'Accédez à vos paramètres personnels, changez le thème de l\'application ou déconnectez-vous depuis ce menu.',
    },
  },
]

const coproSteps: DriveStep[] = [
  {
    popover: {
      title: 'Bienvenue sur votre espace copropriétaire',
      description:
        'Découvrez votre portail personnalisé. Cette visite guidée vous présente les fonctionnalités à votre disposition pour suivre votre copropriété.',
    },
  },
  {
    element: '[data-tour="sidebar"]',
    popover: {
      title: 'Menu de navigation',
      description:
        'Accédez à votre espace copropriétaire depuis le menu latéral. Retrouvez ici les sections disponibles pour suivre votre copropriété.',
    },
  },
  {
    element: '[data-tour="global-search"]',
    popover: {
      title: 'Recherche',
      description:
        'Recherchez des documents, assemblées et informations liées à vos copropriétés. Utilisez le raccourci Ctrl+K (ou Cmd+K sur Mac) pour y accéder instantanément.',
    },
  },
  {
    element: '[data-tour="notifications"]',
    popover: {
      title: 'Notifications',
      description:
        'Consultez vos notifications : rappels d\'assemblées générales, appels de fonds, signalements d\'incidents et autres informations importantes.',
    },
  },
  {
    element: '[data-tour="user-profile"]',
    popover: {
      title: 'Votre profil',
      description:
        'Accédez à vos paramètres personnels, changez le thème de l\'application ou déconnectez-vous depuis ce menu.',
    },
  },
]

export function NavigationTour({ run, onFinish, role }: NavigationTourProps) {
  const driverRef = useRef<Driver | null>(null)

  const handleFinish = useCallback(() => {
    onFinish()
  }, [onFinish])

  useEffect(() => {
    if (!run) {
      if (driverRef.current) {
        driverRef.current.destroy()
        driverRef.current = null
      }
      return
    }

    const activeSteps = isCoproprietaire(role) ? coproSteps : syndicSteps

    const instance = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.6)',
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'copropilot-tour',
      nextBtnText: 'Suivant',
      prevBtnText: 'Précédent',
      doneBtnText: 'Terminer',
      progressText: '{{current}} sur {{total}}',
      steps: activeSteps,
      onDestroyStarted: () => {
        instance.destroy()
        handleFinish()
      },
    })

    driverRef.current = instance

    // Small delay to let the DOM settle before starting
    const timer = setTimeout(() => {
      instance.drive()
    }, 300)

    return () => {
      clearTimeout(timer)
      if (driverRef.current) {
        driverRef.current.destroy()
        driverRef.current = null
      }
    }
  }, [run, handleFinish, role])

  return null
}
