# Forest Shuffle: Amazonas. Analyse der drei Editionen und Entwurf einer vierten

Stand: 2026-11-06. Entwurf für eine eigene Standalone-Edition mit Flora und Fauna des Amazonasbeckens.
Datenbasis: alle in der App gespeicherten Wälder (Supabase `game_players.score_breakdown`), Stand heute:
902 Classic-Wälder (inkl. Erweiterungen), 987 Dartmoor-Wälder, 557 Smoky-Wälder, davon 203 Smoky-Partien mit 2+ Spielern.
Vorbehalt: App-Nutzer sind keine Zufallsstichprobe, und die Daten zeigen nur fertige Wälder, nicht die Hand oder die Lichtung.

---

## 1. Kurzfassung

- Smoky Mountains hat ein messbares Strukturproblem: fünf Tiere mit "10 oder 30 Punkte" (Wapiti, Rotluchs, Kojote, Schwarzbär, Weißkopfseeadler). 21 von 180 Karten liefern im Schnitt 29 % aller Punkte eines Waldes. In 45 % der Wälder stammen über 30 % der Punkte aus diesen fünf Arten.
- Der Wapiti ist der schlimmste Fall: in 47 % aller Wälder, 1,7 Kopien pro Wald, 29 Punkte pro Kopie, 92 % der Wapiti-Besitzer erreichen die 30er-Schwelle. Die Bedingung "5 verschiedene Baumarten" erfüllt jeder, weil jede Strategie Bäume braucht. Dazu holt der Wapiti selbst gratis einen Baum von der Lichtung und erfüllt so seine eigene Bedingung.
- Dein Eindruck "fast nur gewinnen mit den 30ern" stimmt zur Hälfte: In 62 % der Smoky-Partien gewinnt der Spieler mit den meisten Punkten aus diesen fünf Arten, und sie erklären etwa die Hälfte des Siegabstands (im Schnitt +32 von +63 Punkten). Der Rest des Waldes entscheidet die andere Hälfte. Glück beim Ziehen dieser 21 Karten ist also ein großer, aber nicht der einzige Faktor.
- Zum Vergleich: In Classic kommt keine Art über 12 % Punkteanteil, in Dartmoor nur das Exmoor-Pferd (17 %). In Smoky liegen fünf Arten bei 14 bis 20 %.
- Was Smoky gut macht und übernommen wird: Wasserbedarf (räumlicher Zwang), universelle Flüsse (tote Handkarten werden Gelände), Positionsbedingungen (allein am Baum, mit anderem Insekt). Der Bezahlbonus bei passender Baumfarbe ist Grundspiel-Regel und bleibt sowieso.
- Die Amazonas-Edition bekommt drei neue Mechaniken, die es in keiner Edition gibt: Stockwerke (Emergenten, Kronendach, Unterholz) mit Kronendach-Bedarf für Baumkronen-Tiere, Epiphyten (Pflanzen, die einen belegten Oben-Slot teilen und Frösche beherbergen) und Mutualismus-Paare (Paranuss braucht Agouti und Prachtbiene, Cecropia und Azteca-Ameise, Würgefeige und Feigenwespe). Dazu die Würgefeige als Baum, der auf einen Baum gelegt wird. Gewässer und Igarapé (überfluteter Wald) sind Smokys Flussmechanik, umbenannt; Zug, Lichtung, Kosten, Bezahlbonus und Winterkarten sind der gemeinsame Kern aller drei Editionen.
- Balance-Grundsatz: keine 0/30- oder 10/30-Schwellen. Jede Bedingung kostet etwas, das eine andere Strategie auch will (Slots, Unterholz-Bäume statt Kronendach, Alleinsein am Baum, Mehrheit gegen Mitspieler). Maximal 20 bis 25 Punkte aus einer Karte, und nur mit echter Gegenleistung.
- Abschnitt 8 enthält einen kompletten Kartensatz mit 180 Karten (56 Bäume, 107 geteilte Karten, 9 Gewässer, 5 Höhlen, 3 Hochwasserkarten), jede Karte mit Slot, Anzahl, Kosten, Effekt, Punkten und dem erprobten Vorbild aus den drei Editionen.

---

## 2. Anatomie der drei Editionen

| | Forest Shuffle (2023) | Dartmoor (2025) | Smoky Mountains (2026) |
|---|---|---|---|
| Karten | 180 (+Alpin 40, +Waldrand 40, +Entdeckungen) | 180 (+Exmoor 50) | 180 |
| Bäume | 8 Arten, 66 Karten (Birke 10, Buche 10, Kastanie 11, Linde 9, Douglasie 7, Eiche 7, Bergahorn 6, Weißtanne 6) | 6 Arten + 2 Sträucher | 8 Arten, 56 Karten (Buckeye 9, Silberahorn 9, Gelbbirke 8, 4x6, Hickory 6) |
| Gelände | keins (Sträucher erst mit Waldrand) | Moore: horizontale Karten, nur oben/unten Slots, Moore punkten selbst (2 pro Amphib, pro Huf, pro Insekt usw.), Universalmoor verdeckt | Flüsse: 9 benannte (3 Creek, 3 River Bend, 3 Wasserfall) + universeller Fluss verdeckt unter einem Baum, dann 5 Slots |
| Neue Zwänge | Slot-Seiten, Bezahlbonus bei gleicher Baumfarbe (in allen drei Editionen) | Moor-Slots | Wasserbedarf (Karten nur in Flüssen) |
| Vergleichskarten | Linde (Mehrheit 3 statt 1), Buntspecht (10 bei meisten Bäumen) | Uferschnepfe, Dartmoor-Pony | keine |
| Sets | Schmetterlinge 3/6/12/20/35 (bis 80 mit Erw.), Kastanie n², Fledermäuse 5 je ab 3 Arten, Feuersalamander 5/15/25, Glühwürmchen 10/15/20 | Libellen 5/10/15/30/50, Kammmolch 5/15/25, Fledermäuse | Hörnchen 5/10/20/40 über vier Kartenhälften, Glühwürmchen 3n² |
| Schwellen | Luchs 10 bei Reh, Keiler 10 bei Frischling, Eiche 10 bei 8 Arten, Moos 10 bei 10 Bäumen, Buche 5 ab 4 | Brachvogel 3/10, Waldeidechse 5/15, Orchidee 3/15, Moorfrosch 8 ab 5 Mooren (alle "klein oder groß", nie 0 oder 30) | Wapiti, Rotluchs, Kojote, Bär, Adler je 10/30; Wiesel 0/10, Salamander 0/10, Raupe 0/10, Silberahorn 0/5 |
| Positionsbedingungen | Buchfink auf Buche, Eichhörnchen auf Eiche, Siebenschläfer allein 15, Weißtanne 2 pro Anhang, Reh 3 pro passendes Symbol | Nuthatch, Wheatear, Meadowsweet | Skunk allein 10, Wespe mit Insekt 10, Bär mit 2 Fischen 30, Opossum pro Baumsymbol, Truthahn pro Farbe |
| Anti-Skalierung | Sumpf-Blutauge 15/7/3 nach Baumzahl (Entdeckungen) | keine | keine |
| Tempo-Boni (Extrazug, Gratiskarte) | auf Pilzen, Douglasie u. a. | moderat | sehr viele, oft auf den Punktemonstern selbst |
| Schnitt Gesamtpunkte (App) | 256 (Median 231) | 210 (Median 189) | 266 (Median 232) |

Punktearchetypen, die sich in allen drei Editionen bewährt haben (und auf denen der Amazonas-Satz aufbaut):

1. Fix: 1 bis 8 Punkte, oft mit Effekt (Birke 1, Eichelhäher 3, Waldkauz 5, Graureiher 8).
2. Linear pro Symbol: Wolf 5 pro Hirsch, Habicht 3 pro Vogel, Gimpel 2 pro Insekt, Hirsch 1 pro Baum und Pflanze. Deckel entsteht durch Slots und Kartenvorrat.
3. Linear pro Art (Diversität): Murmeltier 3 pro Pflanzenart, Heidelbeere 2 pro Vogelart, Smallmouth Bass 3 pro Fischart.
4. Set über Kartenhälften: Schmetterlinge, Hörnchen. Selbstbegrenzend, weil verschiedene Slots nötig sind.
5. Quadrat: Hase n², Kastanie n², Glühwürmchen 3n². Belohnt Fokus, bleibt durch Kartenzahl gedeckelt.
6. Gestufte Schwelle: Wiesenpieper 1/3/6/10 nach Vogelarten, Waldeidechse 5/15.
7. Position: allein am Baum, auf bestimmter Baumart, mit Nachbar.
8. Vergleich: Mehrheit gegen Mitspieler.
9. Motor ohne Punkte: Walddrossel-Typ ("immer wenn du X spielst, ziehe 1"), Pilze, Fluss-Biegung.
10. Anti-Skalierung: Sumpf-Blutauge.

Smoky nutzt 1 bis 5, 7, 9 gut, hat aber kein 8 und kein 10, und ersetzt 6 (gestuft) durch binäre 10/30-Sprünge.

---

## 3. Smoky Mountains: Befund mit Zahlen

### 3.1 Die fünf 30er-Karten

| Karte | Kopien | Kosten | Bedingung für 30 | in % der Wälder | Punkte je Kopie | Anteil am Wald | Bedingung erreicht, wenn gespielt |
|---|---|---|---|---|---|---|---|
| Wapiti (Elk) | 5 | 3 | 5 verschiedene Baumarten | 47 % | 29,1 | 19,5 % | 92 % |
| Rotluchs (Bobcat) | 4 | 3 | 5 Vögel | 25 % | 29,4 | 16,8 % | 95 % |
| Schwarzbär | 4 | 3 | 2 Fische am eigenen Baum | 36 % | 28,5 | 15,9 % | 91 % |
| Kojote | 4 | 3 | 6 Pfotentiere (inkl. Kojoten) | 27 % | 25,1 | 15,1 % | 72 % |
| Weißkopfseeadler | 4 | 3 | 5 Fische | 41 % | 23,7 | 14,0 % | 68 % |

Zum Vergleich die stärksten Karten der anderen Editionen (Punkte je Kopie / Anteil): Classic Baummarder 23,9 / 11,7 %, Habicht 19,7 / 11,9 %, Bache 22,2 / 11,2 %, Wolf 18,9 / 9,7 %. Dartmoor: Exmoor-Pferd 31,0 / 17,1 % (10 pro Pony, selten, 11 % der Wälder), Dachs 19,5 / 14,7 %, Reh 18,1 / 12,1 %.

Kennzahl "Punkteanteil der Top-5-Arten": Smoky 29 % im Schnitt über alle Wälder. In 45 % der Wälder sind es 30 % oder mehr. Die fünf Arten sind 21 von 180 Karten (12 % des Decks).

### 3.2 Warum der Wapiti dominiert

1. Die Bedingung ist strategieneutral. Jede Strategie braucht Bäume für Slots. Mit 8 Bäumen im Wald liegt die Wahrscheinlichkeit für 5 Arten bei 75 %, mit 10 Bäumen bei 85 %. 55 % aller Smoky-Wälder haben 5+ Baumarten, ganz ohne Absicht.
2. Der Effekt erfüllt die eigene Bedingung: "nimm einen Baum von der Lichtung gratis". Der Wapiti kostet 3 Karten, bringt aber einen Baum (eine Aktion plus 1 bis 5 Punkte) zurück.
3. Fünf Kopien, mehr als jede andere der fünf Karten.
4. Nach Strategie aufgeschlüsselt (Wald mit 5+ Fischen = "Fisch", 4+ Hörnchen = "Hörnchen", 6+ Pfoten = "Pfote", 5+ Vögel = "Vogel"):

| Strategie | Wälder | mit Wapiti | 5+ Baumarten | Schnitt Bäume | Total mit Wapiti | Total ohne |
|---|---|---|---|---|---|---|
| Fisch | 199 | 28 % | 35 % | 6,8 | 391 | 285 |
| Pfote | 103 | 72 % | 82 % | 9,3 | 326 | 235 |
| Hörnchen | 64 | 45 % | 53 % | 7,6 | 296 | 220 |
| Vogel | 72 | 53 % | 69 % | 7,9 | 227 | 177 |
| sonstige | 119 | 47 % | 58 % | 6,2 | 200 | 196 |

Der Wapiti passt in jede Strategie außer der reinen Fluss-Strategie (wenige Bäume, viele Flüsse), und selbst dort liegt der Wald mit Wapiti 100 Punkte höher. Genau dein Eindruck: er lohnt sich immer, egal was auf der anderen Kartenhälfte steht.

### 3.3 Wer gewinnt

| Edition | Partien | Sieger hat meiste Punkte aus Top-Arten | Anteil Top-Arten beim Sieger / bei Verlierern | Siegabstand aus Top-Arten / aus dem Rest |
|---|---|---|---|---|
| Smoky (5 Arten) | 175 | 62 % | 33 % / 27 % | +32 / +31 |
| Classic (10 stärkste Arten) | 319 | 68 % | 38 % / 25 % | +53 / +16 |
| Dartmoor (7 stärkste Arten) | 329 | 50 % | 23 % / 21 % | +13 / +38 |

Lesart: In Classic erklären die 10 stärksten Arten den Siegabstand fast allein, aber das sind 10 Arten quer über alle Strategien (Baummarder, Habicht, Wolf, Bison, Bache, Damhirsch, Reh, Hirsch, Baumfarn, Enzian), jede mit eigener Synergie. In Smoky reichen 5 Arten, die alle auf dieselbe Weise funktionieren (3 Karten zahlen, 30 kassieren, Tempo-Bonus obendrauf) für die Hälfte des Abstands.

### 3.4 Was an Smoky bleiben sollte

- Wasserbedarf: Karten, die nur in Flüsse dürfen, zwingen zu einer Gelände-Entscheidung. Ein Baum mit Fluss hat 5 Slots, ein Fluss allein 4, aber nur für Wasserkarten.
- Universeller Fluss: jede tote Handkarte wird verdeckt zu Gelände. Hervorragende Kartenökonomie, Dartmoor hat das Gleiche als Universalmoor.
- Bezahlbonus (Grundspiel-Regel, in allen drei Editionen): alle Zahlkarten mit gleichem Baumsymbol lösen einen Bonus aus. Belohnt Handmanagement und Farbtreue, ohne Punkte zu verschenken.
- Positionsbedingungen (Skunk allein 10, Wespe mit anderem Insekt 10): kosten Slots, sind also echte Entscheidungen. Nur der Bär (30 mit 2 Fischen am eigenen Baum) ist zu hoch dotiert.
- Motoren ohne Punkte (Meise, Walddrossel, Zwergwels, Fluss-Biegung): 0 Punkte, aber Kartenfluss.
- Hörnchen-Set über vier Kartenhälften: zwingt in alle vier Slot-Typen.

### 3.5 Hausregeln für Smoky, auf den echten Wäldern durchgerechnet

Wenn du Smoky weiterspielen willst, ohne neue Karten zu drucken:

| Karte | Original (Schnitt je Kopie) | Hausregel | Schnitt je Kopie mit Hausregel |
|---|---|---|---|
| Wapiti | 10/30 (28,5) | 5 Punkte pro Baumart ab der dritten (3 Arten = 5, 5 Arten = 15, 8 Arten = 30) | 18,2 |
| Wapiti, Alternative | | 30 erst ab 6 Baumarten | 20,2 |
| Rotluchs | 10/30 (28,9) | 3 pro Vogel, max. 30 | 22,1 |
| Kojote | 10/30 (27,1) | 2 pro Pfotentier, max. 30 | 19,0 |
| Weißkopfseeadler | 10/30 (23,3) | 3 pro Fisch, max. 30 | 16,2 |
| Weißkopfseeadler, Alternative | | 5 pro Fischart | 17,0 |
| Schwarzbär | 10/30 | 10, plus 10 pro Fisch am eigenen Baum (max. 30) | nicht simulierbar (App speichert nur "2+ Fische") |

Mit diesen Regeln landen alle fünf bei 16 bis 22 Punkten je Kopie, also auf dem Niveau von Baummarder, Habicht oder Wolf. Die Extrazug- und Gratiskarten-Effekte bleiben, dann sind die Karten immer noch gut, aber kein Selbstläufer mehr.

---

## 4. Balance-Grundsätze für die neue Edition

1. Keine binären Sprünge über 10 Punkte. Stufen wie 1/3/6/10 oder 5/15, oder linear pro Symbol mit natürlichem Deckel. Das 30er-Format fliegt komplett raus.
2. Jede Bedingung kostet etwas, das jemand anderes auch will: Slots (allein am Baum), Baumwahl (Kronendach-Bäume statt billiger Palmen), knappes Gelände (nur 9 Gewässer), Mehrheit (Vergleich mit Mitspielern). "5 Baumarten" kostet nichts, weil jeder Bäume braucht.
3. Punkte oder Tempo, nie beides. Eine Karte mit 15+ Punkten bekommt keinen Extrazug und keine Gratiskarte. Kosten 3 heißt: großer Motor oder große Punkte.
4. Kopienzahl gegen Stärke: stärkste Punktekarten 3 Kopien, Füller 5 bis 10 (Classic: Hase 11, Erdkröte 6, Luchs 6).
5. Dreierregel pro Symbol: jedes Symbol (Huf, Pfote, Nager, Affe, Vogel, Insekt, Amphib/Reptil, Pflanze, Fisch) hat mindestens einen linearen Zähler, einen Diversitätszähler und eine Positionskarte. Dann gibt es pro Symbol drei Wege, nicht einen.
6. Zwei bis drei Vergleichskarten (Smoky hat null). Mitspieler beobachten ist Teil des Spiels.
7. Eine Anti-Skalierungskarte (Vorbild Sumpf-Blutauge), damit ein kleiner Wald ein Plan sein kann.
8. Zielwerte für 2 Spieler: Gesamtpunkte 180 bis 260, keine Art im Schnitt über 12 % Anteil, keine Karte über 25 Punkte je Kopie außer Quadratkarten mit 5+ Kopien, Top-5-Arten zusammen unter 35 %.
9. Wapiti-Test für jede Karte mit 10+ Punkten Potenzial: "Welche andere Strategie leidet, wenn ich die Bedingung erfülle?" Keine Antwort = Karte umschreiben.
10. Zug-Ökonomie bleibt wie im Original: 2 ziehen oder 1 spielen, Handlimit 10, Lichtung leert sich ab 10, 3 Endkarten im unteren Drittel.

---

## 5. Amazonas: Thema

Das Amazonasbecken ist bewusst weit weg von allem, was Lookout bisher gemacht hat (gemäßigte Wälder, Moor, Appalachen) und überschneidet sich mit keiner Erweiterung. Die Pyrenäen-Idee hätte sich mit Alpin in 9 Arten überschnitten (Murmeltier, Gämse, Steinbock, Steinadler, Bartgeier, Edelweiß, Enzian, Apollo, Heidelbeere), siehe Anhang.

Was den Regenwald als Spiel anders macht als die drei Editionen, und damit das Rohmaterial für die Mechaniken:

- Stockwerke: Emergenten (Kapok, Paranuss, 40 bis 60 m), Kronendach (die meisten Arten leben hier), Unterholz (Palmen, Jungbäume), Boden (nährstoffarm, schneller Abbau).
- Flutpuls: Várzea und Igapó stehen 4 bis 8 Monate unter Wasser. Fische wie der Tambaqui fressen Früchte im überfluteten Wald.
- Epiphyten: Bromelien, Orchideen, Philodendron wachsen auf Bäumen, nicht im Boden. Bromelien halten Wasser und sind Kinderstube für Pfeilgiftfrösche.
- Mutualismen: Paranuss braucht Prachtbienen (Bestäubung) und Agoutis (einzige Tiere, die die Frucht öffnen). Cecropia und Azteca-Ameisen. Würgefeige und Feigenwespe. Blattschneiderameisen und ihr Pilz. Faultiere und Cecropia.
- Mimikry: Heliconius-Falter bilden Mimikry-Ringe, also ein natürliches Set.
- Artenvielfalt als solche: mehr Diversitätszähler als in jeder bisherigen Edition.
- Nährstoffkreislauf: die Höhle wird zur "Laubstreu". Termiten und Pilze punkten mit Höhlenkarten.

Namen auf den Karten: Deutsch und Französisch (die App hat beides, und Guyane française liegt im Amazonasbecken). Wissenschaftliche Namen klein wie im Original.

---

## 6. Neue Mechaniken

### 6.1 Stockwerke (neu)

Jeder Baum trägt ein Stockwerk-Symbol: E (Emergent), K (Kronendach) oder U (Unterholz).

- Kronendach-Bedarf: Oben-Karten mit Kronen-Symbol dürfen nur auf K- oder E-Bäume. U-Bäume (Açaí, Buriti, 14 Karten) und Gewässer nehmen nur Oben-Karten ohne Kronen-Symbol. Das ist Smokys Wasserbedarf, auf die Baumkrone übertragen. Die billigen Palmen bringen Slots, aber keine Tukane, Aras, Harpyien, Faultiere oder Epiphyten.
- E-Bäume haben 2 Oben-Slots (einen normalen, einen nur für Kronen-Karten), also 5 Slots. Das ist Smokys "Baum mit Fluss", eingebaut statt verdeckt gelegt, und auf 10 Karten im Deck begrenzt (Kapok 5, Paranuss 5).
- 27 der 57 Oben-Hälften tragen das Kronen-Symbol, 30 nicht. Die Entscheidung Palme oder Kronendach-Baum fällt also bei jedem Baum.

### 6.2 Gewässer und Igarapé (übernommen aus Smoky, umbenannt)

9 benannte Gewässer (Abschnitt 8.2), horizontal, 2 Slots oben, 2 unten, unten nur Wasser-Karten. Igarapé: beim Spielen eines beliebigen Baums darf eine Handkarte verdeckt unter den Baum gelegt werden (überfluteter Wald). Der Baum hat dann 2 Unten-Slots, beide nur für Wasser-Karten, plus die üblichen Slots. Nicht nachrüstbar. 19 Unten-Hälften tragen das Wasser-Symbol.

### 6.3 Epiphyten (neu)

Pflanzen mit Epiphyt-Symbol (Bromelie, Orchidee, Philodendron, 9 Karten) dürfen in einen bereits belegten Oben-Slot gelegt werden (unter die Karte geschoben, die dort liegt). Sie brauchen Kronendach. Ein Oben-Slot nimmt höchstens einen Epiphyten. Die Bromelie beherbergt zusätzlich einen Frosch mit Bromelien-Symbol (Pfeilgiftfrosch, Laubfrosch), der dann nicht in einen Unten-Slot muss. Epiphyten sind damit die Antwort auf die Slot-Knappheit, aber nur für wenige Arten und nur an Kronendach-Bäumen.

### 6.4 Würgefeige (neu)

Baumkarte, die auf einen eigenen Baum gelegt wird. Der Wirtsbaum punktet nicht mehr und zählt nicht mehr als seine Art, behält aber Stockwerk, Slots und alle angelegten Karten. Die Feige zählt als eigene Baumart und punktet 2 pro angelegter Karte. Sinnvoll auf Bäumen, die schlecht punkten (Cecropia 1, Kautschuk in der Minderheit, Buriti ohne Gewässer). Vier Karten im Deck, Kosten 2.

### 6.5 Mutualismus-Paare (neu als System, einzeln bekannt von Keiler und Frischling)

| Karte | Partner | Wirkung |
|---|---|---|
| Paranussbaum | Agouti und Prachtbiene im Wald | 0 / 3 / 10 Punkte bei 0 / 1 / 2 Partnern |
| Azteca-Ameise | Cecropia | 2 pro Cecropia |
| Faultier | Cecropia | 5 auf einer Cecropia, sonst 2 |
| Feigenwespe | Würgefeige | 8 auf einer Würgefeige, sonst 1 |
| Blattschneiderameise | Pilze | 3 pro Pilz |
| Pfeilgiftfrosch | Bromelie | 5 auf einer Bromelie, sonst 2 |
| Prachtbiene | Paranussbaum | 3 pro Paranussbaum |
| Tambaqui | Igarapé | 2 pro Igarapé |

Alle Paare sind gestuft oder linear, keins springt auf 30.

### 6.6 Bezahlbonus (Grundspiel-Regel, alle drei Editionen)

Alle Zahlkarten mit gleichem Baumsymbol lösen den Bonus der gespielten Karte aus. Bonus nur auf Motoren und Füllern (Abschnitt 11), nie auf den Karten aus Abschnitt 9.

### 6.7 Verworfen

- Hochwasser als Störereignis (Unten-Karten verlieren bei der ersten Flutkarte): bestraft, statt zu belohnen, und Forest Shuffle hat nie negative Ereignisse.
- Lianen, die zwei Bäume verbinden: die Auslage hat keine definierte Nachbarschaft.
- Tag/Nacht-Zyklus: Verwaltung ohne Entscheidung.
- Zweite Tier-Set-Mechanik neben Affen und Faltern: ein Set pro Slot-Typ reicht.

---

## 7. Symbole

Typsymbole: Vogel, Insekt (Schmetterlinge zusätzlich mit Falter-Symbol), Amphib/Reptil (ein Symbol wie bisher), Fisch, Pflanze, Pilz, Pfote, Affe (Affen tragen zusätzlich Pfote), Nager (Nager tragen zusätzlich Pfote, wie Mäuse in Dartmoor), Huf.
Baumsymbole (9, für Bezahlbonus und Spießhirsch): Kapok, Paranuss, Cecropia, Mahagoni, Ipê, Kautschuk, Açaí, Buriti, Würgefeige.
Stockwerk auf Bäumen: E, K, U.
Bedarfssymbole: Krone (Oben-Karten, nur K- oder E-Baum), Wasser (Unten-Karten, nur Gewässer oder Igarapé). Zwei Bedarfssymbole statt einem wie in Smoky, aber je eins pro Slot-Typ, nie beide auf einer Karte.
Eigenschaften: Epiphyt, Bromelien-Symbol (Frosch darf auf Bromelie).

---

## 8. Kartensatz (180 Karten)

Zählung: 56 Bäume + 107 geteilte Karten (57 oben/unten, 50 links/rechts) + 9 Gewässer + 5 Höhlen + 3 Hochwasserkarten = 180.
"Vorbild" nennt die erprobte Karte, deren Punktemodell übernommen wurde. "Max" ist ein realistisches Maximum in einem 2-Spieler-Wald, nicht das theoretische.

### 8.1 Bäume (56)

| Karte (de / fr) | Stock | Anz. | Kosten | Effekt | Punkte | Vorbild | Max |
|---|---|---|---|---|---|---|---|
| Kapok / Fromager (Ceiba) | E | 5 | 3 | | 2 pro angelegter Karte (inkl. Igarapé und Karten darunter) | Hickory | 14 je Baum |
| Paranussbaum / Noyer du Brésil | E | 5 | 2 | | 10 wenn Agouti und Prachtbiene im Wald, 3 bei einem von beiden, sonst 0 | Keiler, gestuft | 10 je Baum |
| Cecropia / Bois canon | K | 10 | 0 | ziehe 1 | 1 | Gelbbirke | 10 |
| Mahagoni / Acajou | K | 6 | 2 | | 5 | Hemlock | 30 |
| Ipê / Ébène verte | K | 6 | 1 | | 1 pro Vogel im Wald | Palme | 8 je Baum |
| Kautschukbaum / Hévéa | K | 6 | 1 | Bonus: Extrazug | Vergleich: 3 je Baum bei meisten Kautschukbäumen, sonst 1 (Solo: 3 ab 3) | Linde | 18 |
| Açaí-Palme / Palmier wassaï | U | 8 | 1 | | n² für n Palmen (1/4/9/16/25) | Rosskastanie | 25 |
| Buriti-Palme / Palmier bâche | U | 6 | 1 | ziehe 1 | 1 pro Gewässer im Wald (benannt + Igarapé) | Black Gum | 6 je Baum |
| Würgefeige / Figuier étrangleur | wie Wirt | 4 | 2 | wird auf eigenen Baum gelegt (6.4) | 2 pro angelegter Karte | Hickory | 12 je Baum |

Wapiti-Test für die Bäume: Açaí braucht Fokus auf eine Art und sperrt Kronendach-Karten aus. Kautschuk ist ein Vergleich. Paranuss braucht zwei Partner in anderen Slots. Kapok kostet 3 und bringt erst mit vollen Slots viel.

### 8.2 Gewässer (9) und Höhlen (5)

| Gewässer | Anz. | Kosten | Effekt | Punkte | Vorbild |
|---|---|---|---|---|---|
| Rio / Rivière | 3 | 2 | Bonus: Extrazug | 1 pro Fisch im Wald | Creek |
| Lagoa / Lac de bras mort (Altarm) | 3 | 2 | Dauerhaft: unten bis zu 4 Wasser-Karten statt 2; Bonus: Wasser-Karte gratis von der Lichtung | 0 | Wasserfall |
| Cachoeira / Cascade | 3 | 2 | Dauerhaft: immer wenn du eine Wasser-Karte spielst, ziehe 1 | 0 | Fluss-Biegung |

Höhlen: 5 asymmetrische wie in Exmoor, alle 1 Punkt pro Karte, je ein Setup-Effekt:

| Höhle | Setup-Effekt |
|---|---|
| Baumhöhle / Arbre creux | lege sofort 2 Karten vom Stapel in die Höhle |
| Uferhöhle / Terrier de berge | ziehe 2 Karten mehr auf die Starthand |
| Termitenbau / Termitière | ein Baum deiner Wahl aus der Lichtung kommt gratis in den Wald |
| Wurzelhöhle / Contrefort | einmal pro Spiel: lege eine Handkarte in die Höhle und ziehe 2 |
| Felsspalte / Inselberg | Handlimit 11 statt 10 |

### 8.3 Oben-Slot (57 Hälften)

| Karte (de / fr) | Typ | Bedarf | Anz. | Kosten | Effekt | Punkte | Vorbild | Max |
|---|---|---|---|---|---|---|---|---|
| Harpyie / Harpie féroce | Vogel | Krone | 3 | 3 | | 3 pro Affe + 3 pro Faultier im Wald | Damhirsch (3 pro Huf) | 21 |
| Königsgeier / Sarcoramphe roi | Vogel | | 3 | 1 | lege 2 Lichtungskarten in deine Höhle | Vergleich: 10 bei meisten Höhlenkarten, sonst 2 (Solo: 10 ab 8) | Buntspecht | 10 |
| Riesentukan / Toucan toco | Vogel | Krone | 3 | 1 | nimm einen Baum von der Lichtung gratis in den Wald | 2 | Wapiti-Effekt ohne Wapiti-Punkte | 2 |
| Hellroter Ara / Ara rouge | Vogel | Krone | 3 | 1 | | Ara-Set | | |
| Gelbbrustara / Ara bleu | Vogel | Krone | 3 | 1 | | Ara-Set | | |
| Hyazinth-Ara / Ara hyacinthe | Vogel | Krone | 2 | 1 | | Ara-Set: 1/2/3 Arten = 4/10/20, Mehrfachsets wie bei Faltern | Hörnchen-Set | 20 je Set |
| Hoatzin | Vogel | | 3 | 1 | | 5 auf einem Gewässer oder Baum mit Igarapé, sonst 1 | Buchfink, gestuft | 15 |
| Schwertschnabelkolibri / Colibri porte-épée | Vogel | | 3 | 0 | | 1 pro Pflanze | Kolibri (Smoky) | 10 |
| Felsenhahn / Coq-de-roche | Vogel | | 2 | 1 | nimm 1 Karte von der Lichtung | 8 | Graureiher | 16 |
| Blauer Morpho / Morpho bleu | Falter, Insekt | | 4 | 0 | | Falter-Set | | |
| Heliconius / Héliconie | Falter, Insekt | | 3 | 0 | | Falter-Set | | |
| Eulenfalter / Caligo | Falter, Insekt | | 3 | 0 | | Falter-Set | | |
| Glasflügler / Greta oto | Falter, Insekt | | 3 | 0 | | Falter-Set: 1/2/3/4 Arten = 3/8/15/25, Mehrfachsets | Schmetterlinge | 25 je Set |
| Dreifinger-Faultier / Paresseux | Pfote | Krone | 4 | 1 | | 5 auf einer Cecropia, sonst 2 | Eichhörnchen auf Eiche | 20 |
| Bromelie / Broméliacée | Pflanze, Epiphyt | Krone | 3 | 1 | | 2; ein Frosch mit Bromelien-Symbol darf auf sie gelegt werden | neu | 6 |
| Orchidee / Orchidée | Pflanze, Epiphyt | Krone | 3 | 0 | | Pflanzenarten-Set 1/3/6/10/15 je Kopie | Fingerhut | 30 |
| Philodendron | Pflanze, Epiphyt | Krone | 3 | 1 | | 2 pro Epiphyt im Wald (inkl. selbst) | Hase-Logik | 18 |
| Feigenwespe / Guêpe du figuier | Insekt | | 3 | 0 | | 8 auf einer Würgefeige, sonst 1 | Buchfink, gestuft | 24 |
| Prachtbiene / Abeille euglossine | Insekt | | 3 | 1 | | 3 pro Paranussbaum | Wolf-Modell | 15 |

Summe: 3+3+3+3+3+2+3+3+2+4+3+3+3+4+3+3+3+3+3 = 57.

### 8.4 Unten-Slot (57 Hälften)

| Karte (de / fr) | Typ | Bedarf | Anz. | Kosten | Effekt | Punkte | Vorbild | Max |
|---|---|---|---|---|---|---|---|---|
| Färberfrosch / Dendrobate (Pfeilgiftfrosch) | Amphib | Bromelien-Symbol | 4 | 1 | | 5 auf einer Bromelie, sonst 2 | Buchfink, gestuft | 20 |
| Makifrosch / Phyllomedusa (Laubfrosch) | Amphib | Bromelien-Symbol | 3 | 0 | | 1 pro Insekt | Bergmolch, halbiert | 12 |
| Aga-Kröte / Crapaud buffle | Amphib | | 3 | 0 | | 1 pro Baum | Waldfrosch (Smoky) | 12 |
| Brillenkaiman / Caïman à lunettes | Reptil | Wasser | 3 | 2 | | 10 ab 3 Wasser-Arten im Wald, sonst 4 | Waldeidechse 5/15 | 30 |
| Anakonda / Anaconda | Reptil | Wasser | 3 | 2 | | 1 pro Nager + 1 pro Huf | Kreuzotter | 15 |
| Arapaima / Pirarucu | Fisch | Wasser | 3 | 2 | | 8 | Graureiher | 24 |
| Piranha | Fisch | Wasser | 3 | 0 | spiele eine Wasser-Karte aus der Hand gratis | 1 pro Piranha (n²: 1/4/9) | Hase | 9 |
| Zitteraal / Anguille électrique | Fisch | Wasser | 3 | 1 | | 3 pro Gewässer (benannt + Igarapé) ohne anderen Fisch | Bachforelle | 15 |
| Tambaqui | Fisch | Wasser | 3 | 1 | | 2 pro Igarapé im Wald | Hellbender (2 pro Fluss) | 12 |
| Amazonasdelfin / Dauphin rose (Boto) | Fisch-Symbol (Wassertier) | Wasser | 2 | 2 | | 2 pro Fisch | Graureiher (Smoky) | 16 |
| Blattschneiderameise / Fourmi coupe-feuille | Insekt | | 3 | 1 | | 3 pro Pilz im Wald | Wolf-Modell | 15 |
| Azteca-Ameise / Fourmi azteca | Insekt | | 3 | 0 | | 2 pro Cecropia | Keiler-Logik, linear | 12 |
| Herkuleskäfer / Dynaste Hercule | Insekt | | 2 | 1 | | 5 | Tigerkäfer | 10 |
| Wanderameisen / Fourmis légionnaires | Insekt | | 2 | 1 | | 2 pro Karte im Unten-Slot | Waldameise | 24 |
| Leuchtpilz / Champignon luminescent | Pilz | | 2 | 2 | Bonus: Extrazug | 0 | Pilze | 0 |
| Cordyceps | Pilz | | 2 | 2 | spiele ein Insekt aus der Hand gratis | 0 | Pilze | 0 |
| Termitenpilz / Termitomyces | Pilz | | 1 | 1 | nimm 2 Karten von der Lichtung | 0 | Pilze | 0 |
| Heliconia / Balisier | Pflanze | | 3 | 1 | | 2 pro Vogelart | Heidelbeere (Alpin) | 16 |
| Passionsblume / Passiflore | Pflanze | | 3 | 0 | | 2 pro Falter | Brennnessel | 16 |
| Victoria amazonica / Nénuphar géant | Pflanze | Wasser | 2 | 1 | | 2 pro Gewässer (benannt + Igarapé) | Moorfrosch-Logik, linear | 12 |
| Riesengürteltier / Tatou géant | Pfote | | 2 | 2 | | 10 wenn einzige Karte an seinem Baum, sonst 0 | Skunk | 20 |
| Paca | Nager, Pfote | | 2 | 0 | | 1 pro Nager | Weißfußmaus | 8 |

Summe: 4+3+3+3+3+3+3+3+3+2+3+3+2+2+2+2+1+3+3+2+2+2 = 57.

### 8.5 Links/Rechts-Slot (100 Hälften)

| Karte (de / fr) | Typ | Bedarf | Anz. | Kosten | Effekt | Punkte | Vorbild | Max |
|---|---|---|---|---|---|---|---|---|
| Jaguar | Pfote | | 3 | 3 | | Vergleich: 12 bei meisten Säugetieren (Pfote + Huf) aller Spieler, sonst 4 (Solo: 12 ab 8) | Buntspecht | 12 |
| Puma | Pfote | | 3 | 2 | | 2 pro Huf | Waldohreule-Modell | 14 |
| Ozelot | Pfote | | 3 | 1 | | 2 pro Nager | | 12 |
| Riesenotter / Loutre géante | Pfote | an Baum mit Igarapé | 3 | 2 | | 2 pro Fisch | Flussotter (Smoky), ein Symbol | 16 |
| Tapir | Huf | | 3 | 2 | | 1 pro Baum + 1 pro Pflanze | Rothirsch | 20 |
| Halsbandpekari / Pécari à collier | Huf | | 5 | 1 | | 1 pro Pekari (n²: 1/4/9/16/25) | Hase | 25 |
| Spießhirsch / Daguet | Huf | | 3 | 1 | | 3 pro Karte mit dem eigenen Baumsymbol (je Kopie ein anderes) | Reh | 15 |
| Capybara | Nager, Pfote | | 3 | 1 | | 15 bei höchstens 5 Bäumen, 7 bei 6 bis 10, 3 ab 11 | Sumpf-Blutauge | 15 |
| Agouti | Nager, Pfote | | 5 | 0 | | 1 pro Nager; Partner des Paranussbaums | Weißfußmaus | 10 |
| Brüllaffe / Hurleur | Affe, Pfote | | 3 | 1 | | Affen-Set | | |
| Klammeraffe / Atèle | Affe, Pfote | | 3 | 1 | | Affen-Set | | |
| Kapuziner / Capucin | Affe, Pfote | | 3 | 1 | | Affen-Set | | |
| Totenkopfaffe / Saïmiri | Affe, Pfote | | 3 | 1 | | Affen-Set | | |
| Wollaffe / Lagotriche | Affe, Pfote | | 3 | 1 | | Affen-Set: 5 je Affe ab 3 Arten, sonst 0 | Fledermäuse | 30 |
| Großer Ameisenbär / Tamanoir | Pfote | | 3 | 2 | | 3 pro Ameisen- und Termitenkarte | Wolf-Modell | 15 |
| Wickelbär / Kinkajou | Pfote | | 3 | 1 | | 15 wenn einzige Karte an seinem Baum, sonst 0 | Siebenschläfer | 15 |
| Nasenbär / Coati | Pfote | | 5 | 1 | ziehe 2, eine davon in die Höhle | 2 | Dachs | 2 |
| Tamandua | Pfote | | 3 | 0 | ziehe 1 | 3 | Maskenspitzmaus | 3 |
| Grüner Leguan / Iguane vert | Reptil | | 4 | 1 | | 1 pro Pflanze | Auerhuhn | 10 |
| Boa | Reptil | | 3 | 2 | | 10 ab 3 Reptil/Amphib-Arten, sonst 3 | Waldeidechse | 30 |
| Goliath-Vogelspinne / Mygale de Leblond | Insekt | | 3 | 1 | | 1 pro Insekt (inkl. selbst) | Thermometer-Grille | 10 |
| Zikade / Cigale | Insekt | | 4 | 0 | spiele ein Insekt aus der Hand gratis | 2 | Köcherfliege | 2 |
| Termiten / Termites | Insekt | | 5 | 0 | | 1 pro Höhlenkarte | Biber (Dartmoor) | 8 |
| Margay | Pfote | | 3 | 1 | | 5 | Genet | 5 |
| Liane | Pflanze | | 3 | 1 | | 1 pro Baum | Troll | 12 |
| Baumstachler / Coendou | Nager, Pfote | | 3 | 0 | nimm 1 Karte von der Lichtung | 3 | Spitzmaus | 3 |
| Opossum / Opossum commun | Pfote | | 4 | 1 | | 2 pro verschiedenem Baumsymbol an seinem Baum | Virginia-Opossum | 10 |
| Tayra | Pfote | | 3 | 1 | | 1 pro Pfote (inkl. selbst) | Graufuchs | 12 |
| Vanille / Vanillier | Pflanze | | 3 | 1 | | 1 pro Insekt | Honigbiene | 10 |
| Jaguarundi | Pfote | | 2 | 1 | | 2 pro Vogel | Rankende Waldrebe (Smoky) | 14 |

Summe: 3+3+3+3+3+5+3+3+5+15+3+3+5+3+4+3+3+4+5+3+3+3+4+3+3+2 = 100.

### 8.6 Hochwasserkarten (3)

Wie die Winterkarten: 2 im unteren Drittel, 1 obendrauf, die dritte beendet das Spiel. Kein weiterer Effekt.

---

## 9. Wapiti-Test für die großen Karten

| Karte | Potenzial | Was es kostet |
|---|---|---|
| Harpyie 21 | 3 pro Affe und Faultier | Affen sind Links/Rechts-Slots zu Kosten 1, Faultiere brauchen Kronendach; Huf- und Nager-Linien verlieren die Seiten |
| Affen-Set 30 | 6 Affen aus 3+ Arten | 6 Seiten-Slots, die Pekari, Tapir, Jaguar-Mehrheit und Ameisenbär auch wollen |
| Jaguar 12 | Mehrheit an Säugetieren | Vergleich, Mitspieler können gegenhalten |
| Paranussbaum 10 je Baum | Agouti (Seite) und Prachtbiene (oben) | zwei Slots für Karten, die sonst 1 bis 3 Punkte bringen |
| Kaiman 10 je Kopie, Boa 10 je Kopie | 3 Wasser-Arten bzw. 3 Reptil/Amphib-Arten | Unten-Slots unter Gewässern, die Fische und Pflanzen auch brauchen |
| Capybara 15 | höchstens 5 Bäume | ein kleiner Wald, also wenig Slots für alles andere |
| Kinkajou 15, Gürteltier 10 | allein am Baum | drei leere Slots pro Karte |
| Açaí n², Pekari n² | 5 Kopien derselben Art | Açaí sperrt Kronendach aus, Pekaris belegen 5 Seiten |
| Feigenwespe 8 je Kopie | auf Würgefeige | die Feige kostet 2 und löscht die Punkte des Wirts |
| Wanderameisen 24 | 12 Unten-Karten | voller Boden, dann fehlen Igarapés und Gewässer |
| Orchidee 15 je Kopie | 5 Pflanzenarten | Pflanzen in Oben- und Unten-Slots zugleich, Falter und Frösche verlieren Platz |

Keine Karte erreicht 30 mit einer Bedingung, die jeder Wald nebenbei erfüllt. Die höchsten Einzelwerte (Affen-Set, Wanderameisen, Orchideen) brauchen 6 bis 12 Karten derselben Linie.

---

## 10. Punktebudget und Prüfplan

Erwartung 2 Spieler, 10 Bäume, 2 Gewässer, 22 geteilte Karten, 5 Höhlenkarten:
Bäume 25 bis 40, Oben 35 bis 55, Unten 35 bis 55, Links/Rechts 70 bis 100, Gewässer 0 bis 10, Höhle 5. Summe 170 bis 265. Das liegt zwischen Dartmoor (Median 189) und Classic (Median 231).

Prüfplan vor dem Druck:

1. Papierprototyp mit Blanko-Karten, 10 Partien zu zweit, jede Partie in die App eintragen (eine "Amazonas"-Edition in der App ist ein Nachmittag Arbeit, Muster: `src/data/smoky-cards.ts` und `smoky-engine.ts`). Dann liefert dieselbe Auswertung wie oben die Kennzahlen aus Abschnitt 4, Punkt 8.
2. Kennzahlen pro Art nach 20 Wäldern: Häufigkeit, Punkte je Kopie, Anteil am Wald. Jede Art über 12 % Anteil oder 22 Punkte je Kopie wird um eine Stufe gesenkt (Multiplikator minus 1, Schwelle plus 1 Art, oder Kopien minus 1).
3. Kennzahl "Top-5-Anteil" unter 35 %. Smoky liegt bei 29 % mit nur 5 Arten; Ziel hier ist, dass die Top 5 aus verschiedenen Linien kommen.
4. Kronendach-Druck messen: Anteil der Oben-Karten mit Kronen-Symbol, die nicht gespielt werden konnten (Handkarten am Ende). Wenn Spieler regelmäßig auf Kronen-Karten sitzen bleiben, bekommt Cecropia (K, Kosten 0) 12 statt 10 Kopien.
5. Epiphyten: Anteil der Wälder mit 0, 1, 2, 3+ Epiphyten. Unter 30 % mit mindestens einem: Bromelie auf Kosten 0.
6. Harpyie und Affen-Set sind die beiden Karten mit Risiko nach oben. Wenn die Harpyie im Schnitt über 18 bringt, wird sie "2 pro Affe + 3 pro Faultier". Wenn das Affen-Set regelmäßig 30+ bringt, wird es "4 je Affe ab 3 Arten".

---

## 11. Offene Entscheidungen

- Bezahlbonus auf welchen Karten? Smoky setzt ihn auf etwa 25 Karten. Vorschlag: auf Pilze, Gewässer, Cecropia, Zikade, Tukan, Nasenbär, Tamandua, Baumstachler, Piranha, nie auf die Karten aus Abschnitt 9.
- Kronendach-Bedarf streng (nur K und E) oder weich (U-Bäume erlauben Kronen-Karten, wenn ein K-Baum im Wald steht)? Vorschlag: erst streng testen, weich ist die Rückfallebene.
- Solo-Regeln: Vergleichskarten haben Solo-Werte (Kautschuk 3 ab 3, Königsgeier 10 ab 8, Jaguar 12 ab 8), Rest wie das offizielle Automa-Solo.
- Namen: Deutsch/Französisch wie hier, oder Portugiesisch/Spanisch als dritte Zeile? Bei 180 Karten lieber zwei Sprachen.
- Illustrationen und Rechte: eigenes Material, keine Lookout-Grafik, Name "Forest Shuffle" nicht auf dem Prototyp (Arbeitstitel z. B. "Várzea").

---

## Anhang: verworfener Pyrenäen-Entwurf

Erster Entwurf (2026-11-06, gleicher Tag) mit Höhenstufen P/M/S auf den Bäumen, Hochlagen-Gelände (Estive, Bergsee, Geröllfeld) und Transhumance-Modul. Verworfen, weil 9 der Leitarten schon in der Alpin-Erweiterung stecken und die Höhenstufen-Mechanik dem Stockwerk-Prinzip aus Abschnitt 6.1 entspricht, nur mit weniger Fallhöhe. Die Stockwerke übernehmen die Idee, die Hochlagen-Verknappung wird zur Kronendach-Verknappung.
