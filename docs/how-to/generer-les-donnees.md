# Comment générer les données

Ce guide explique comment télécharger les sources de données et les convertir en GeoJSON pour alimenter la carte.

## Prérequis

- [Projet installé](installation.md)

## Générer toutes les données

```bash
just convert
```

Cette commande exécute l'ensemble du pipeline de données :

1. Téléchargement des couches WFS depuis geo2france.fr
2. Téléchargement et conversion des shapefiles depuis data.gouv.fr
3. Téléchargement des EPCI depuis geo.api.gouv.fr
4. Téléchargement des départements depuis geo.api.gouv.fr
5. Enrichissement et fusion des jeux de données
6. Construction de l'index de liens croisés

Les fichiers GeoJSON sont générés dans `site/data/`.

## Reconstruire depuis zéro

Pour supprimer les fichiers existants et tout régénérer :

```bash
just rebuild
```

## Vérifier les fichiers générés

Pour vérifier que tous les fichiers sont présents :

```bash
just check
```

Pour valider que les fichiers GeoJSON sont du JSON valide et afficher le nombre d'entités par couche :

```bash
just validate
```

## Dépannage

### Les fichiers ne sont pas générés

Vérifiez que les dépendances Python sont installées (`just install`) et que vous avez un accès réseau aux APIs externes (data.gouv.fr, geo2france.fr, geo.api.gouv.fr).

### Fichier GeoJSON invalide

Lancez `just validate` pour identifier le fichier en erreur, puis régénérez les données avec `just rebuild`.
