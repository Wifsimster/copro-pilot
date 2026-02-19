import { useAuthStore } from '@/store/authStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Shield } from 'lucide-react'

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  syndic: 'Syndic',
  user: 'Utilisateur',
  coproprietaire: 'Copropriétaire',
}

export default function ProfilPage() {
  const { user } = useAuthStore()

  if (!user) return null

  const initials =
    `${(user.firstname?.[0] ?? '').toUpperCase()}` +
    `${(user.lastname?.[0] ?? '').toUpperCase()}`

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-6 w-6 text-gray-600 dark:text-zinc-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mon profil
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Informations de votre compte
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback className="text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>
                {user.firstname} {user.lastname}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                Prénom
              </p>
              <p className="text-sm text-gray-900 dark:text-white">
                {user.firstname || '—'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                Nom
              </p>
              <p className="text-sm text-gray-900 dark:text-white">
                {user.lastname || '—'}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  Email
                </p>
              </div>
              <p className="text-sm text-gray-900 dark:text-white">
                {user.email}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-gray-400" />
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                  Rôle
                </p>
              </div>
              <p className="text-sm text-gray-900 dark:text-white">
                {roleLabels[user.role] ?? user.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
