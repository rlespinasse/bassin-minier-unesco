# Comment lancer le développement local

Ce guide explique comment démarrer le serveur local pour visualiser la carte.

## Prérequis

- [Projet installé](installation.md)
- [Données générées](generer-les-donnees.md)

## Démarrer le serveur

```bash
just serve
```

Ouvrez <http://localhost:8000> dans un navigateur.

## Démarrer avec régénération des données

Pour régénérer les données puis lancer le serveur en une seule commande :

```bash
just dev
```

## Notes

- Le serveur utilise le serveur HTTP intégré de Python (`http.server`) sur le port 8000.
- Le suivi analytique GoatCounter est désactivé automatiquement sur `localhost`.
- Aucun outil de build n'est nécessaire : le site est composé de HTML/CSS/JS statique.
