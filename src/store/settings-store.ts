import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { changeLanguage } from '@/i18n'
import type { GameEdition } from '@/types/card'

interface SettingsState {
  edition: GameEdition
  includeAlpine: boolean
  includeWoodland: boolean
  includeExploration: boolean
  includeExmoor: boolean
  language: 'en' | 'fr' | 'de' | 'es' | 'nl' | 'it' | 'pl' | 'pt' | 'cs' | 'hu' | 'uk' | 'ru' | 'tr' | 'ca' | 'da' | 'sv' | 'no' | 'fi'
  setEdition: (edition: GameEdition) => void
  toggleAlpine: () => void
  toggleWoodland: () => void
  toggleExploration: () => void
  toggleExmoor: () => void
  setLanguage: (lang: 'en' | 'fr' | 'de' | 'es' | 'nl' | 'it' | 'pl' | 'pt' | 'cs' | 'hu' | 'uk' | 'ru' | 'tr' | 'ca' | 'da' | 'sv' | 'no' | 'fi') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      edition: 'classic' as GameEdition,
      includeAlpine: false,
      includeWoodland: false,
      includeExploration: false,
      includeExmoor: false,
      language: 'en',
      setEdition: (edition) => set({ edition }),
      toggleAlpine: () => set({ includeAlpine: !get().includeAlpine }),
      toggleWoodland: () => set({ includeWoodland: !get().includeWoodland }),
      toggleExploration: () => set({ includeExploration: !get().includeExploration }),
      toggleExmoor: () => set({ includeExmoor: !get().includeExmoor }),
      setLanguage: (lang) => {
        set({ language: lang })
        void changeLanguage(lang)
      },
    }),
    {
      name: 'forest-shuffle-settings',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          void changeLanguage(state.language)
        }
      },
    },
  ),
)
