import { cn } from '@/lib/utils'

interface AcornLogoProps {
  className?: string
}

/**
 * The Forest Shuffle acorn mark — a dimensional, full-color acorn (golden nut +
 * green cap) matching the app icon in public/pwa-icon.svg. Sized via className;
 * looks best on a light tile.
 */
export function AcornLogo({ className }: AcornLogoProps) {
  return (
    <svg
      viewBox="0 0 100 120"
      className={cn('h-10 w-10', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="al-cap" x1="0.1" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#a6d196" />
          <stop offset="0.55" stopColor="#5c9468" />
          <stop offset="1" stopColor="#34563a" />
        </linearGradient>
        <linearGradient id="al-nut" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#f7dca6" />
          <stop offset="0.45" stopColor="#e2ab57" />
          <stop offset="1" stopColor="#b3751f" />
        </linearGradient>
        <linearGradient id="al-stem" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a6238" />
          <stop offset="1" stopColor="#4f3d20" />
        </linearGradient>
        <radialGradient id="al-spec" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="al-capshadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a4f15" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7a4f15" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* nut body */}
      <path d="M19,53 C17,82 31,107 50,115 C69,107 83,82 81,53 C81,53 66,57 50,57 C34,57 19,53 19,53 Z" fill="url(#al-nut)" />
      {/* specular highlight */}
      <ellipse cx="39" cy="76" rx="9" ry="15" fill="url(#al-spec)" transform="rotate(-18 39 76)" />
      {/* cap contact shadow on the nut */}
      <path d="M20,55 C34,60 66,60 80,55 L80,64 C66,70 34,70 20,64 Z" fill="url(#al-capshadow)" />
      {/* stem */}
      <rect x="45" y="2" width="10" height="20" rx="5" fill="url(#al-stem)" />
      {/* cap */}
      <path d="M13,52 C13,29 28,21 50,21 C72,21 87,29 87,52 C87,56 70,60 50,60 C30,60 13,56 13,52 Z" fill="url(#al-cap)" />
      {/* cap rim highlight */}
      <path d="M17,39 C30,30 70,30 83,39" stroke="#c8e6b8" strokeWidth="2.4" fill="none" opacity="0.55" strokeLinecap="round" />
      {/* cap texture */}
      <path d="M15,48 C32,42 68,42 85,48" stroke="#2f5236" strokeWidth="2" fill="none" opacity="0.35" strokeLinecap="round" />
    </svg>
  )
}
