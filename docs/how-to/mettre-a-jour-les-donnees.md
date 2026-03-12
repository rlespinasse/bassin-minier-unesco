# Comment mettre à jour les données

Ce guide explique comment actualiser les données lorsque les sources externes changent.

## Prérequis

- [Projet installé](installation.md)
- Un accès réseau aux APIs externes (data.gouv.fr, geo2france.fr, geo.api.gouv.fr)

## Mettre à jour toutes les données

La méthode la plus simple est de tout régénérer :

```bash
just rebuild
```

Cette commande supprime les fichiers GeoJSON existants, puis exécute le pipeline complet : téléchargement, conversion, enrichissement et indexation.

## Mettre à jour une source spécifique

### Couches WFS (geo2france.fr)

```bash
just convert-wfs
just enrich
just reverse-links
```

Concerne : bassin-minier, communes-mbm, et les couches zone tampon (zt-*).

L'étape `enrich` est nécessaire car les couches WFS fournissent les données d'enrichissement des bâtis et des cités minières.

### Shapefiles (data.gouv.fr)

```bash
just convert-shapefiles
just enrich
just reverse-links
```

Concerne : bien-inscrit, zone-tampon, bâtis, cavaliers, cités-minières, espace-neonaturel, terrils, puits-de-mines.

### EPCI (geo.api.gouv.fr)

```bash
just download-epci
just enrich
just reverse-links
```

L'enrichissement est nécessaire car les codes EPCI sont ajoutés aux communes.

### Départements (geo.api.gouv.fr)

```bash
just download-departements
just reverse-links
```

## Vérifier la mise à jour

Après toute mise à jour, vérifiez l'intégrité des données :

```bash
just check
just validate
```

- `check` vérifie que les 18 fichiers attendus sont présents dans `site/data/`
- `validate` vérifie que chaque fichier est du JSON valide et affiche le nombre d'entités par couche

Comparez le nombre d'entités avec les valeurs précédentes pour détecter des changements inattendus (disparition ou duplication d'entités).

## Vérifier visuellement

Lancez le serveur local pour inspecter les données sur la carte :

```bash
just serve
```

Activez les couches mises à jour et vérifiez que les entités s'affichent correctement.

## Dépannage

### Une API externe est indisponible

Les sources sont des services publics qui peuvent être temporairement hors ligne. Réessayez ultérieurement. Les fichiers GeoJSON précédents restent fonctionnels en attendant.

### Le nombre d'entités a changé

C'est normal si la source a été mise à jour. Vérifiez visuellement que les nouvelles entités sont cohérentes. Si des entités ont disparu, consultez la source pour comprendre le changement.

### Les enrichissements échouent

L'enrichissement repose sur des correspondances par `id_unesco` (bâtis) ou par nom normalisé (cités). Si la source modifie ces identifiants, les enrichissements ne matcheront plus. Vérifiez les identifiants dans les fichiers sources.
