import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CoproprieteState {
  selectedCoproprieteId: number | undefined
  setSelectedCoproprieteId: (id: number | undefined) => void
}

export const useCoproprieteStore = create<CoproprieteState>()(
  persist(
    (set) => ({
      selectedCoproprieteId: undefined,
      setSelectedCoproprieteId: (id) => set({ selectedCoproprieteId: id }),
    }),
    {
      name: 'copropriete-selection',
    }
  )
)
