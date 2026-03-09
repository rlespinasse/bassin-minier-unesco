# Bassin Minier du Nord-Pas de Calais - Patrimoine mondial UNESCO

Site web statique avec carte interactive presentant les donnees patrimoniales du Bassin minier du Nord-Pas de Calais, inscrit au patrimoine mondial de l'UNESCO en 2012.

## Donnees

Sources ([data.gouv.fr](https://www.data.gouv.fr/)) :

- [Perimetre bien inscrit et zone tampon du Bassin Minier - Patrimoine mondial UNESCO](https://www.data.gouv.fr/datasets/perimetre-bien-inscrit-et-zone-tampon-du-bassin-minier-patrimoine-mondial-unesco)
- [Anciens puits de mines dans le Bassin minier du Nord-Pas-de-Calais](https://www.data.gouv.fr/datasets/anciens-puits-de-mines-dans-le-bassin-minier-du-nord-pas-de-calais)
- [Bassin minier au sens de la Mission Bassin Minier](https://www.data.gouv.fr/datasets/bassin-minier-au-sens-de-la-mission-bassin-minier)

9 jeux de donnees fournis par la [Mission Bassin Minier](https://www.missionbassinminier.org) :

- **Bassin minier (ERBM)** : contours du bassin minier selon l'Etablissement public de Reconnaissance du Bassin Minier
- **Bien inscrit UNESCO** : perimetre de l'inscription
- **Zone tampon** : zone de protection autour du bien
- **Cites minieres** : cites ouvrieres (corons, cites pavillonnaires, cites-jardins, cites modernes)
- **Batis** : batiments issus de l'histoire miniere (fosses, chevalements, equipements, monuments)
- **Cavaliers** : anciennes voies ferrees de transport du charbon
- **Espaces neo-naturels** : etendues d'eau formees par affaissements miniers
- **Terrils** : depots de schistes issus de l'exploitation
- **Puits de mines** : anciens puits de mines (636 localisations)

## Prerequis

- Python 3.8+ avec [GeoPandas](https://geopandas.org/) (`pip install geopandas`)
- Un navigateur web moderne

## Conversion des donnees

Le script telecharge automatiquement les donnees depuis [data.gouv.fr](https://www.data.gouv.fr/), les convertit et genere les fichiers GeoJSON dans `site/data/`.

```bash
pip install geopandas
python scripts/convert_shapefiles.py
```

## Developpement local

```bash
cd site
python -m http.server 8000
```

Ouvrir http://localhost:8000 dans un navigateur.

## Deploiement

Le site est deployable via GitHub Pages depuis le dossier `site/`.

## Technologies

- [Leaflet](https://leafletjs.com/) v1.9.4 (CDN) pour la carte interactive
- [OpenStreetMap](https://www.openstreetmap.org/) pour le fond de carte
- HTML/CSS/JS vanilla (aucun build tool)
- [GeoPandas](https://geopandas.org/) pour la conversion des shapefiles

## Licence

Les donnees sont mises a disposition sous [Licence Ouverte ETALAB v2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/).
