# Bassin Minier du Nord-Pas de Calais - Patrimoine mondial UNESCO

Site web statique avec carte interactive presentant les donnees patrimoniales du Bassin minier du Nord-Pas de Calais, inscrit au patrimoine mondial de l'UNESCO en 2012.

## Donnees

### [data.gouv.fr](https://www.data.gouv.fr/) — Shapefiles

Source : [Perimetre bien inscrit et zone tampon du Bassin Minier - Patrimoine mondial UNESCO](https://www.data.gouv.fr/datasets/perimetre-bien-inscrit-et-zone-tampon-du-bassin-minier-patrimoine-mondial-unesco)

- **Bien inscrit UNESCO** : perimetre de l'inscription
- **Zone tampon** : zone de protection autour du bien
- **Batis** : batiments issus de l'histoire miniere (fosses, chevalements, equipements, monuments)
- **Cavaliers** : anciennes voies ferrees de transport du charbon
- **Cites minieres** : cites ouvrieres (corons, cites pavillonnaires, cites-jardins, cites modernes)
- **Espaces neo-naturels** : etendues d'eau formees par affaissements miniers
- **Terrils** : depots de schistes issus de l'exploitation

Source : [Anciens puits de mines dans le Bassin minier du Nord-Pas-de-Calais](https://www.data.gouv.fr/datasets/anciens-puits-de-mines-dans-le-bassin-minier-du-nord-pas-de-calais)

- **Puits de mines** : anciens puits de mines (636 localisations)

Source : [Bassin minier au sens de la Mission Bassin Minier](https://www.data.gouv.fr/datasets/bassin-minier-au-sens-de-la-mission-bassin-minier)

- **Bassin minier** : contours du bassin minier selon la Mission Bassin Minier
- **Communes MBM** : communes du perimetre de la Mission Bassin Minier
- **ZT Cavaliers** : cavaliers en zone tampon
- **ZT Cites minieres** : cites minieres en zone tampon
- **ZT Espaces neo-naturels** : espaces neo-naturels en zone tampon
- **ZT Terrils** : terrils en zone tampon
- **ZT Parvis agricoles** : parvis agricoles en zone tampon

### [geo.api.gouv.fr](https://geo.api.gouv.fr/) — API

- **EPCI** : intercommunalites (Etablissements Publics de Cooperation Intercommunale) couvrant les communes du bassin minier, pour les departements 59 (Nord) et 62 (Pas-de-Calais)
- **Departements** : contours des departements 59 (Nord) et 62 (Pas-de-Calais), obtenus par dissolution des contours communaux via l'API

### Enrichissements

Les donnees WFS sont fusionnees dans les shapefiles pour consolider les jeux de donnees :

- **Batis** : enrichi avec les equipements collectifs et les equipements d'extraction (nom, compagnie, periode, proprietaire, protection)
- **Cites minieres** : enrichi avec les cites ERBM (id_lsm, nom_2, proprietaire, commune_3)
- **Communes MBM** : enrichi avec le code SIREN et le nom de l'EPCI de rattachement (via geo.api.gouv.fr)

Ce traitement est realise par le script `scripts/enrich_geojson.py` et reduit le nombre de fichiers de 18 a 16.

## Prerequis

- [mise](https://mise.jdx.dev/) (installe automatiquement Python et just via `mise install`)
- Un navigateur web moderne (pour consulter la carte)

## Installation

```bash
mise install
just install
```

## Generation des donnees

Telecharge les sources (shapefiles data.gouv.fr, couches WFS geo2france.fr, EPCI et departements geo.api.gouv.fr), les convertit en GeoJSON, puis fusionne les jeux de donnees qui se recoupent :

```bash
just convert
```

Pour reconstruire depuis zero :

```bash
just rebuild
```

Pour verifier que les fichiers generes sont presents et valides :

```bash
just check
just validate
```

## Developpement local

```bash
just serve
```

Ouvrir <http://localhost:8000> dans un navigateur.

## Deploiement

Le site est deployable via GitHub Pages depuis le dossier `site/`.

## Technologies

- [Leaflet](https://leafletjs.com/) v1.9.4 (CDN) pour la carte interactive
- [OpenStreetMap](https://www.openstreetmap.org/) pour le fond de carte
- HTML/CSS/JS vanilla (aucun build tool)
- [mise](https://mise.jdx.dev/) pour la gestion des outils (Python, just)
- [just](https://just.systems/) pour l'orchestration des taches
- [GeoPandas](https://geopandas.org/) pour la conversion des shapefiles

## Licence

Les donnees sont mises a disposition sous [Licence Ouverte ETALAB v2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/).
