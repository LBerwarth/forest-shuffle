"""Prototype deck "Várzea" (Amazonas edition): builds a printable HTML, 9 cards per A4 page.

Run: python design/cards/build.py  ->  design/cards/varzea-cartes.html
PDF: chrome --headless --print-to-pdf=... file:///.../varzea-cartes.html
"""
import html
import random
from pathlib import Path

OUT = Path(__file__).with_name("varzea-cartes.html")
OUT_ART = Path(__file__).with_name("varzea-artifact.html")
SEED = 42

# Tree symbols (card colour): name, hex, weight for random assignment to halves
TREES = [
    ("Fromager", "#8e44ad", 5), ("Noyer du Brésil", "#a0522d", 5), ("Bois canon", "#27ae60", 10),
    ("Acajou", "#c0392b", 6), ("Ébène verte", "#16a085", 6), ("Hévéa", "#f39c12", 6),
    ("Wassaï", "#2c3e50", 8), ("Bâche", "#d4ac0d", 6), ("Figuier", "#7f8c8d", 4),
]
TREE_COLOR = {t[0]: t[1] for t in TREES}

ICON_DIR = Path(__file__).resolve().parents[2] / "src" / "assets" / "icons"


def tile(color, glyph):
    return (f'<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" rx="6" fill="{color}"/>'
            f'{glyph}</svg>')


def app_icon(name):
    svg = (ICON_DIR / f"{name}.svg").read_text(encoding="utf-8")
    return svg[svg.index("<svg"):]


ICONS = {
    "OISEAU": app_icon("bird"), "INSECTE": app_icon("insect"), "PAPILLON": app_icon("butterfly"),
    "AMPHIBIEN": app_icon("amphibian"), "REPTILE": app_icon("amphibian"), "POISSON": app_icon("fish"),
    "PLANTE": app_icon("plant"), "CHAMPIGNON": app_icon("mushroom"), "PATTE": app_icon("pawed"),
    "ONGULÉ": app_icon("cloven_hoofed"), "RONGEUR": app_icon("mouse"), "ARBRE": app_icon("tree"),
    "GROTTE": app_icon("cave"),
    "SINGE": tile("#C98A3C", '<g fill="#fff"><circle cx="7" cy="14" r="3.6"/><circle cx="25" cy="14" r="3.6"/>'
                   '<circle cx="16" cy="15" r="9"/></g><path d="M9.5 17c0-4 3-7 6.5-7s6.5 3 6.5 7c0 3.5-3 6-6.5 6S9.5 20.5 9.5 17z" fill="#C98A3C"/>'
                   '<g fill="#fff"><circle cx="13" cy="15.5" r="1.3"/><circle cx="19" cy="15.5" r="1.3"/></g>'
                   '<path d="M13 20.5c1.5 1.5 4.5 1.5 6 0" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round"/>'),
    "EAU": tile("#1d3f73", '<path d="M16 4c5 7 9 11.5 9 16.5A9 9 0 0 1 7 20.5C7 15.5 11 11 16 4z" fill="#fff"/>'),
    "IGARAPÉ": tile("#1d3f73", '<path d="M16 3c4 5.5 7 9 7 13a7 7 0 0 1-14 0c0-4 3-7.5 7-13z" fill="#fff"/>'
                    '<path d="M4 26c3-2 5-2 8 0s5 2 8 0 5-2 8 0" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/>'),
    "CANOPÉE": tile("#1d3f73", '<path d="M5 17Q3.5 12 6 7Q6 3 10 4Q11 2 14 4Q16 2 18 4Q21 2 22 4Q26 3 26 7Q28.5 12 27 17Z" fill="#fff"/>'
                    '<path d="M14.5 17h3v6h-3z" fill="#fff"/><path d="M4 27h24" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>'),
    "ÉPIPHYTE": tile("#2e7d32", '<path d="M3 22h26" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>'
                     '<path d="M16 21c-7 0-9-7-9-12 5 0 11 3 11 10z" fill="#fff"/><path d="M16 21c0-5 3-9 8-11 1 5-1 11-8 11z" fill="#fff" opacity=".85"/>'),
    "BROMÉLIA": tile("#2e7d32", '<path d="M16 4l2.5 7 6.5-4-4 6.5 7 2.5-7 2.5 4 6.5-6.5-4L16 28l-2.5-7-6.5 4 4-6.5L4 16l7-2.5-4-6.5 6.5 4z" fill="#fff"/>'
                     '<circle cx="16" cy="16" r="3" fill="#2e7d32"/>'),
    "PLAN D'EAU": tile("#2B5EA7", '<g stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round">'
                       '<path d="M4 11c3-2 5-2 8 0s5 2 8 0 5-2 8 0"/><path d="M4 18c3-2 5-2 8 0s5 2 8 0 5-2 8 0"/><path d="M4 25c3-2 5-2 8 0s5 2 8 0 5-2 8 0"/></g>'),
    "CRUE": tile("#5b7fa6", '<g stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round">'
                 '<path d="M4 14c3-2 5-2 8 0s5 2 8 0 5-2 8 0"/><path d="M4 21c3-2 5-2 8 0s5 2 8 0 5-2 8 0"/></g>'
                 '<path d="M16 3l5 6h-3v3h-4V9h-3z" fill="#fff"/>'),
}
for k, hi in (("E", 0), ("C", 1), ("S", 2)):
    bars = "".join(f'<rect x="5" y="{6 + i * 8}" width="22" height="5" rx="1.5" fill="#fff" opacity="{1 if i == hi else .35}"/>' for i in range(3))
    ICONS[f"STRATE_{k}"] = tile("#5b3a1e", bars)
TREE_GLYPH = ('<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g fill="#fff">'
              '<path d="M5 17Q3.5 12 6 7Q6 3 10 4Q11 2 14 4Q16 2 18 4Q21 2 22 4Q26 3 26 7Q28.5 12 27 17L18.5 17Q16 19 13.5 17L5 17Z"/>'
              '<path d="M14 17L18 17L18.3 25L19.5 28Q16 28.5 12.5 28L13.7 25Z"/></g></svg>')

def _leaf(cx, cy, rx, ry, rot):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" transform="rotate({rot} {cx} {cy})" fill="#fff"/>'


TREE_GLYPHS = {
    # palmate compound leaf, 7 leaflets from one point
    "Fromager": "".join(_leaf(16 + 9 * __import__("math").cos(__import__("math").radians(a)), 19 + 9 * __import__("math").sin(__import__("math").radians(a)), 6.5, 2.2, a)
                        for a in (-150, -120, -90, -60, -30, 180, 0)) + '<rect x="15" y="19" width="2" height="9" fill="#fff"/>',
    # simple oblong leaf with midrib
    "Noyer du Brésil": _leaf(16, 16, 5, 12, 0) + '<line x1="16" y1="6" x2="16" y2="27" stroke="#a0522d" stroke-width="1"/>',
    # round, palmately lobed (Cecropia)
    "Bois canon": "".join(_leaf(16 + 7.5 * __import__("math").cos(__import__("math").radians(a)), 16 + 7.5 * __import__("math").sin(__import__("math").radians(a)), 5.5, 2.6, a) for a in range(0, 360, 45))
                  + '<circle cx="16" cy="16" r="6" fill="#fff"/><circle cx="16" cy="16" r="1.4" fill="#27ae60"/>',
    # pinnate compound leaf
    "Acajou": '<line x1="16" y1="5" x2="16" y2="28" stroke="#fff" stroke-width="1.6"/>'
              + "".join(_leaf(11, y, 4, 1.8, -35) + _leaf(21, y, 4, 1.8, 35) for y in (10, 16, 22)),
    # trumpet flower (Tabebuia)
    "Ébène verte": "".join(_leaf(16 + 7 * __import__("math").cos(__import__("math").radians(a)), 16 + 7 * __import__("math").sin(__import__("math").radians(a)), 5, 3.2, a) for a in (-90, -18, 54, 126, 198))
                   + '<circle cx="16" cy="16" r="3" fill="#16a085"/>',
    # trifoliate leaf
    "Hévéa": _leaf(16, 11, 3.2, 8, 0) + _leaf(9, 17, 3.2, 8, -55) + _leaf(23, 17, 3.2, 8, 55) + '<rect x="15.2" y="19" width="1.6" height="9" fill="#fff"/>',
    # pinnate palm frond
    "Wassaï": '<path d="M6 26 Q16 4 27 8" stroke="#fff" stroke-width="1.8" fill="none"/>'
                      + "".join(f'<line x1="{x}" y1="{y}" x2="{x - 4}" y2="{y + 6}" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>'
                                for x, y in ((11, 16), (14, 11), (17, 8), (20, 6), (23, 5.5)))
                      + "".join(f'<line x1="{x}" y1="{y}" x2="{x + 5}" y2="{y + 4}" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>'
                                for x, y in ((13, 14), (16, 10), (19, 7.5), (22, 6))),
    # fan palm
    "Bâche": '<path d="M16 23 L4 14 A14 14 0 0 1 28 14 Z" fill="#fff"/>'
                     + "".join(f'<line x1="16" y1="23" x2="{x}" y2="{y}" stroke="#d4ac0d" stroke-width="1"/>' for x, y in ((5, 15), (8, 11), (12, 9), (16, 8), (20, 9), (24, 11), (27, 15)))
                     + '<rect x="15.2" y="22" width="1.6" height="7" fill="#fff"/>',
    # ovate leaf with drip tip and aerial roots
    "Figuier": '<path d="M16 4 C9 8 7 14 9 19 C11 23 14 24 16 29 C18 24 21 23 23 19 C25 14 23 8 16 4 Z" fill="#fff"/>'
               + '<line x1="16" y1="8" x2="16" y2="26" stroke="#7f8c8d" stroke-width="1"/>'
               + '<path d="M6 20 v9 M26 20 v9" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>',
}


def tree_sym(name):
    return f'<span class="tsym" title="{esc(name)}">{tile(TREE_COLOR[name], TREE_GLYPHS[name])}</span>'


def ic(key):
    return f'<span class="ic">{ICONS[key]}</span>'


# ---------------- species pictures (design/cards/img, see fetch_images.py)
import base64
import json
import re
import unicodedata

IMG_DIR = Path(__file__).with_name("img")
CREDITS = json.loads((IMG_DIR / "credits.json").read_text(encoding="utf-8")) if (IMG_DIR / "credits.json").exists() else {}
MODE = "print"  # "print": <img src="img/..."> ; "art": CSS background with data URI (single-file artifact)


def slug(name):
    t = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")


def pic_file(name):
    k = slug(name)
    return next(iter(IMG_DIR.glob(f"{k}.*")), None) if k in CREDITS else None


def pic(sp):
    f = pic_file(sp["name"])
    if not f:
        return '<div class="pic"></div>'
    if MODE == "print":
        return f'<div class="pic"><img src="img/{f.name}" alt=""></div>'
    return f'<div class="pic p-{slug(sp["name"])}"></div>'


def art_pic_css():
    rules = []
    for sp in SPECIES:
        f = pic_file(sp["name"])
        if f:
            mime = "image/png" if f.suffix == ".png" else "image/jpeg"
            b64 = base64.b64encode(f.read_bytes()).decode()
            rules.append(f'.p-{slug(sp["name"])}{{background-image:url(data:{mime};base64,{b64})}}')
    return "\n".join(rules)


def credits_html():
    if not CREDITS:
        return ""
    rows = "".join(f'<li><b>{esc(c["name"])}</b> : {esc(c["file"][5:])} · {esc(c["author"] or "auteur inconnu")} · '
                   f'{esc(c["license"] or "licence non précisée")} · {esc(c["kind"])}</li>' for c in CREDITS.values())
    return ('<section class="rules credits"><h2>Crédits des images</h2><p class="small">Toutes les images viennent de '
            'Wikimedia Commons ou Wikipédia, utilisées ici pour un prototype privé. Fichier, auteur et licence par carte :</p>'
            f'<ul>{rows}</ul></section>')


# slot: arbre | eau | grotte | crue | haut | bas | cote
# fields: name, slot, n, cost, types, req, props, strate, effet, bonus, regle, points
def c(name, slot, n, cost, types=(), req=None, props=(), strate=None, effet="", bonus="", regle="", points=""):
    return dict(name=name, slot=slot, n=n, cost=cost, types=list(types), req=req, props=list(props),
                strate=strate, effet=effet, bonus=bonus, regle=regle, points=points)

SPECIES = [
    # ---------------- ARBRES (56)
    c("Fromager", "arbre", 5, 3, strate="E", points="2 pts par carte attachée à cet arbre (igarapé et cartes dessous comprises)"),
    c("Noyer du Brésil", "arbre", 5, 2, strate="E", points="10 pts si Agouti ET Abeille euglossine dans votre forêt, 3 pts si l'un des deux, sinon 0"),
    c("Bois canon", "arbre", 10, 0, strate="C", effet="Piochez 1 carte.", points="1 pt"),
    c("Acajou", "arbre", 6, 2, strate="C", points="5 pts"),
    c("Ébène verte", "arbre", 6, 1, strate="C", points="1 pt par oiseau dans votre forêt"),
    c("Hévéa", "arbre", 6, 1, strate="C", bonus="Tour supplémentaire.", points="3 pts par Hévéa si vous avez le plus d'Hévéas (égalité comprise), sinon 1 pt. Solo : 3 pts à partir de 3 Hévéas"),
    c("Palmier wassaï", "arbre", 8, 1, strate="S", points="1 / 4 / 9 / 16 / 25 pts pour 1 / 2 / 3 / 4 / 5 Wassaï (n²)"),
    c("Palmier bâche", "arbre", 6, 1, strate="S", effet="Piochez 1 carte.", points="1 pt par plan d'eau (rivières, bras morts, cascades, igarapés)"),
    c("Figuier étrangleur", "arbre", 4, 2, strate="hôte",
      regle="Se joue SUR un de vos arbres. L'hôte ne rapporte plus de points et ne compte plus comme son espèce ; il garde sa strate, ses emplacements et ses cartes.",
      points="2 pts par carte attachée à cet arbre"),
    # ---------------- PLANS D'EAU (9)
    c("Rivière", "eau", 3, 2, bonus="Tour supplémentaire.", points="1 pt par poisson dans votre forêt"),
    c("Bras mort", "eau", 3, 2, regle="Permanent : jusqu'à 4 cartes EAU en dessous au lieu de 2.", bonus="Jouez gratuitement une carte EAU de la clairière.", points="0 pt"),
    c("Cascade", "eau", 3, 2, regle="Permanent : chaque fois que vous jouez une carte EAU, piochez 1 carte.", points="0 pt"),
    # ---------------- GROTTES (5) and CRUE (3)
    c("Arbre creux", "grotte", 1, 0, effet="Mise en place : placez 2 cartes du paquet dans votre grotte.", points="1 pt par carte dans votre grotte"),
    c("Terrier de berge", "grotte", 1, 0, effet="Mise en place : piochez 2 cartes de plus en main.", points="1 pt par carte dans votre grotte"),
    c("Termitière", "grotte", 1, 0, effet="Mise en place : prenez gratuitement un arbre de la clairière dans votre forêt.", points="1 pt par carte dans votre grotte"),
    c("Contrefort", "grotte", 1, 0, effet="Une fois par partie : placez 1 carte de votre main dans la grotte et piochez 2.", points="1 pt par carte dans votre grotte"),
    c("Inselberg", "grotte", 1, 0, effet="Limite de main : 11 cartes au lieu de 10.", points="1 pt par carte dans votre grotte"),
    c("La crue monte", "crue", 3, 0, regle="Si c'est la 3e carte de crue, la partie s'arrête immédiatement. Sinon, placez-la à côté de la clairière et piochez une nouvelle carte."),
    # ---------------- HAUT (57)
    c("Harpie féroce", "haut", 3, 3, ["OISEAU"], req="CANOPÉE", points="3 pts par singe et 3 pts par paresseux dans votre forêt"),
    c("Sarcoramphe roi", "haut", 3, 1, ["OISEAU"], effet="Placez 2 cartes de la clairière dans votre grotte.", points="10 pts si vous avez le plus de cartes en grotte (égalité comprise), sinon 2 pts. Solo : 10 pts à partir de 8"),
    c("Toucan toco", "haut", 3, 1, ["OISEAU"], req="CANOPÉE", bonus="Jouez gratuitement un arbre de la clairière.", points="2 pts"),
    c("Ara rouge", "haut", 3, 1, ["OISEAU"], req="CANOPÉE", points="Série d'aras : 4 / 10 / 20 pts pour 1 / 2 / 3 espèces d'aras différentes (séries multiples possibles)"),
    c("Ara bleu", "haut", 3, 1, ["OISEAU"], req="CANOPÉE", points="Série d'aras : 4 / 10 / 20 pts pour 1 / 2 / 3 espèces d'aras différentes (séries multiples possibles)"),
    c("Ara hyacinthe", "haut", 2, 1, ["OISEAU"], req="CANOPÉE", points="Série d'aras : 4 / 10 / 20 pts pour 1 / 2 / 3 espèces d'aras différentes (séries multiples possibles)"),
    c("Hoazin huppé", "haut", 3, 1, ["OISEAU"], points="5 pts sur un plan d'eau ou sur un arbre avec igarapé, sinon 1 pt"),
    c("Colibri topaze", "haut", 2, 0, ["OISEAU"], points="1 pt par plante dans votre forêt"),
    c("Martin-pêcheur à collier", "haut", 2, 1, ["OISEAU"], points="6 pts par plan d'eau complet (tous ses emplacements occupés, igarapés exclus)"),
    c("Coq-de-roche", "haut", 2, 1, ["OISEAU"], effet="Prenez 1 carte de la clairière.", points="8 pts"),
    c("Morpho bleu", "haut", 3, 0, ["PAPILLON", "INSECTE"], points="Série de papillons : 3 / 8 / 15 / 25 pts pour 1 / 2 / 3 / 4 espèces différentes (séries multiples)"),
    c("Héliconius", "haut", 3, 0, ["PAPILLON", "INSECTE"], points="Série de papillons : 3 / 8 / 15 / 25 pts pour 1 / 2 / 3 / 4 espèces différentes (séries multiples)"),
    c("Caligo", "haut", 3, 0, ["PAPILLON", "INSECTE"], points="Série de papillons : 3 / 8 / 15 / 25 pts pour 1 / 2 / 3 / 4 espèces différentes (séries multiples)"),
    c("Greta oto", "haut", 3, 0, ["PAPILLON", "INSECTE"], points="Série de papillons : 3 / 8 / 15 / 25 pts pour 1 / 2 / 3 / 4 espèces différentes (séries multiples)"),
    c("Paresseux à trois doigts", "haut", 4, 1, ["PATTE"], req="CANOPÉE", points="5 pts sur un Bois canon, sinon 2 pts"),
    c("Broméliacée", "haut", 3, 1, ["PLANTE"], req="CANOPÉE", props=["ÉPIPHYTE"], regle="Une grenouille portant le symbole BROMÉLIA peut être posée sur cette carte.", points="2 pts"),
    c("Orchidée", "haut", 3, 0, ["PLANTE"], req="CANOPÉE", props=["ÉPIPHYTE"], points="1 / 3 / 6 / 10 / 15 pts pour 1 / 2 / 3 / 4 / 5+ espèces de plantes dans votre forêt"),
    c("Philodendron", "haut", 3, 1, ["PLANTE"], req="CANOPÉE", props=["ÉPIPHYTE"], points="2 pts par épiphyte dans votre forêt (lui compris)"),
    c("Guêpe du figuier", "haut", 3, 0, ["INSECTE"], points="8 pts sur un Figuier étrangleur, sinon 1 pt"),
    c("Abeille euglossine", "haut", 3, 1, ["INSECTE"], points="3 pts par Noyer du Brésil dans votre forêt"),
    # ---------------- BAS (57)
    c("Dendrobate", "bas", 4, 1, ["AMPHIBIEN"], props=["BROMÉLIA"], points="5 pts sur une Broméliacée, sinon 2 pts"),
    c("Phyllomédusa", "bas", 3, 0, ["AMPHIBIEN"], props=["BROMÉLIA"], points="1 pt par insecte dans votre forêt"),
    c("Crapaud buffle", "bas", 3, 0, ["AMPHIBIEN"], points="1 pt par arbre dans votre forêt"),
    c("Caïman à lunettes", "bas", 3, 2, ["REPTILE"], req="EAU", points="10 pts si au moins 3 espèces EAU différentes dans votre forêt, sinon 4 pts"),
    c("Anaconda vert", "bas", 3, 2, ["REPTILE"], req="EAU", points="1 pt par rongeur + 1 pt par ongulé"),
    c("Arapaïma", "bas", 3, 2, ["POISSON"], req="EAU", points="8 pts"),
    c("Piranha rouge", "bas", 3, 0, ["POISSON"], req="EAU", effet="Jouez gratuitement une carte EAU de votre main.", points="1 / 4 / 9 pts pour 1 / 2 / 3 Piranhas (n²)"),
    c("Anguille électrique", "bas", 3, 1, ["POISSON"], req="EAU", points="3 pts par plan d'eau sans autre poisson en dessous"),
    c("Tambaqui", "bas", 3, 1, ["POISSON"], req="EAU", points="2 pts par igarapé dans votre forêt"),
    c("Dauphin rose", "bas", 2, 2, ["POISSON"], req="EAU", points="2 pts par poisson dans votre forêt"),
    c("Fourmi coupe-feuille", "bas", 3, 1, ["INSECTE"], points="3 pts par champignon dans votre forêt"),
    c("Fourmi azteca", "bas", 3, 0, ["INSECTE"], points="2 pts par Bois canon dans votre forêt"),
    c("Dynaste Hercule", "bas", 2, 1, ["INSECTE"], points="5 pts"),
    c("Fourmis légionnaires", "bas", 2, 1, ["INSECTE"], points="2 pts par carte en emplacement bas dans votre forêt"),
    c("Champignon luminescent", "bas", 2, 2, ["CHAMPIGNON"], bonus="Tour supplémentaire.", points="0 pt"),
    c("Cordyceps", "bas", 2, 2, ["CHAMPIGNON"], bonus="Jouez gratuitement un insecte de votre main.", points="0 pt"),
    c("Termitomyces", "bas", 1, 1, ["CHAMPIGNON"], bonus="Prenez 2 cartes de la clairière.", points="0 pt"),
    c("Balisier", "bas", 3, 1, ["PLANTE"], points="2 pts par espèce d'oiseau différente"),
    c("Passiflore", "bas", 3, 0, ["PLANTE"], points="2 pts par papillon dans votre forêt"),
    c("Victoria amazonica", "bas", 2, 1, ["PLANTE"], req="EAU", points="2 pts par plan d'eau dans votre forêt"),
    c("Tatou géant", "bas", 2, 2, ["PATTE"], points="10 pts s'il est la seule carte sur son arbre, sinon 0"),
    c("Paca", "bas", 2, 0, ["RONGEUR", "PATTE"], points="1 pt par rongeur dans votre forêt"),
    # ---------------- CÔTÉ (100)
    c("Jaguar", "cote", 3, 3, ["PATTE"], points="12 pts si vous avez le plus de mammifères (PATTE + ONGULÉ), égalité comprise, sinon 4 pts. Solo : 12 pts à partir de 8"),
    c("Puma", "cote", 3, 2, ["PATTE"], points="2 pts par ongulé dans votre forêt"),
    c("Ocelot", "cote", 3, 1, ["PATTE"], points="2 pts par rongeur dans votre forêt"),
    c("Loutre géante", "cote", 3, 2, ["PATTE"], req="IGARAPÉ", points="2 pts par poisson dans votre forêt"),
    c("Tapir du Brésil", "cote", 3, 2, ["ONGULÉ"], points="1 pt par arbre + 1 pt par plante"),
    c("Pécari à collier", "cote", 5, 1, ["ONGULÉ"], points="1 / 4 / 9 / 16 / 25 pts pour 1 / 2 / 3 / 4 / 5 Pécaris (n²)"),
    c("Daguet rouge", "cote", 3, 1, ["ONGULÉ"], points="3 pts par carte de votre forêt portant son symbole d'arbre (lui compris)"),
    c("Capybara", "cote", 3, 1, ["RONGEUR", "PATTE"], points="15 pts si 5 arbres ou moins, 7 pts de 6 à 10 arbres, 3 pts à partir de 11"),
    c("Agouti doré", "cote", 5, 0, ["RONGEUR", "PATTE"], points="1 pt par rongeur dans votre forêt"),
    c("Hurleur roux", "cote", 3, 1, ["SINGE", "PATTE"], points="Série de singes : 5 pts par singe si au moins 3 espèces de singes, sinon 0"),
    c("Atèle noir", "cote", 3, 1, ["SINGE", "PATTE"], points="Série de singes : 5 pts par singe si au moins 3 espèces de singes, sinon 0"),
    c("Capucin", "cote", 3, 1, ["SINGE", "PATTE"], points="Série de singes : 5 pts par singe si au moins 3 espèces de singes, sinon 0"),
    c("Saïmiri", "cote", 3, 1, ["SINGE", "PATTE"], points="Série de singes : 5 pts par singe si au moins 3 espèces de singes, sinon 0"),
    c("Singe laineux", "cote", 3, 1, ["SINGE", "PATTE"], points="Série de singes : 5 pts par singe si au moins 3 espèces de singes, sinon 0"),
    c("Tamanoir", "cote", 3, 2, ["PATTE"], points="3 pts par carte fourmi ou termite dans votre forêt"),
    c("Kinkajou", "cote", 3, 1, ["PATTE"], points="15 pts s'il est la seule carte sur son arbre, sinon 0"),
    c("Coati roux", "cote", 5, 1, ["PATTE"], bonus="Piochez 2 cartes, placez-en 1 dans votre grotte.", points="2 pts"),
    c("Tamandua", "cote", 3, 0, ["PATTE"], effet="Piochez 1 carte.", points="3 pts"),
    c("Iguane vert", "cote", 4, 1, ["REPTILE"], points="1 pt par plante dans votre forêt"),
    c("Boa constricteur", "cote", 3, 2, ["REPTILE"], points="10 pts si au moins 3 espèces REPTILE / AMPHIBIEN différentes, sinon 3 pts"),
    c("Mygale de Leblond", "cote", 3, 1, ["INSECTE"], points="1 pt par insecte dans votre forêt (elle comprise)"),
    c("Cigale", "cote", 4, 0, ["INSECTE"], effet="Jouez gratuitement un insecte de votre main.", points="2 pts"),
    c("Termites", "cote", 5, 0, ["INSECTE"], points="1 pt par carte dans votre grotte"),
    c("Margay", "cote", 3, 2, ["PATTE"], points="4 pts par arbre complet (tous ses emplacements occupés)"),
    c("Liane", "cote", 3, 1, ["PLANTE"], points="1 pt par arbre dans votre forêt"),
    c("Coendou", "cote", 3, 0, ["RONGEUR", "PATTE"], effet="Prenez 1 carte de la clairière.", points="3 pts"),
    c("Opossum commun", "cote", 4, 1, ["PATTE"], points="2 pts par symbole d'arbre différent sur son arbre (cartes attachées comprises)"),
    c("Tayra", "cote", 3, 1, ["PATTE"], points="1 pt par PATTE dans votre forêt (lui compris)"),
    c("Vanillier", "cote", 3, 1, ["PLANTE"], points="1 pt par insecte dans votre forêt"),
    c("Jaguarundi", "cote", 2, 1, ["PATTE"], points="2 pts par oiseau dans votre forêt"),
]

RULES_TPL = """
<section class="rules">
<h1>Várzea · prototype v0.1 · règles spécifiques</h1>
<p>Tronc commun des trois Forest Shuffle : 2 cartes à piocher ou 1 carte à jouer, main max. 10, clairière vidée à 10, coût payé dans la clairière, un arbre joué ajoute 1 carte du paquet à la clairière. Bonus (flèche) : si toutes les cartes payées portent le même symbole d'arbre que la carte jouée, son bonus s'applique. Mise en place : retirez 45 / 30 / 15 / 0 cartes à 2 / 3 / 4 / 5 joueurs, 3 cartes de crue dans le tiers inférieur (2 mélangées, 1 dessus), 6 cartes en main, 1 grotte chacun.</p>
<h2>Strates</h2>
<p>Chaque arbre porte une strate : <b>E</b> émergent, <b>C</b> canopée, <b>S</b> sous-bois. Les cartes du haut portant le symbole <span class="badge req">CANOPÉE</span> ne peuvent être posées que sur un arbre C ou E. Les arbres S (Wassaï, Bâche) et les plans d'eau n'acceptent en haut que des cartes sans ce symbole. Les arbres E ont <b>2 emplacements en haut</b> : le second est réservé aux cartes CANOPÉE.</p>
<h2>Plans d'eau et igarapé</h2>
<p>Rivière, Bras mort et Cascade se posent à l'horizontale : 2 emplacements en haut, 2 en bas, en bas uniquement des cartes <span class="badge req">EAU</span>. Chaque plan d'eau porte un symbole d'arbre, comme les moitiés de carte (bonus de paiement, Daguet, Opossum). <b>Igarapé</b> : quand vous jouez un arbre, vous pouvez poser en plus une carte de votre main face cachée sous cet arbre. L'arbre a alors 2 emplacements en bas, réservés aux cartes EAU. Pas d'igarapé après coup. Les cartes <span class="badge req">IGARAPÉ</span> (Loutre géante) se posent à gauche ou à droite d'un arbre avec igarapé.</p>
<h2>Épiphytes</h2>
<p>Une plante <span class="badge prop">ÉPIPHYTE</span> peut être glissée dans un emplacement du haut déjà occupé (un seul épiphyte par emplacement). Elle exige la canopée. Une grenouille <span class="badge prop">BROMÉLIA</span> peut être posée sur une Broméliacée au lieu d'un emplacement du bas.</p>
<h2>Figuier étrangleur</h2>
<p>Se joue sur un de vos arbres. L'hôte ne rapporte plus de points et ne compte plus comme son espèce ; il garde sa strate, ses emplacements et ses cartes. Le Figuier compte comme une espèce d'arbre.</p>
<h2>Décompte</h2>
<p>Somme des points de toutes les cartes visibles + 1 pt par carte dans la grotte. Les séries (papillons, aras, singes) et les cartes de comparaison (Hévéa, Sarcoramphe roi, Jaguar) se calculent comme indiqué sur les cartes. Égalité = victoire partagée. <b>Complet</b> (Margay, Martin-pêcheur) = tous les emplacements d'un arbre ou d'un plan d'eau sont occupés ; un épiphyte ne crée pas d'emplacement, une Broméliacée avec sa grenouille compte pour un emplacement.</p>
<h2>Symboles</h2>
<p class="legend">
{LEGEND}
<br>Sur les cartes, les symboles sont des tuiles sans texte ; la tuile colorée en haut à droite de chaque moitié est son symbole d'arbre (bonus de paiement, Daguet, Opossum). Le coin supérieur gauche est le coût. "×N" = nombre d'exemplaires dans le paquet.</p>
<p class="small">Prototype de test, texte seul, sans illustration. Édition maison, non affiliée à Lookout.</p>
</section>
"""

LEGEND = lambda: (" ".join(badge(t, icon=t, text=True) for t in ["OISEAU", "INSECTE", "PAPILLON", "AMPHIBIEN", "REPTILE", "POISSON", "PLANTE", "CHAMPIGNON", "PATTE", "SINGE", "RONGEUR", "ONGULÉ"])
          + " (papillon = aussi insecte ; singe et rongeur = aussi patte ; amphibien et reptile = même famille)<br>Besoins : "
          + " ".join(badge(t, "req", t, text=True) for t in ["CANOPÉE", "EAU", "IGARAPÉ"]) + " · Propriétés : "
          + " ".join(badge(t, "prop", t, text=True) for t in ["ÉPIPHYTE", "BROMÉLIA"]) + " · Strates : "
          + " ".join(badge(l, "strate", f"STRATE_{k}", text=True) for k, l in [("E", "ÉMERGENT"), ("C", "CANOPÉE"), ("S", "SOUS-BOIS")])
          + " · Types de carte : " + " ".join(badge(l, icon=l, text=True) for l in ["ARBRE", "PLAN D'EAU", "GROTTE", "CRUE"])
          + "<br>Symboles d'arbre : " + " ".join(f'{tree_sym(n)} {esc(n)}' for n in TREE_COLOR))

CSS = """
@page { size: A4; margin: 8mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; color: #111; }
.page { display: grid; grid-template-columns: repeat(3, 63mm); grid-auto-rows: 88mm; gap: 0; justify-content: center;
        page-break-after: always; }
.card { width: 63mm; height: 88mm; border: 0.25mm solid #999; overflow: hidden; position: relative; background: #fff; }
.card.land .in { width: 88mm; height: 63mm; transform: rotate(90deg) translate(0, -63mm); transform-origin: top left; }
.in { width: 100%; height: 100%; display: flex; flex-direction: column; }
.land .in { flex-direction: row; }
.half { flex: 1 1 0; padding: 1.6mm 2mm; display: flex; flex-direction: column; min-height: 0; min-width: 0; }
.half + .half { border-top: 0.3mm dashed #aaa; }
.land .half + .half { border-top: 0; border-left: 0.3mm dashed #aaa; }
.full { padding: 2mm 2.5mm; display: flex; flex-direction: column; height: 100%; }
.head { display: flex; align-items: center; gap: 1.2mm; }
.cost { width: 4.4mm; height: 6mm; border-radius: 0.8mm; background: #222; color: #fff; font-weight: 700; font-size: 8.5pt;
        display: flex; align-items: center; justify-content: center; flex: none; }
.name { font-weight: 700; font-size: 9pt; line-height: 1.05; flex: 1; }
.full .name { font-size: 10pt; }
.tree { font-size: 5.6pt; color: #fff; padding: 0.5mm 1.2mm; border-radius: 1mm; font-weight: 600; white-space: nowrap; flex: none; }
.badges { display: flex; flex-wrap: wrap; gap: 0.6mm; margin: 0.9mm 0; }
.badge { font-size: 5.6pt; font-weight: 700; letter-spacing: 0.1px; border: 0.25mm solid #333; border-radius: 0.8mm; padding: 0.2mm 0.9mm; background: #f2f2f2; }
.badge.req { background: #1d3f73; color: #fff; border-color: #1d3f73; }
.badge.prop { background: #2e7d32; color: #fff; border-color: #2e7d32; }
.badge.strate { background: #5b3a1e; color: #fff; border-color: #5b3a1e; }
.badge { display: inline-flex; align-items: center; gap: 0.7mm; }
.ic { display: inline-block; width: 3.4mm; height: 3.4mm; flex: none; } .ic svg { width: 100%; height: 100%; display: block; }
.tsym { display: inline-flex; flex: none; } .tsym svg { width: 4.6mm; height: 4.6mm; display: block; }
.badge.ico { padding: 0; border: 0; background: none; } .badge.ico .ic { width: 5mm; height: 5mm; }
.badges { gap: 1mm; }
.txt { font-size: 7.2pt; line-height: 1.22; flex: 0 0 auto; }
.pic { flex: 1 1 0; min-height: 8mm; margin: 0.6mm 0; border-radius: 1mm; overflow: hidden; background: #eee; }
.pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.credits { font-size: 6.5pt; columns: 2; } .credits li { margin: 0 0 0.6mm; } .credits h2 { column-span: all; }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.full .txt { font-size: 7.6pt; }
.txt b { font-weight: 700; }
.pts { font-size: 7.8pt; font-weight: 700; line-height: 1.2; margin-top: 0.6mm; }
.full .pts { font-size: 8.4pt; }
.foot { display: flex; justify-content: space-between; font-size: 5.2pt; color: #666; margin-top: 0.6mm; }
.rules { font-size: 8.6pt; line-height: 1.35; padding: 2mm 4mm; page-break-after: always; }
.rules h1 { font-size: 14pt; margin: 0 0 2mm; } .rules h2 { font-size: 10pt; margin: 3mm 0 1mm; }
.rules p { margin: 0 0 1.5mm; } .rules .small { color: #666; font-size: 7.5pt; } .legend .badge { font-size: 6.5pt; }
@media screen { body { background: #ddd; } .page, .rules { background: #fff; width: 210mm; margin: 6mm auto; padding: 8mm 0; } }
"""

ART_CSS = """
/* layout: rules first, then one responsive gallery of physical-size cards; cards stay paper-white in both themes */
:root { --bg: #eef0ea; --fg: #1b1f1a; --muted: #5d655c; --card: #ffffff; --line: #b9beb5; --rule: #a7ada3;
        --req: #1d3f73; --prop: #2e7d32; --strate: #5b3a1e; --badge: #f2f2f2; --ink: #111; --font: "Segoe UI", system-ui, Arial, sans-serif; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #171a16; --fg: #e6e8e2; --muted: #a3aa9f; --line: #4a5047; --rule: #5a605a; color-scheme: dark; } }
:root[data-theme="dark"] { --bg: #171a16; --fg: #e6e8e2; --muted: #a3aa9f; --line: #4a5047; --rule: #5a605a; color-scheme: dark; }
* { box-sizing: border-box; }
body { background: var(--bg); color: var(--fg); font-family: var(--font); margin: 0;
       padding-block: 20px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.wrap { max-width: 1100px; margin: 0 auto; }
h1 { font-size: 26px; margin: 0 0 8px; text-wrap: balance; } h2 { font-size: 17px; margin: 22px 0 8px; }
.rules { max-width: 70ch; font-size: 15px; line-height: 1.5; } .rules p { margin: 0 0 10px; } .small { color: var(--muted); font-size: 13px; }
.grid { display: flex; flex-wrap: wrap; gap: 12px; }
.card { width: 252px; height: 352px; max-width: 100%; border: 1px solid var(--line); border-radius: 6px; overflow: hidden; background: var(--card); color: var(--ink); }
.card.land { width: 352px; height: 252px; }
.in { width: 100%; height: 100%; display: flex; flex-direction: column; } .land .in { flex-direction: row; }
.half { flex: 1 1 0; padding: 7px 8px; display: flex; flex-direction: column; min-height: 0; min-width: 0; }
.half + .half { border-top: 1px dashed var(--rule); } .land .half + .half { border-top: 0; border-left: 1px dashed var(--rule); }
.full { padding: 9px 10px; display: flex; flex-direction: column; height: 100%; }
.head { display: flex; align-items: center; gap: 5px; }
.cost { width: 18px; height: 24px; border-radius: 3px; background: #222; color: #fff; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex: none; }
.name { font-weight: 700; font-size: 13px; line-height: 1.1; flex: 1; min-width: 0; } .full .name { font-size: 15px; }
.tree { font-size: 9px; color: #fff; padding: 2px 5px; border-radius: 4px; font-weight: 600; white-space: nowrap; flex: none; }
.badges { display: flex; flex-wrap: wrap; gap: 3px; margin: 4px 0; }
.badge { font-size: 8.5px; font-weight: 700; border: 1px solid #333; border-radius: 3px; padding: 1px 4px; background: var(--badge); color: #111; }
.badge.req { background: var(--req); color: #fff; border-color: var(--req); } .badge.prop { background: var(--prop); color: #fff; border-color: var(--prop); }
.badge.strate { background: var(--strate); color: #fff; border-color: var(--strate); }
.badge { display: inline-flex; align-items: center; gap: 3px; }
.ic { display: inline-block; width: 14px; height: 14px; flex: none; } .ic svg { width: 100%; height: 100%; display: block; }
.tsym { display: inline-flex; flex: none; vertical-align: middle; } .tsym svg { width: 20px; height: 20px; display: block; }
.badge.ico { padding: 0; border: 0; background: none; } .badge.ico .ic { width: 22px; height: 22px; }
.badges { gap: 4px; }
.txt { font-size: 11px; line-height: 1.25; flex: 0 0 auto; }
.pic { flex: 1 1 0; min-height: 40px; margin: 3px 0; border-radius: 4px; background: #e9ebe6 center / cover no-repeat; }
.credits { font-size: 12px; max-width: 70ch; } .credits li { margin: 0 0 4px; } .full .txt { font-size: 12px; }
.pts { font-size: 11.5px; font-weight: 700; line-height: 1.25; margin-top: 3px; } .full .pts { font-size: 13px; }
.foot { display: flex; justify-content: space-between; font-size: 8.5px; color: #666; margin-top: 3px; }
@media (max-width: 400px) { .card.land { height: auto; min-height: 252px; } }
"""


RULES = None


def esc(s):
    return html.escape(s, quote=False)


def badge(label, cls="", icon=None, text=False):
    if icon and not text:
        return f'<span class="badge ico" title="{esc(label)}">{ic(icon)}</span>'
    i = ic(icon) if icon else ""
    return f'<span class="badge {cls}">{i}{esc(label)}</span>'


def badges(sp, extra=()):
    out = [badge(t, icon=t) for t in sp["types"]]
    if sp["req"]:
        out.append(badge(sp["req"], "req", sp["req"]))
    out += [badge(p, "prop", p) for p in sp["props"]]
    out += list(extra)
    return f'<div class="badges">{"".join(out)}</div>' if out else ""


def body(sp):
    parts = []
    if sp["regle"]:
        parts.append(f'<div>{esc(sp["regle"])}</div>')
    if sp["effet"]:
        parts.append(f'<div><b>Effet :</b> {esc(sp["effet"])}</div>')
    if sp["bonus"]:
        parts.append(f'<div><b>Bonus :</b> {esc(sp["bonus"])}</div>')
    pts = f'<div class="pts">{esc(sp["points"])}</div>' if sp["points"] else ""
    return f'<div class="txt">{"".join(parts)}</div>{pts}'


def half_html(h, pos):
    sp = h["sp"]
    tree = tree_sym(h["tree"])
    return (f'<div class="half"><div class="head"><span class="cost">{sp["cost"]}</span>'
            f'<span class="name">{esc(sp["name"])}</span>{tree}</div>{badges(sp)}{pic(sp)}{body(sp)}'
            f'<div class="foot"><span>{pos}</span><span>×{sp["n"]}</span></div></div>')


def full_html(sp, cid, tsym=None):
    head_tree = ""
    if sp["slot"] == "arbre":
        sym = "Figuier" if sp["name"].startswith("Figuier") else {"Palmier wassaï": "Wassaï", "Palmier bâche": "Bâche"}.get(sp["name"], sp["name"])
        head_tree = tree_sym(sym)
    elif tsym:
        head_tree = tree_sym(tsym)
    strate = ""
    if sp["strate"] in ("E", "C", "S"):
        label = {"E": "ÉMERGENT · 2 empl. en haut", "C": "CANOPÉE", "S": "SOUS-BOIS"}[sp["strate"]]
        strate = badge(label, "strate", f"STRATE_{sp['strate']}")
    elif sp["strate"] == "hôte":
        strate = ""
    kind = {"arbre": "ARBRE", "eau": "PLAN D'EAU", "grotte": "GROTTE", "crue": "CRUE"}[sp["slot"]]
    cost = f'<span class="cost">{sp["cost"]}</span>' if sp["slot"] in ("arbre", "eau") else ""
    return (f'<div class="full"><div class="head">{cost}<span class="name">{esc(sp["name"])}</span>{head_tree}</div>'
            f'{badges(sp, [badge(kind, icon=kind), strate] if strate else [badge(kind, icon=kind)])}'
            f'{pic(sp)}{body(sp)}<div class="foot"><span>{cid}</span><span>×{sp["n"]}</span></div></div>')


def build():
    global RULES
    RULES = RULES_TPL.replace("{LEGEND}", LEGEND())
    rnd = random.Random(SEED)
    weights = [t[2] for t in TREES]
    names = [t[0] for t in TREES]

    def pick_tree():
        return rnd.choices(names, weights=weights)[0]

    halves = {"haut": [], "bas": [], "cote": []}
    fulls = []
    for sp in SPECIES:
        for i in range(sp["n"]):
            if sp["slot"] in halves:
                halves[sp["slot"]].append({"sp": sp, "tree": pick_tree()})
            else:
                fulls.append((sp, pick_tree() if sp["slot"] == "eau" else None))
    # Daguet: three different tree symbols, one per copy
    for h, t in zip([h for h in halves["cote"] if h["sp"]["name"] == "Daguet rouge"], ["Bois canon", "Wassaï", "Acajou"]):
        h["tree"] = t
    assert len(halves["haut"]) == 57 and len(halves["bas"]) == 57 and len(halves["cote"]) == 100, {k: len(v) for k, v in halves.items()}
    assert len(fulls) == 56 + 9 + 5 + 3, len(fulls)

    rnd.shuffle(halves["haut"]); rnd.shuffle(halves["bas"]); rnd.shuffle(halves["cote"])
    tb = list(zip(halves["haut"], halves["bas"]))
    lr = []
    pool = halves["cote"]
    while pool:
        a = pool.pop()
        j = next((k for k, b in enumerate(pool) if b["sp"]["name"] != a["sp"]["name"]), None)
        if j is None:  # only same-species left: swap one into an earlier pair
            b = pool.pop()
            prev_a, prev_b = lr.pop()
            lr.append((prev_a, b)); lr.append((prev_b, a)) if prev_b["sp"]["name"] != a["sp"]["name"] else lr.append((a, prev_b))
        else:
            lr.append((a, pool.pop(j)))
    assert len(tb) == 57 and len(lr) == 50

    def render():
        cards = []
        n = 0
        for sp, tsym in fulls:
            n += 1
            cid = f"V{n:03d}"
            land = sp["slot"] == "eau"
            cards.append(f'<div class="card{" land" if land else ""}"><div class="in">{full_html(sp, cid, tsym)}</div></div>')
        for a, b in tb:
            n += 1
            cid = f"V{n:03d}"
            cards.append(f'<div class="card"><div class="in">{half_html(a, cid)}{half_html(b, "")}</div></div>')
        for a, b in lr:
            n += 1
            cid = f"V{n:03d}"
            cards.append(f'<div class="card land"><div class="in">{half_html(a, cid)}{half_html(b, "")}</div></div>')
        assert len(cards) == 180, len(cards)
        return cards

    global MODE
    MODE = "print"
    cards = render()

    pages = ["".join(cards[i:i + 9]) for i in range(0, len(cards), 9)]
    doc = ('<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Várzea · cartes de test</title>'
           f'<style>{CSS}</style></head><body>{RULES}'
           + "".join(f'<div class="page">{p}</div>' for p in pages) + credits_html() + "</body></html>")
    OUT.write_text(doc, encoding="utf-8")
    MODE = "art"
    cards = render()
    print(f"{len(cards)} cartes, {len(pages)} pages -> {OUT}")

    rules = RULES.replace('<section class="rules">', '<section class="rules">').replace("<h1>", "<h1>").replace('page-break-after', '')
    groups = [("Arbres", cards[:56]), ("Plans d'eau", cards[56:65]), ("Grottes et crue", cards[65:73]),
              ("Cartes haut / bas", cards[73:130]), ("Cartes gauche / droite", cards[130:])]
    body_html = "".join(f"<h2>{g} ({len(cs)})</h2><div class=\"grid\">{''.join(cs)}</div>" for g, cs in groups)
    art = ('<title>Várzea prototype v0.1</title><meta name="claude:viewport-fit-sides" content="cover">'
           f'<style>{ART_CSS}\n{art_pic_css()}</style><div class="wrap">{rules}{body_html}{credits_html()}</div>')
    OUT_ART.write_text(art, encoding="utf-8")
    print(f"artifact -> {OUT_ART}")


if __name__ == "__main__":
    build()
