# Comment installer le projet

Ce guide explique comment installer les prérequis et les dépendances du projet.

## Prérequis

- [mise](https://mise.jdx.dev/) pour la gestion des outils (installe automatiquement Python et just)
- Un navigateur web moderne

## Étapes

### 1. Installer mise

Suivez les instructions sur [mise.jdx.dev](https://mise.jdx.dev/) pour votre système d'exploitation.

### 2. Installer les outils du projet

```bash
mise install
```

Cette commande installe automatiquement Python et [just](https://just.systems/) selon les versions définies dans `mise.toml`.

### 3. Installer les dépendances Python

```bash
just install
```

Cette commande installe [GeoPandas](https://geopandas.org/) et ses dépendances via `uv pip`.

## Vérification

Vérifiez que l'installation est correcte :

```bash
just --list
```

Vous devriez voir la liste des commandes disponibles (convert, serve, check, etc.).
