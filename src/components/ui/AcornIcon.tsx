import acornSvg from '@/assets/icons/acorn.svg'
import { cn } from '@/lib/utils'

interface AcornIconProps {
  className?: string
}

export function AcornIcon({ className }: AcornIconProps) {
  return (
    <img
      src={acornSvg}
      alt=""
      className={cn('inline-block h-4 w-4 shrink-0', className)}
    />
  )
}
