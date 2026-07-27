// Unnamed text inputs get guessed as credit-card fields by Chrome/Android autofill.
export const noAutofill = {
  autoComplete: 'off',
  autoCorrect: 'off',
  spellCheck: false,
  'data-1p-ignore': true,
  'data-lpignore': 'true',
} as const
