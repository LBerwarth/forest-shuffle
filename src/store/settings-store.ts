import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { changeLanguage } from '@/i18n'
import type { Expansion, GameEdition } from '@/types/card'

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

type ExpansionSettings = Pick<SettingsState, 'edition' | 'includeAlpine' | 'includeWoodland' | 'includeExploration' | 'includeExmoor'>

export function selectExpansions(s: ExpansionSettings): Expansion[] {
  if (s.edition === 'smoky') return ['smoky_base']
  if (s.edition === 'dartmoor') return s.includeExmoor ? ['dartmoor_base', 'dartmoor_exmoor'] : ['dartmoor_base']
  const exp: Expansion[] = ['base']
  if (s.includeAlpine) exp.push('alpine')
  if (s.includeWoodland) exp.push('woodland')
  if (s.includeExploration) exp.push('exploration')
  return exp
}
