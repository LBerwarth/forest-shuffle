import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LandingSection } from '@/components/LandingSection'
import { useSettingsStore } from '@/store/settings-store'
import type { EditionPageDef } from '@/data/edition-pages'

export function EditionPage({ page }: { page: EditionPageDef }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setEdition = useSettingsStore((s) => s.setEdition)

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-6">
      <Button
        size="lg"
        className="w-full text-base"
        onClick={() => {
          setEdition(page.edition)
          navigate('/new-game')
        }}
      >
        <Calculator className="h-5 w-5" />
        {t(`${page.prefix}.cta`)}
      </Button>
      <LandingSection headingAs="h1" prefix={page.prefix} />
    </div>
  )
}
