# Couches cartographiques

## Vue d'ensemble

La carte affiche 15 couches vectorielles GeoJSON réparties en 3 groupes, plus une couche de limite (bassin minier) utilisée pour le cadrage.

## UNESCO Patrimoine

| Couche              | Fichier                    | Description                                              |
| ------------------- | -------------------------- | -------------------------------------------------------- |
| Bien inscrit        | `bien-inscrit.geojson`     | Périmètre du bien classé au patrimoine mondial           |
| Zone tampon         | `zone-tampon.geojson`      | Zone de protection réglementaire autour du bien          |
| Bâtis               | `batis.geojson`            | Bâtiments miniers (fosses, chevalements, équipements)    |
| Cités minières      | `cites-minieres.geojson`   | Cités ouvrières (corons, cités-jardins, cités modernes)  |
| Cavaliers           | `cavaliers.geojson`        | Anciennes voies ferrées de transport du charbon          |
| Espaces néo-naturels| `espace-neonaturel.geojson`| Étendues d'eau formées par affaissements miniers         |
| Terrils             | `terrils.geojson`          | Dépôts de schistes issus de l'exploitation               |

## Environnement

| Couche          | Fichier                  | Description                                                    |
| --------------- | ------------------------ | -------------------------------------------------------------- |
| Communes MBM    | `communes-mbm.geojson`   | Communes du périmètre de la Mission Bassin Minier              |
| EPCI            | `epci.geojson`           | Intercommunalités couvrant les communes du bassin              |
| Départements    | `departements.geojson`   | Nord (59) et Pas-de-Calais (62)                                |
| Puits de mines  | `puits-de-mines.geojson` | 636 localisations d'anciens puits de mines                     |

## Zone tampon

| Couche                   | Fichier                         | Description                                        |
| ------------------------ | ------------------------------- | -------------------------------------------------- |
| ZT Cavaliers             | `zt-cavaliers.geojson`          | Cavaliers en zone tampon                           |
| ZT Cités minières        | `zt-cites-minieres.geojson`     | Cités minières en zone tampon                      |
| ZT Espaces néo-naturels  | `zt-espaces-neonaturels.geojson`| Espaces néo-naturels en zone tampon                |
| ZT Terrils               | `zt-terrils.geojson`            | Terrils en zone tampon                             |
| ZT Parvis agricoles      | `zt-parvis-agricoles.geojson`   | Parvis agricoles en zone tampon                    |

## Index de liens croisés

| Fichier               | Description                                                          |
| --------------------- | -------------------------------------------------------------------- |
| `reverse-links.json`  | Index bidirectionnel pour la navigation entre entités liées          |

Cet index contient 5 tables de correspondance :

- **communes** : commune → couches → entités
- **elements** : identifiant d'élément → couches → entités
- **terrils** : identifiant de terril → terrils visibles depuis ce terril
- **epcis** : EPCI → communes membres
- **departements** : département → communes et EPCI
