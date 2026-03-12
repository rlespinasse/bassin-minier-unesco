# Tutoriel : Ajouter une nouvelle couche de données

Dans ce tutoriel, vous allez apprendre à ajouter une couche vectorielle au projet, de la source de données jusqu'à son affichage sur la carte interactive.

## Prérequis

- [Projet installé](../how-to/installation.md)
- [Données générées](../how-to/generer-les-donnees.md)
- Connaissance de base de Python et JavaScript
- Une source de données géographiques (GeoJSON, shapefile ou API WFS/REST)

## Étape 1 : Préparer le fichier GeoJSON

Le site charge des fichiers GeoJSON depuis `site/data/`. Votre couche doit produire un fichier dans ce répertoire.

Selon la source, ajoutez la conversion dans le script approprié :

- **Shapefile** (EPSG:2154) : `scripts/convert_shapefiles.py` — reprojection Lambert 93 → WGS84
- **WFS** (déjà en EPSG:4326) : `scripts/convert_wfs.py` — téléchargement direct
- **API REST** : créez un script dédié `scripts/download_<nom>.py`

Les conventions à respecter dans le script :

- Nommer les propriétés en `snake_case`
- Simplifier les géométries (tolérance : `0.0001` degrés ≈ 10 m)
- Arrondir les coordonnées à 6 décimales
- Nettoyer les chaînes (strip, vide → `None`)

Prenons l'exemple d'une couche fictive `musees.geojson` ajoutée via WFS. Ajoutez une entrée dans la liste `WFS_SOURCES` de `scripts/convert_wfs.py` :

```python
{
    "layer": "musees",
    "output": "musees.geojson",
    "keep_columns": ["NOM", "COMMUNE", "TYPE"],
    "rename": {
        "NOM": "nom",
        "COMMUNE": "commune",
        "TYPE": "type",
    },
}
```

## Étape 2 : Intégrer au pipeline

Dans le `justfile`, ajoutez le nom du fichier à la liste de vérification de la tâche `check` :

```just
files=(
    ...fichiers existants...
    musees.geojson
)
```

Si votre couche nécessite une tâche de téléchargement dédiée (script séparé), ajoutez-la comme dépendance de la tâche `convert` :

```just
convert: convert-wfs convert-shapefiles download-epci download-departements download-musees enrich reverse-links
```

Régénérez les données pour vérifier :

```bash
just convert
just check
just validate
```

## Étape 3 : Configurer le style visuel

Dans `site/js/config.js`, ajoutez trois entrées.

**Style** (couleur, bordure, opacité) :

```javascript
// Dans l'objet styles
'musees': {
    radius: 5,
    color: '#E91E63',
    weight: 1,
    fillColor: '#E91E63',
    fillOpacity: 0.6,
    opacity: 0.9,
},
```

**Motif de remplissage** (optionnel, pour les polygones) :

```javascript
// Dans l'objet layerPatterns
'musees': { type: 'circles', size: 10, radius: 3 },
```

**Tooltip** (texte au survol) :

```javascript
// Dans l'objet tooltipText
'musees': p => p.nom || 'Musée',
```

## Étape 4 : Déclarer la couche

Toujours dans `site/js/config.js`, ajoutez la couche dans un groupe existant ou créez-en un nouveau.

**Groupe de couches** — ajoutez dans `layerGroups` :

```javascript
// Dans le groupe approprié (ex: "Autres éléments du bassin minier")
{ id: 'musees', label: 'Musées', file: 'data/musees.geojson', active: false },
```

**Panneau de rendu** — ajoutez dans `layerPanes` :

```javascript
'musees': 'smallFeaturesPane',
```

Choisissez le panneau selon la taille des entités :
- `largeFeaturesPane` : grandes surfaces (départements, EPCI, zones tampon)
- `mediumFeaturesPane` : surfaces moyennes (cités, espaces néo-naturels)
- `smallFeaturesPane` : petits éléments (bâtis, terrils, points)

Si la géométrie est de type ligne (LineString), déclarez-le dans `app.js` :

```javascript
// Dans geometryTypes
'musees': 'line',
```

## Étape 5 : Configurer la recherche

Dans `site/js/config.js`, ajoutez une entrée dans `searchableProps` pour rendre la couche cherchable :

```javascript
'musees': {
    title: p => p.nom || 'Musée',
    meta: p => p.commune || '',
    text: ['nom', 'commune', 'type'],
},
```

- `title` : texte principal affiché dans les résultats
- `meta` : texte secondaire (commune, type...)
- `text` : liste des propriétés indexées pour la recherche

## Étape 6 : Créer le panneau de détail

Dans `site/js/detail-builders.js`, ajoutez une fonction de rendu pour le panneau de détail affiché au clic :

```javascript
'musees': p => buildDetail(p.nom || 'Musée', 'musees', [
    {
        label: 'Localisation',
        rows: [
            p.commune && ['Commune', communeLink(p, 'commune')],
        ],
    },
    {
        label: 'Informations',
        rows: [
            p.type && ['Type', p.type],
        ],
    },
]),
```

Utilisez `communeLink(p, 'commune')` pour créer un lien cliquable vers la fiche de la commune associée.

## Étape 7 : Ajouter les liens croisés (optionnel)

Si votre couche contient des propriétés `commune_*`, ajoutez-la dans `scripts/build_reverse_links.py` pour que les fiches communes listent les entités de votre couche :

```python
# Dans COMMUNE_PROPS
'musees': ['commune'],
```

Ajoutez aussi une entrée dans la fonction `label_for` pour définir le libellé :

```python
if layer == 'musees':
    return props.get('nom') or 'Musée'
```

Puis régénérez l'index :

```bash
just reverse-links
```

## Étape 8 : Vérifier le résultat

Lancez le serveur local et testez :

```bash
just serve
```

Vérifiez que :
- La couche apparaît dans le panneau de couches
- Les entités s'affichent avec le bon style et le bon tooltip
- La recherche trouve les entités de votre couche
- Le clic ouvre le panneau de détail avec les bonnes informations
- Les liens croisés fonctionnent (si configurés)

## Ce que vous avez appris

- Créer un fichier GeoJSON à partir d'une source de données
- Intégrer la couche dans le pipeline de données
- Configurer le style, le tooltip et le panneau de rendu
- Rendre la couche cherchable
- Créer le panneau de détail pour le clic
- Connecter la couche aux liens croisés

## Étapes suivantes

- [Couches cartographiques](../reference/couches-cartographiques.md) pour voir les couches existantes
- [Architecture du projet](../explanation/architecture.md) pour comprendre le fonctionnement global
- [Structure des fichiers GeoJSON](../reference/structure-geojson.md) pour le détail des propriétés par couche
