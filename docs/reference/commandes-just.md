# Commandes just

## Vue d'ensemble

Le projet utilise [just](https://just.systems/) pour orchestrer les tâches. Toutes les commandes s'exécutent depuis la racine du projet.

## Setup

| Commande       | Description                                       |
| -------------- | ------------------------------------------------- |
| `just install` | Installe les dépendances Python (geopandas via uv)|

## Données

| Commande                  | Description                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| `just convert`            | Exécute le pipeline complet (téléchargement, conversion, enrichissement, indexation) |
| `just convert-wfs`        | Télécharge et convertit les couches WFS depuis geo2france.fr     |
| `just convert-shapefiles` | Télécharge et convertit les shapefiles depuis data.gouv.fr       |
| `just download-epci`      | Télécharge les contours EPCI depuis geo.api.gouv.fr              |
| `just download-departements` | Télécharge les contours des départements depuis geo.api.gouv.fr |
| `just enrich`             | Enrichit et fusionne les fichiers GeoJSON                        |
| `just reverse-links`      | Construit l'index de liens croisés (reverse-links.json)          |
| `just clean`              | Supprime les fichiers GeoJSON générés                            |
| `just rebuild`            | Nettoie puis régénère toutes les données                         |

## Développement

| Commande     | Description                                           |
| ------------ | ----------------------------------------------------- |
| `just serve` | Démarre le serveur local sur http://localhost:8000     |
| `just dev`   | Régénère les données puis démarre le serveur           |

## Qualité

| Commande        | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `just check`    | Vérifie que les 17 fichiers GeoJSON sont présents dans site/data/ |
| `just validate` | Valide que les fichiers GeoJSON sont du JSON parseable            |
