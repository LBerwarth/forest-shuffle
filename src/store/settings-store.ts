import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import i18n from '@/i18n'

interface SettingsState {
  includeAlpine: boolean
  language: 'en' | 'fr'
  toggleAlpine: () => void
  setLanguage: (lang: 'en' | 'fr') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      includeAlpine: false,
      language: 'en',
      toggleAlpine: () => set({ includeAlpine: !get().includeAlpine }),
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
