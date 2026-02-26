import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import i18n from '@/i18n'

interface SettingsState {
  includeAlpine: boolean
  includeWoodland: boolean
  language: 'en' | 'fr' | 'de' | 'es'
  toggleAlpine: () => void
  toggleWoodland: () => void
  setLanguage: (lang: 'en' | 'fr' | 'de' | 'es') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      includeAlpine: false,
      includeWoodland: false,
      language: 'en',
      toggleAlpine: () => set({ includeAlpine: !get().includeAlpine }),
      toggleWoodland: () => set({ includeWoodland: !get().includeWoodland }),
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
