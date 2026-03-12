# Structure des fichiers GeoJSON

## Vue d'ensemble

Le pipeline génère 17 fichiers GeoJSON et 1 fichier d'index JSON dans `site/data/`. Tous les fichiers GeoJSON suivent le standard [RFC 7946](https://datatracker.ietf.org/doc/html/rfc7946) en projection WGS84 (EPSG:4326).

Conventions communes :

- Propriétés en `snake_case`
- Coordonnées arrondies à 6 décimales
- Chaînes vides remplacées par `null`
- Communes numérotées : `commune_1`, `commune_2`, etc.

## UNESCO Patrimoine

### bien-inscrit.geojson

Périmètre du bien classé au patrimoine mondial. Géométrie : Polygon.

| Propriété    | Type   | Description                              |
| ------------ | ------ | ---------------------------------------- |
| `no_section` | string | Numéro de section                        |
| `section`    | string | Nom de la section                        |
| `no_element` | string | Numéro de l'élément dans la section      |
| `nom`        | string | Nom de l'élément                         |
| `surface_ha` | number | Surface en hectares                      |

### zone-tampon.geojson

Zone de protection réglementaire autour du bien. Géométrie : Polygon.

| Propriété    | Type   | Description                    |
| ------------ | ------ | ------------------------------ |
| `id`         | string | Identifiant                    |
| `surface_ha` | number | Surface en hectares            |

### batis.geojson

Bâtiments liés à l'histoire minière (fosses, chevalements, équipements, monuments). Géométrie : Polygon. Enrichi avec les données WFS d'équipements.

| Propriété      | Type   | Description                                    | Source      |
| -------------- | ------ | ---------------------------------------------- | ----------- |
| `commune_1`    | string | Commune principale                             | Shapefile   |
| `commune_2`    | string | Commune secondaire                             | Shapefile   |
| `typologie`    | string | Type de bâtiment                               | Shapefile   |
| `inscrit_mh`   | string | Inscription aux Monuments Historiques          | Shapefile   |
| `classe_mh`    | string | Classement aux Monuments Historiques           | Shapefile   |
| `id_unesco`    | string | Identifiant UNESCO (ex: `37B`)                 | Shapefile   |
| `element`      | string | Code d'élément UNESCO (partie numérique)       | Shapefile   |
| `objet`        | string | Code d'objet UNESCO (suffixe lettre)           | Shapefile   |
| `denomination` | string | Dénomination du bâtiment                       | Shapefile   |
| `nom`          | string | Nom de l'équipement                            | WFS enrichi |
| `compagnie`    | string | Compagnie minière exploitante                  | WFS enrichi |
| `periode`      | string | Période (ex: `Avant 1800`, `1914-1945`)        | WFS enrichi |
| `proprietaire` | string | Propriétaire actuel                            | WFS enrichi |
| `protection`   | string | Statut de protection                           | WFS enrichi |

### cavaliers.geojson

Anciennes voies ferrées de transport du charbon. Géométrie : LineString.

| Propriété    | Type   | Description                            |
| ------------ | ------ | -------------------------------------- |
| `id_unesco`  | string | Identifiant UNESCO                     |
| `element`    | string | Code d'élément UNESCO                  |
| `objet`      | string | Code d'objet UNESCO                    |
| `commune_1`  | string | Commune traversée (jusqu'à 6)         |
| ...          |        |                                        |
| `commune_6`  | string | Commune traversée                      |
| `longueur_m` | number | Longueur en mètres                     |

### cites-minieres.geojson

Cités ouvrières (corons, cités pavillonnaires, cités-jardins, cités modernes). Géométrie : Polygon. Enrichi avec les données WFS ERBM.

| Propriété      | Type   | Description                              | Source      |
| -------------- | ------ | ---------------------------------------- | ----------- |
| `nom`          | string | Nom de la cité                           | Shapefile   |
| `commune_1`    | string | Commune principale                       | Shapefile   |
| `commune_2`    | string | Commune secondaire                       | Shapefile   |
| `type`         | string | Type de cité                             | Shapefile   |
| `compagnie`    | string | Compagnie minière                        | Shapefile   |
| `interet`      | string | Niveau d'intérêt (ex: `Exceptionnelle`)  | Shapefile   |
| `inscrit_mh`   | string | Inscription aux Monuments Historiques    | Shapefile   |
| `classe_mh`    | string | Classement aux Monuments Historiques     | Shapefile   |
| `id_unesco`    | string | Identifiant UNESCO                       | Shapefile   |
| `element`      | string | Code d'élément UNESCO                    | Shapefile   |
| `objet`        | string | Code d'objet UNESCO                      | Shapefile   |
| `id_lsm`       | string | Identifiant LSM (Liste Secteur Minier)   | WFS enrichi |
| `nom_2`        | string | Nom secondaire                           | WFS enrichi |
| `proprietaire` | string | Propriétaire actuel                      | WFS enrichi |
| `commune_3`    | string | Commune tertiaire                        | WFS enrichi |

### espace-neonaturel.geojson

Étendues d'eau formées par les affaissements miniers. Géométrie : Polygon.

| Propriété   | Type   | Description              |
| ----------- | ------ | ------------------------ |
| `nom`       | string | Nom de l'espace          |
| `commune_1` | string | Commune principale       |
| `commune_2` | string | Commune secondaire       |
| `id_unesco`  | string | Identifiant UNESCO       |
| `element`   | string | Code d'élément UNESCO    |
| `objet`     | string | Code d'objet UNESCO      |

### terrils.geojson

Dépôts de schistes issus de l'exploitation minière. Géométrie : Polygon.

| Propriété    | Type   | Description                        |
| ------------ | ------ | ---------------------------------- |
| `no_terril`  | string | Numéro de terril                   |
| `nom`        | string | Nom du terril                      |
| `commune_1`  | string | Commune (jusqu'à 3)               |
| `commune_2`  | string | Commune secondaire                 |
| `commune_3`  | string | Commune tertiaire                  |
| `compagnie`  | string | Compagnie minière                  |
| `groupe`     | string | Groupe de terrils                  |
| `forme`      | string | Forme du terril                    |
| `id_unesco`  | string | Identifiant UNESCO                 |
| `element`    | string | Code d'élément UNESCO              |
| `objet`      | string | Code d'objet UNESCO                |

## Environnement

### communes-mbm.geojson

Communes du périmètre de la Mission Bassin Minier. Géométrie : Polygon. Enrichi avec les données EPCI via API.

| Propriété     | Type   | Description                                | Source      |
| ------------- | ------ | ------------------------------------------ | ----------- |
| `insee`       | string | Code INSEE de la commune (ex: `59017`)     | WFS         |
| `nom`         | string | Nom de la commune                          | WFS         |
| `statut`      | string | Statut administratif                       | WFS         |
| `population`  | number | Population                                 | WFS         |
| `surface_km2` | number | Surface en km²                             | WFS         |
| `epci_siren`  | string | Code SIREN de l'EPCI de rattachement       | API enrichi |
| `epci_nom`    | string | Nom de l'EPCI de rattachement              | API enrichi |

### epci.geojson

Intercommunalités couvrant les communes du bassin minier. Géométrie : Polygon.

| Propriété     | Type   | Description               |
| ------------- | ------ | ------------------------- |
| `code_siren`  | string | Code SIREN de l'EPCI      |
| `nom`         | string | Nom de l'EPCI             |

### departements.geojson

Départements du Nord (59) et du Pas-de-Calais (62). Géométrie : Polygon. Construit par dissolution des contours communaux.

| Propriété | Type   | Description              |
| --------- | ------ | ------------------------ |
| `code`    | string | Code du département      |
| `nom`     | string | Nom du département       |

### puits-de-mines.geojson

Localisations d'anciens puits de mines. Géométrie : Point.

| Propriété     | Type   | Description                          |
| ------------- | ------ | ------------------------------------ |
| `commune`     | string | Commune                              |
| `compagnie`   | string | Compagnie minière                    |
| `concession`  | string | Concession minière                   |
| `fosse`       | string | Nom de la fosse                      |
| `fosse_alias` | string | Nom alternatif de la fosse           |
| `puits`       | string | Numéro du puits                      |
| `cote`        | string | Cote altimétrique                    |
| `creusement`  | string | Date de début de creusement          |
| `fermeture`   | string | Date de fermeture                    |
| `profondeur`  | string | Profondeur du puits                  |
| `brgm`        | string | URL de la fiche BRGM                 |

## Zone tampon

### zt-cavaliers.geojson

Cavaliers en zone tampon. Géométrie : LineString.

| Propriété     | Type   | Description                    |
| ------------- | ------ | ------------------------------ |
| `id_troncon`  | string | Identifiant du tronçon         |
| `nom`         | string | Nom du cavalier                |
| `commune_1`   | string | Commune (jusqu'à 4)           |
| `commune_2`   | string | Commune secondaire             |
| `commune_3`   | string | Commune tertiaire              |
| `commune_4`   | string | Commune quaternaire            |

### zt-cites-minieres.geojson

Cités minières en zone tampon. Géométrie : Polygon.

| Propriété      | Type   | Description                         |
| -------------- | ------ | ----------------------------------- |
| `id_lsm`       | string | Identifiant LSM                     |
| `nom`          | string | Nom de la cité                      |
| `nom_2`        | string | Nom secondaire                      |
| `commune_1`    | string | Commune (jusqu'à 3)               |
| `commune_2`    | string | Commune secondaire                  |
| `commune_3`    | string | Commune tertiaire                   |
| `type`         | string | Type de cité                        |
| `compagnie`    | string | Compagnie minière                   |
| `interet`      | string | Niveau d'intérêt                    |
| `proprietaire` | string | Propriétaire actuel                 |

### zt-espaces-neonaturels.geojson

Espaces néo-naturels en zone tampon. Géométrie : Polygon.

| Propriété   | Type   | Description              |
| ----------- | ------ | ------------------------ |
| `id`        | string | Identifiant              |
| `nom`       | string | Nom de l'espace          |
| `commune_1` | string | Commune (jusqu'à 3)     |
| `commune_2` | string | Commune secondaire       |
| `commune_3` | string | Commune tertiaire        |

### zt-terrils.geojson

Terrils en zone tampon. Géométrie : Polygon.

| Propriété    | Type   | Description              |
| ------------ | ------ | ------------------------ |
| `id`         | string | Identifiant              |
| `nom`        | string | Nom du terril            |
| `nom_usuel`  | string | Nom usuel / courant      |
| `commune_1`  | string | Commune (jusqu'à 3)     |
| `commune_2`  | string | Commune secondaire       |
| `commune_3`  | string | Commune tertiaire        |
| `forme`      | string | Forme du terril          |

### zt-parvis-agricoles.geojson

Parvis agricoles en zone tampon (zones offrant une vue sur les terrils). Géométrie : Polygon.

| Propriété     | Type   | Description                                          |
| ------------- | ------ | ---------------------------------------------------- |
| `id`          | string | Identifiant                                          |
| `qualite_vue` | string | Qualité de la vue                                    |
| `vue_sur`     | string | Identifiants des terrils visibles (séparés par `,`)  |

## Index de liens croisés

### reverse-links.json

Index bidirectionnel pour la navigation entre entités liées. Ce n'est pas un fichier GeoJSON mais un fichier JSON structuré.

```json
{
  "communes": {
    "<nom_normalisé>": {
      "<layer_id>": [{ "index": 0, "label": "..." }]
    }
  },
  "elements": { ... },
  "terrils": { ... },
  "epcis": { ... },
  "departements": { ... }
}
```

| Clé             | Indexé par                    | Contenu                                     |
| --------------- | ----------------------------- | ------------------------------------------- |
| `communes`      | Nom de commune normalisé      | Entités situées dans cette commune           |
| `elements`      | Code d'élément UNESCO         | Entités portant ce code d'élément            |
| `terrils`       | Identifiant de terril         | Parvis et terrils avec vue sur ce terril     |
| `epcis`         | Nom d'EPCI normalisé          | Communes membres de cet EPCI                |
| `departements`  | Nom de département normalisé  | Communes et EPCI du département              |

La normalisation consiste en : décomposition NFD Unicode → suppression des accents → passage en minuscules. Exemple : `Béthune` → `bethune`.

Chaque entrée stocke l'`index` de l'entité dans le tableau `features` de son fichier GeoJSON et un `label` lisible, permettant un accès direct sans parcourir le fichier.
