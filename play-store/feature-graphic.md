# Feature Graphic Specs

## Requirements

- **Dimensions:** exactly **1024 × 500 pixels**
- **Format:** PNG or JPEG
- **Max size:** 1 MB
- **No alpha transparency** (Play will reject transparent PNGs)
- **No store badges** ("Get on Google Play" etc. are banned in the feature graphic)
- **Safe zone:** keep text and key visuals inside the central 924 × 400 area — Play crops edges on some devices

## Easiest path: Canva

1. Open https://canva.com (free account works)
2. Click "Create a design" → search **"Google Play feature graphic"** — they have ready-made 1024×500 templates
3. Pick a green / forest themed template
4. Replace placeholder text:
   - **Big title (left half):** `Forest Shuffle Scorer`
   - **Subtitle (under title):** `Score calculator & stats — Classic + Dartmoor`
5. Drop the app icon on the right half (download `pwa-512x512.png` from your repo's `public/` folder)
6. Background gradient: dark green → lighter green (matches your in-app `#4a7c59` theme)
7. Export → PNG → save as `feature-graphic.png`
8. Upload to Play Console → Main store listing → Feature graphic

## Layout suggestion (text rendering of the visual)

```
┌─────────────────────────────────────────────────────────────────┐
│  ╭───────────────────╮                                           │
│  │                    │   Forest Shuffle                         │
│  │   [tree icon]     │   Scorer                                 │
│  │   (the app icon)  │                                          │
│  │                    │   Score calculator & stats               │
│  ╰───────────────────╯                                           │
└─────────────────────────────────────────────────────────────────┘
       320×320 area               680×500 area for text
       
Background: forest green gradient (#4a7c59 → #6ba47a)
Text color: white or light cream
Font: a serif works (matches your in-app Lora), or system-sans
```

## DON'T

- ❌ Show actual Forest Shuffle card art (copyright infringement)
- ❌ Use the publisher's "Kosmos" or "Lookout" logos
- ❌ Promise features the app doesn't have ("AI-powered", "blockchain", etc.)
- ❌ Add screenshots — those go in the screenshots section, not here

## Alternative if you don't want to design

Solid green background with just the title text centered, no icon. Lazy but acceptable. Play has no rule about visual richness.
