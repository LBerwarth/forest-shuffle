# Exmoor (Dartmoor expansion) — known info

Sources: official EN rulebook (`rules/en_exmoor.html_Dartmoor_Exmoor_Regeln_EN_WEB_260127.pdf`)
and photos of the FR cards (transcribed 2026-07-20 into `src/data/exmoor-cards.ts`).
FR names are authoritative (read off the cards); EN/DE/ES names in the locale files are
best-effort species names until the official appendix publishes.

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

- **Caves**: only the Exmoor caves are used with this expansion — the Dartmoor caves
  (incl. Cave 4 = 5 points) are replaced in setup. The app removes them from the
  wizard and scoring when the Exmoor toggle is on. All Exmoor caves score 1 pt/card.
- **Dragonflies**: Golden-Ringed Dragonfly is the 6th dragonfly; set table becomes
  0/5/10/15/30/50 for 1–6 species.
- **Bats**: Whiskered Bat joins the bat set (5 pts each with 3+ species).
- **Ponies**: Dartmoor Pony, Exmoor Pony, and Exmoor Pony Foal all count as ponies
  (for the Horse's "10 pts per pony").

## Transcribed cards (from FR photos)

| Key | Card # | Category | FR name | End scoring |
|-----|--------|----------|---------|-------------|
| holly | E01 | shrub | Houx commun | 0 (effect only) |
| gorse | E05 | shrub | Ajonc d'Europe | 0 (effect only) |
| horse | E09/E11 L | lateral | Cheval | 10 per pony |
| exmoor_pony_foal | E09/E12 R | lateral | Poulain | 1 |
| bilberry_bumblebee | E10 L | lateral | Bourdon montagnard | 2 × shrub |
| whiskered_bat | E10 R | lateral | Murin à moustaches | bat set |
| dormouse | E11 R | lateral | Loir gris | 15 each if bat on same tree |
| red_devon_cow | E12 L | lateral | Vache Devon rouge | 1 × plant |
| dartford_warbler | E20/E25/E30 T | top | Fauvette pitchou | 1 |
| smooth_snake | E20/E24 B | bottom | Coronelle lisse | 1 × tree |
| peregrine_falcon | E21 T | top | Faucon pèlerin | 1 × mouse |
| wood_rush | E21 B | bottom | Luzule des bois | 3 |
| harvest_mouse | E22/E27 T | top | Rat des moissons | 1 × bird |
| tormentil | E22/E23 B | bottom | Potentille dressée | 5 (moor only) |
| pied_flycatcher | E23 T | top | Gobemouche noir | 4 |
| golden_ringed_dragonfly | E24 T | top | Cordulégastre annelé | dragonfly set |
| bank_vole | E25 B | bottom | Campagnol roussâtre | 3 |
| sundew | E27 B | bottom | Droséra | 1 × insect (moor only) |
| natterjack_toad | E30/E35 B | bottom | Crapaud calamite | 1 |
| grey_wagtail | E35 T | top | Bergeronnette des ruisseaux | 1 × Exmoor card (moor only) |
| coastal_heath | E39 | moor | Bruyère côtière d'altitude | doubles birds on it |
| stone_circle | E42 | moor | Cercle de pierres | 0 (effect only) |
| tarr_steps | E45 | moor | Tarr Steps | 0 (effect only) |
| waxcap_grassland | E48 | moor | Prairie d'hygrocybes | 0 (effect only) |
| cave_exmoor | E52+ | cave | Grotte | 1 per card in cave |

## Open / TODO

- **exmoor_pony** (FR "Poney") not photographed yet — in the app it counts as a pony
  but scores a provisional 0. Fix once the card is seen.
- Remaining unphotographed cards: ~6 shrubs, ~6 moors, several top/bottom and
  left/right splits (55-card set; ~25 unique cards transcribed).
- Official EN/DE/ES card names (appendix or BGA) — locale names are best-effort.
- Whether the 5 asymmetric caves differ in end scoring (assumed all 1 pt/card).

## Release info

- BGG: https://boardgamegeek.com/boardgameexpansion/463201/forest-shuffle-dartmoor-exmoor
- Premiere UKGE end of May 2026, German retail June 2026, international Q3 2026
