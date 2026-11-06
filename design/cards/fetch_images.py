"""Fetches one image per species into img/: a Wikimedia Commons illustration (vintage plate,
drawing) when the search finds one, else the Wikipedia article photo. Writes img/credits.json
and img/contact-sheet.html for review.

Run: python design/cards/fetch_images.py        (skips species already in credits.json)
Override a pick: put the Commons file title in PICK below and delete the img/<slug>.* file.
"""
import html
import json
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

IMG = Path(__file__).with_name("img")
UA = {"User-Agent": "VarzeaPrototype/0.1 (private card game prototype)"}
WIDTH = 500  # one of the sizes Wikimedia serves (w.wiki/GHai)
KEYWORDS = ["illustration", "drawing", "plate"]
BAD = re.compile(r"map|range|distribution|skull|skelet|bone|egg|scat|track|footprint|diagram|logo|stamp|"
                 r"cladogram|fossil|nest|habitat|museum|zoo|\.svg|\.webm|\.ogv|\.pdf|\.djvu|\.gif|coin|banknote|flag",
                 re.I)

# French card name -> (search names old and new, English Wikipedia article for the photo fallback)
SPECIES = {
    "Fromager": (["Ceiba pentandra", "Eriodendron anfractuosum"], "Ceiba pentandra"),
    "Noyer du Brésil": (["Bertholletia excelsa"], "Bertholletia excelsa"),
    "Bois canon": (["Cecropia peltata", "Cecropia"], "Cecropia"),
    "Acajou": (["Swietenia mahagoni", "Swietenia macrophylla"], "Swietenia macrophylla"),
    "Ébène verte": (["Tabebuia serratifolia", "Handroanthus"], "Handroanthus serratifolius"),
    "Hévéa": (["Hevea brasiliensis"], "Hevea brasiliensis"),
    "Palmier wassaï": (["Euterpe oleracea", "Euterpe edulis"], "Euterpe oleracea"),
    "Palmier bâche": (["Mauritia flexuosa", "Mauritia vinifera"], "Mauritia flexuosa"),
    "Figuier étrangleur": (["strangler fig", "Ficus aurea"], "Strangler fig"),
    "Rivière": (["Amazon river engraving 19th century", "Rio Amazonas gravura", "Amazon river lithograph"], "Juruá River"),
    "Bras mort": (["oxbow lake engraving", "meander river engraving"], "Oxbow lake"),
    "Cascade": (["Kaieteur Falls"], "Kaieteur Falls"),
    "Arbre creux": (["hollow tree engraving", "Baumhöhle"], "Tree hollow"),
    "Terrier de berge": (["river bank burrow", "Uferhöhle"], "Burrow"),
    "Termitière": (["termite hill engraving", "termitarium", "Termitenbau"], "Mound-building termites"),
    "Contrefort": (["buttress roots engraving", "Brettwurzel"], "Buttress root"),
    "Inselberg": (["inselberg engraving", "Pão de Açúcar engraving"], "Inselberg"),
    "La crue monte": (["igapó engraving", "flooded forest Amazon engraving", "Amazon flood engraving"], "Igapó"),
    "Harpie féroce": (["Harpia harpyja", "Thrasaetus harpyia"], "Harpy eagle"),
    "Sarcoramphe roi": (["Sarcoramphus papa", "Gypagus papa"], "King vulture"),
    "Toucan toco": (["Ramphastos toco"], "Toco toucan"),
    "Ara rouge": (["Macrocercus aracanga", "Ara macao Lear", "Psittacus macao"], "Scarlet macaw"),
    "Ara bleu": (["Macrocercus ararauna", "Psittacus ararauna", "Ara ararauna"], "Blue-and-yellow macaw"),
    "Ara hyacinthe": (["Macrocercus hyacinthinus", "Anodorhynchus hyacinthinus Lear", "Anodorhynchus hyacinthinus"], "Hyacinth macaw"),
    "Hoazin huppé": (["Opisthocomus hoazin", "Opisthocomus cristatus"], "Hoatzin"),
    "Colibri topaze": (["Topaza pella"], "Crimson topaz"),
    "Coq-de-roche": (["Rupicola rupicola", "Rupicola crocea"], "Guianan cock-of-the-rock"),
    "Morpho bleu": (["Morpho menelaus"], "Morpho menelaus"),
    "Héliconius": (["Heliconius melpomene"], "Heliconius melpomene"),
    "Caligo": (["Caligo eurilochus", "Caligo"], "Caligo eurilochus"),
    "Greta oto": (["Greta oto", "Ithomiidae"], "Greta oto"),
    "Paresseux à trois doigts": (["Bradypus tridactylus", "Bradypus"], "Pale-throated sloth"),
    "Broméliacée": (["Guzmania", "Bromeliaceae"], "Guzmania"),
    "Orchidée": (["Cattleya violacea", "Cattleya"], "Cattleya violacea"),
    "Philodendron": (["Philodendron imbe", "Philodendron bipinnatifidum", "Philodendron Flora Brasiliensis"], "Philodendron"),
    "Guêpe du figuier": (["Blastophaga psenes", "fig wasp"], "Fig wasp"),
    "Abeille euglossine": (["Euglossa cordata", "Euglossa dilemma", "Exaerete"], "Euglossini"),
    "Dendrobate": (["Dendrobates tinctorius Sclater", "Hylaplesia tinctoria", "Dendrobates tinctorius"], "Dyeing poison dart frog"),
    "Phyllomédusa": (["Phyllomedusa bicolor", "Phyllomedusa"], "Phyllomedusa bicolor"),
    "Crapaud buffle": (["Bufo marinus", "Rhinella marina"], "Cane toad"),
    "Caïman à lunettes": (["Caiman crocodilus", "Caiman sclerops"], "Spectacled caiman"),
    "Anaconda vert": (["Eunectes murinus"], "Green anaconda"),
    "Arapaïma": (["Arapaima gigas", "Sudis gigas"], "Arapaima gigas"),
    "Piranha rouge": (["Pygocentrus nattereri", "Serrasalmus"], "Red-bellied piranha"),
    "Anguille électrique": (["Gymnotus electricus Bloch", "Gymnotus electricus", "Electrophorus electricus"], "Electric eel"),
    "Tambaqui": (["Colossoma macropomum", "Myletes"], "Tambaqui"),
    "Dauphin rose": (["Inia geoffrensis"], "Amazon river dolphin"),
    "Fourmi coupe-feuille": (["Atta cephalotes", "Atta"], "Atta cephalotes"),
    "Fourmi azteca": (["Azteca muelleri", "Azteca ants Cecropia", "Cecropia ants"], "Azteca (ant)"),
    "Dynaste Hercule": (["Dynastes hercules"], "Hercules beetle"),
    "Fourmis légionnaires": (["Eciton burchellii", "Eciton"], "Eciton burchellii"),
    "Champignon luminescent": (["Mycena chlorophos", "Mycena"], "Mycena chlorophos"),
    "Cordyceps": (["Ophiocordyceps unilateralis", "Cordyceps"], "Ophiocordyceps unilateralis"),
    "Termitomyces": (["Termitomyces"], "Termitomyces"),
    "Balisier": (["Heliconia"], "Heliconia"),
    "Passiflore": (["Passiflora quadrangularis", "Passiflora caerulea Curtis", "Passiflora laurifolia"], "Passiflora"),
    "Victoria amazonica": (["Victoria regia", "Victoria amazonica"], "Victoria amazonica"),
    "Tatou géant": (["Priodontes giganteus", "Dasypus gigas", "giant armadillo engraving"], "Giant armadillo"),
    "Paca": (["Cuniculus paca", "Coelogenys paca"], "Lowland paca"),
    "Jaguar": (["Felis onca", "Panthera onca"], "Jaguar"),
    "Puma": (["Felis concolor", "Puma concolor"], "Cougar"),
    "Ocelot": (["Felis pardalis", "Leopardus pardalis"], "Ocelot"),
    "Loutre géante": (["Pteronura brasiliensis"], "Giant otter"),
    "Tapir du Brésil": (["Tapirus americanus", "Tapirus terrestris"], "South American tapir"),
    "Pécari à collier": (["Dicotyles torquatus", "Pecari tajacu"], "Collared peccary"),
    "Daguet rouge": (["Mazama americana", "Cervus rufus"], "Red brocket"),
    "Capybara": (["Hydrochoerus hydrochaeris", "Hydrochoerus capybara"], "Capybara"),
    "Agouti doré": (["Dasyprocta aguti", "Dasyprocta leporina"], "Red-rumped agouti"),
    "Hurleur roux": (["Alouatta seniculus", "Mycetes seniculus"], "Venezuelan red howler"),
    "Atèle noir": (["Ateles paniscus"], "Red-faced spider monkey"),
    "Capucin": (["Cebus apella", "Sapajus apella"], "Tufted capuchin"),
    "Saïmiri": (["Saimiri sciureus", "Chrysothrix sciurea"], "Common squirrel monkey"),
    "Singe laineux": (["Lagothrix lagothricha", "Lagothrix"], "Brown woolly monkey"),
    "Tamanoir": (["Myrmecophaga jubata", "Myrmecophaga tridactyla"], "Giant anteater"),
    "Kinkajou": (["Potos flavus", "Cercoleptes caudivolvulus"], "Kinkajou"),
    "Coati roux": (["Nasua nasua", "Nasua rufa"], "South American coati"),
    "Tamandua": (["Tamandua tetradactyla", "Myrmecophaga tetradactyla"], "Southern tamandua"),
    "Iguane vert": (["Iguana iguana", "Iguana tuberculata"], "Green iguana"),
    "Boa constricteur": (["Boa constrictor"], "Boa constrictor"),
    "Mygale de Leblond": (["Theraphosa blondi", "Theraphosa leblondi"], "Goliath birdeater"),
    "Cigale": (["Fidicina mannifera", "Cicada engraving", "Cicadidae plate"], "Cicada"),
    "Termites": (["Nasutitermes", "termites"], "Nasutitermes"),
    "Margay": (["Felis wiedii", "Leopardus wiedii"], "Margay"),
    "Liane": (["Bauhinia guianensis", "lianas Amazon engraving", "liana"], "Liana"),
    "Coendou": (["Coendou prehensilis", "Cercolabes prehensilis"], "Brazilian porcupine"),
    "Opossum commun": (["Didelphis marsupialis", "Didelphis"], "Common opossum"),
    "Tayra": (["Galictis barbara", "Eira barbara"], "Tayra"),
    "Vanillier": (["Vanilla planifolia"], "Vanilla planifolia"),
    "Jaguarundi": (["Felis yagouaroundi", "Herpailurus yagouaroundi"], "Jaguarundi"),
}

# Manual picks: French name -> Commons file title (without "File:"); wins over the search
PICK = {"Bras mort": "PHOTO", "Terrier de berge": "PHOTO", "Inselberg": "PHOTO", "Contrefort": "PHOTO", "Tatou géant": "PHOTO", "Anguille électrique": "PHOTO", "Cordyceps": "PHOTO"}  # "PHOTO" forces the article photo


def slug(name):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def get_bytes(url):
    req = urllib.request.Request(url, headers=UA)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 3:
                raise
            time.sleep(15 * (attempt + 1))
    raise RuntimeError("unreachable")


def get_json(url):
    return json.loads(get_bytes(url))


def api(host, **params):
    params.setdefault("format", "json")
    return get_json(f"https://{host}/w/api.php?" + urllib.parse.urlencode(params))


def strip_tags(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def file_info(title):
    """Thumb URL + credits for a Commons (or enwiki) file title."""
    for host in ("commons.wikimedia.org", "en.wikipedia.org"):
        pages = api(host, action="query", titles=title, prop="imageinfo", iiprop="url|extmetadata|mime",
                    iiurlwidth=WIDTH).get("query", {}).get("pages", {})
        for page in pages.values():
            info = page.get("imageinfo")
            if info:
                meta = info[0].get("extmetadata", {})
                return {"thumb": info[0].get("thumburl"), "mime": info[0].get("mime", ""), "file": title,
                        "author": strip_tags(meta.get("Artist", {}).get("value"))[:80],
                        "license": meta.get("LicenseShortName", {}).get("value", ""),
                        "url": f"https://commons.wikimedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'))}"}
    return None


def search_illustration(names):
    for name in names:
        for kw in KEYWORDS:
            q = f'"{name}" {kw} -map -skull -skeleton -egg -stamp'
            hits = api("commons.wikimedia.org", action="query", list="search", srsearch=q, srnamespace=6,
                       srlimit=8).get("query", {}).get("search", [])
            for h in hits:
                t = h["title"]
                if not BAD.search(t) and re.search(r"\.(jpe?g|png|tiff?)$", t, re.I):
                    return t, q
            time.sleep(1.5)
    return None, None


def photo_fallback(article):
    s = get_json("https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(article.replace(" ", "_")))
    orig = s.get("originalimage", {}).get("source")
    if not orig:
        return None
    return "File:" + re.sub(r"^\d+px-", "", urllib.parse.unquote(orig.rsplit("/", 1)[-1].split("?")[0]))


def main():
    IMG.mkdir(exist_ok=True)
    cred_path = IMG / "credits.json"
    credits = json.loads(cred_path.read_text(encoding="utf-8")) if cred_path.exists() else {}
    redo = set(sys.argv[1:])
    for name, (names, article) in SPECIES.items():
        key = slug(name)
        if key in redo:
            credits.pop(key, None)
        if key in credits and any(IMG.glob(f"{key}.*")):
            continue
        try:
            if PICK.get(name) == "PHOTO":
                title, kind, q = photo_fallback(article), "photo", ""
            elif name in PICK:
                title, kind, q = "File:" + PICK[name], "pick", ""
            else:
                title, q = search_illustration(names)
                kind = "illustration"
                if not title:
                    title, kind = photo_fallback(article), "photo"
            if not title:
                print("MISSING", name); continue
            info = file_info(title)
            if not info or not info["thumb"]:
                print("MISSING", name, title); continue
            data = get_bytes(info["thumb"])
            ext = ".png" if "png" in info["mime"] or info["thumb"].lower().endswith(".png") else ".jpg"
            for old in IMG.glob(f"{key}.*"):
                old.unlink()
            (IMG / f"{key}{ext}").write_bytes(data)
            credits[key] = {**info, "name": name, "kind": kind, "query": q, "ext": ext}
            credits[key].pop("thumb", None); credits[key].pop("mime", None)
            print(f"{kind:12s} {name:26s} {len(data) // 1024:3d} KB  {info['license']:14s} {title[:60]}")
            cred_path.write_text(json.dumps(credits, ensure_ascii=False, indent=1), encoding="utf-8")
        except Exception as e:  # noqa: BLE001
            print("ERROR", name, str(e)[:100])
        time.sleep(2.0)
    write_contact_sheet(credits)
    kinds = [c["kind"] for c in credits.values()]
    print(f"{len(credits)} images: {kinds.count('illustration')} illustrations, {kinds.count('photo')} photos, "
          f"{kinds.count('pick')} picks; {len(SPECIES) - len(credits)} missing")


def write_contact_sheet(credits):
    cells = []
    for key, c in credits.items():
        cells.append(f'<div class="c"><img src="{key}{c["ext"]}" alt=""><b>{html.escape(c["name"])}</b>'
                     f'<small>{c["kind"]} · {html.escape(c["license"])}<br>{html.escape(c["file"][5:])}</small></div>')
    doc = ('<!doctype html><meta charset="utf-8"><title>Várzea images</title><style>body{font-family:sans-serif;margin:16px}'
           '.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}'
           '.c{border:1px solid #ccc;padding:6px;font-size:12px}.c img{width:100%;height:150px;object-fit:cover;display:block}'
           'small{color:#666;word-break:break-all}</style><div class="g">' + "".join(cells) + "</div>")
    (IMG / "contact-sheet.html").write_text(doc, encoding="utf-8")


if __name__ == "__main__":
    main()
