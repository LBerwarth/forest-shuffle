# Exmoor (Dartmoor expansion) — known info

Source: official EN rulebook (`rules/en_exmoor.html_Dartmoor_Exmoor_Regeln_EN_WEB_260127.pdf`).
Full card list / appendix not yet published — card data in `src/data/exmoor-cards.ts` is partial
and scoringType values are provisional.

## Components (55 cards)

- 8 shrubs
- 12 terrains (moors)
- 5 caves (asymmetrical; replace the base-game caves in setup step 7)
- 19 cards split top/bottom
- 11 cards split left/right
- All expansion cards show a new type symbol: inverted green triangle with cream dot

## Setup changes

Shuffle base game + 50 expansion cards (caves separate), then remove unseen:

| Players | Cards removed |
|---------|---------------|
| 2       | 70            |
| 3       | 40            |
| 4       | 25            |
| 5       | 10            |

Alternative for 2p: split into 3 equal piles, remove 1 unseen. For 3p: 5 piles, remove 1.

## Clarifications

- **Dragonflies**: Golden-Ringed Dragonfly is the 6th dragonfly in the set collection.
- **Ponies**: Dartmoor Pony, Exmoor Pony, and Exmoor Pony Foal all count as ponies.

## New "rummage" effect

- Small variant: take 1 matching card from the clearing into your forest for free
  (without its effect/bonus). If none is there, reveal up to 3 cards from the deck
  into the clearing; if still none, the effect yields nothing.
- Large variant: take 3 matching cards; reveal up to 7 from the deck if needed;
  take as many as available.

## Cards confirmed so far (EN names)

| Key | Card # | Category | Notes |
|-----|--------|----------|-------|
| holly | E01 | shrub | effect "whenever you play a card with …" (cut off in rulebook) |
| dormouse | E15 | lateral | bonus if a pony(?) also occupies this tree |
| natterjack_toad | E35 | bottom | |
| waxcap_grassland | E50 | moor | |
| cave_7 | E52 | cave | on moor play: move a clearing card into cave; scores per card in cave |
| grey_wagtail | — | top | only placeable in moors; rummage effect |
| exmoor_pony_foal | — | lateral | pony |
| exmoor_pony | — | lateral | pony (from clarifications) |
| golden_ringed_dragonfly | — | top | 6th dragonfly, set scoring |

## Open / TODO

- Full card list + appendix (needed for scoring engine + wizard)
- Official German card names (German rulebook on lookout-spiele.de DE product page,
  or Board Game Arena with German locale — Exmoor is already live on BGA)
- Enable the Exmoor toggle (currently disabled teaser in NewGamePage/SettingsPage;
  `includeExmoor` in settings-store + `dartmoor_exmoor` expansion are already wired)

## Release info

- BGG: https://boardgamegeek.com/boardgameexpansion/463201/forest-shuffle-dartmoor-exmoor
- Premiere UKGE end of May 2026, German retail June 2026, international Q3 2026
