import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import i18n from '@/i18n'
import type { GameEdition } from '@/types/card'

interface SettingsState {
  edition: GameEdition
  includeAlpine: boolean
  includeWoodland: boolean
  includeExploration: boolean
  language: 'en' | 'fr' | 'de' | 'es'
  setEdition: (edition: GameEdition) => void
  toggleAlpine: () => void
  toggleWoodland: () => void
  toggleExploration: () => void
  setLanguage: (lang: 'en' | 'fr' | 'de' | 'es') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      edition: 'classic' as GameEdition,
      includeAlpine: false,
      includeWoodland: false,
      includeExploration: false,
      language: 'en',
      setEdition: (edition) => set({ edition }),
      toggleAlpine: () => set({ includeAlpine: !get().includeAlpine }),
      toggleWoodland: () => set({ includeWoodland: !get().includeWoodland }),
      toggleExploration: () => set({ includeExploration: !get().includeExploration }),
      setLanguage: (lang) => {
        i18n.changeLanguage(lang)
        set({ language: lang })
      },
    }),
    {
      name: 'forest-shuffle-settings',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language)
        }
      },
    },
  ),
)
