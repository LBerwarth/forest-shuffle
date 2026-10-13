import { cn } from '@/lib/utils'

export function HillSilhouette({ className }: { className?: string }) {
  return (
    <svg
      className={cn('pointer-events-none absolute -bottom-px left-0 w-full', className)}
      viewBox="0 0 400 48"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        d="M0 30 C 60 12, 120 38, 200 26 S 340 10, 400 28 V 48 H 0 Z"
        fill="currentColor"
      />
      <path
        d="M0 40 C 80 26, 160 44, 240 34 S 360 24, 400 40 V 48 H 0 Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  )
}
