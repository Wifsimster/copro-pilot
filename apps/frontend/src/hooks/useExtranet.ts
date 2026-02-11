import { useQuery } from '@tanstack/react-query'
import { extranetApi } from '@/api/extranet'

export const EXTRANET_KEY = ['extranet'] as const

export function useExtranetProfil() {
  return useQuery({
    queryKey: [...EXTRANET_KEY, 'profil'],
    queryFn: async () => {
      const res = await extranetApi.getMonProfil()
      return res.data
    },
  })
}

export function useExtranetDocuments(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...EXTRANET_KEY, 'documents', coproprieteId],
    queryFn: async () => {
      const res = await extranetApi.getEspaceDocuments(coproprieteId!)
      return res.data
    },
    enabled: !!coproprieteId,
  })
}

export function useExtranetCompte() {
  return useQuery({
    queryKey: [...EXTRANET_KEY, 'compte'],
    queryFn: async () => {
      const res = await extranetApi.getMonCompte()
      return res.data
    },
  })
}

export function useExtranetCharges() {
  return useQuery({
    queryKey: [...EXTRANET_KEY, 'charges'],
    queryFn: async () => {
      const res = await extranetApi.getMesCharges()
      return res.data
    },
  })
}

export function useExtranetAppelsFonds() {
  return useQuery({
    queryKey: [...EXTRANET_KEY, 'appels-fonds'],
    queryFn: async () => {
      const res = await extranetApi.getMesAppelsFonds()
      return res.data
    },
  })
}

export function useExtranetFondsTravaux() {
  return useQuery({
    queryKey: [...EXTRANET_KEY, 'fonds-travaux'],
    queryFn: async () => {
      const res = await extranetApi.getMonFondsTravaux()
      return res.data
    },
  })
}

export function useExtranetConseilSyndical(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...EXTRANET_KEY, 'conseil-syndical', coproprieteId],
    queryFn: async () => {
      const res = await extranetApi.getDonneesConseilSyndical(coproprieteId!)
      return res.data
    },
    enabled: !!coproprieteId,
  })
}
