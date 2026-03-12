# Comment déployer le site

Ce guide explique comment déployer le site sur GitHub Pages.

## Prérequis

- [Données générées](generer-les-donnees.md)
- Un dépôt GitHub avec GitHub Pages activé

## Étapes

### 1. Vérifier les données

```bash
just check
just validate
```

### 2. Déployer sur GitHub Pages

Le site est déployé depuis le dossier `site/`. Configurez GitHub Pages pour servir ce dossier depuis la branche souhaitée.

Le dossier `site/` contient tout le nécessaire :

- `index.html` : la page principale
- `css/` : les feuilles de style
- `js/` : le code JavaScript (app.js)
- `data/` : les fichiers GeoJSON et l'index de liens croisés
