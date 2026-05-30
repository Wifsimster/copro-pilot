import {
  Building2,
  LayoutDashboard,
  UserCircle,
  Users,
  Receipt,
  Calendar,
  Wrench,
  FolderOpen,
  FileText,
  Landmark,
  UsersRound,
  Handshake,
  Shield,
  Scale,
  Calculator,
  HardHat,
  BookOpen,
  ClipboardList,
  Stamp,
  FileDown,
  CreditCard,
  PiggyBank,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

export interface NavSection {
  key: string
  label: string
  collapsible: boolean
  items: NavItem[]
}

export function isItemActive(pathname: string, href: string) {
  return href === '/' || href === '/extranet'
    ? pathname === href
    : pathname.startsWith(href)
}

export const navigationSections: NavSection[] = [
  {
    key: 'overview',
    label: 'Vue d\'ensemble',
    collapsible: false,
    items: [
      { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Espace copropriétaire', href: '/extranet', icon: UserCircle },
      { name: 'Copropriétés', href: '/coproprietes', icon: Building2 },
      { name: 'Copropriétaires', href: '/coproprietaires', icon: Users },
    ],
  },
  {
    key: 'gestion',
    label: 'Gestion',
    collapsible: true,
    items: [
      { name: 'Charges', href: '/charges', icon: Receipt },
      { name: 'Assemblées', href: '/assemblees', icon: Calendar },
      { name: 'Conseil syndical', href: '/conseil-syndical', icon: UsersRound },
      { name: 'Messagerie', href: '/tickets', icon: MessageSquare },
      { name: 'Fiche synthétique', href: '/fiche-synthetique', icon: FileText },
    ],
  },
  {
    key: 'technique',
    label: 'Technique',
    collapsible: true,
    items: [
      { name: 'Travaux', href: '/travaux', icon: Wrench },
      { name: 'Contrats', href: '/contrats', icon: Handshake },
      { name: 'Employés', href: '/employes', icon: HardHat },
    ],
  },
  {
    key: 'finances',
    label: 'Finances',
    collapsible: true,
    items: [
      { name: 'Comptabilite', href: '/comptabilite-reglementaire', icon: Calculator },
      { name: 'Comptes bancaires', href: '/comptes-bancaires', icon: Landmark },
      { name: 'Assurances', href: '/assurances', icon: Shield },
      { name: 'Contentieux', href: '/contentieux', icon: Scale },
    ],
  },
  {
    key: 'administration',
    label: 'Administration',
    collapsible: true,
    items: [
      { name: 'Documents', href: '/documents', icon: FolderOpen },
      { name: 'Règlement', href: '/reglements', icon: BookOpen },
      { name: 'Immatriculation', href: '/immatriculation', icon: ClipboardList },
      { name: 'Contrat syndic', href: '/contrats-syndic', icon: Stamp },
      { name: 'Gestion utilisateurs', href: '/gestion-utilisateurs', icon: Users },
      { name: 'Exports', href: '/exports', icon: FileDown },
    ],
  },
]

export const coproprietaireNavigationSections: NavSection[] = [
  {
    key: 'mon-espace',
    label: 'Mon espace',
    collapsible: false,
    items: [
      { name: 'Tableau de bord', href: '/extranet', icon: LayoutDashboard },
    ],
  },
  {
    key: 'finances',
    label: 'Finances',
    collapsible: true,
    items: [
      { name: 'Mon compte', href: '/extranet/compte', icon: CreditCard },
      { name: 'Mes charges', href: '/extranet/charges', icon: Receipt },
      { name: 'Appels de fonds', href: '/extranet/appels-fonds', icon: ClipboardList },
      { name: 'Fonds travaux', href: '/extranet/fonds-travaux', icon: PiggyBank },
    ],
  },
  {
    key: 'copropriete',
    label: 'Copropriété',
    collapsible: true,
    items: [
      { name: 'Documents', href: '/extranet/documents', icon: FolderOpen },
      { name: 'Conseil syndical', href: '/extranet/conseil-syndical', icon: UsersRound },
    ],
  },
]
