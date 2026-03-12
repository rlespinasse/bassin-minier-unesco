# Pipeline de données

## Pourquoi un pipeline ?

Le site affiche des données patrimoniales issues de sources multiples (shapefiles, APIs WFS, APIs REST) avec des formats, projections et granularités différents. Le pipeline transforme ces données hétérogènes en un ensemble cohérent de fichiers GeoJSON prêts à être chargés par le navigateur, sans aucun appel API au runtime.

Ce choix de pré-génération garantit :

- Un fonctionnement hors-ligne après le chargement initial
- Des temps de réponse instantanés (pas d'attente réseau)
- Une indépendance vis-à-vis de la disponibilité des APIs sources

## Les quatre étapes du pipeline

Le pipeline s'exécute séquentiellement via `just convert` :

```text
Téléchargement → Conversion → Enrichissement → Indexation
```

### 1. Téléchargement et conversion

Trois scripts téléchargent les données depuis les sources externes :

**`convert_shapefiles.py`** récupère les shapefiles depuis data.gouv.fr. Ces fichiers sont en projection Lambert 93 (EPSG:2154), le système de coordonnées officiel de la France métropolitaine. Le script les reprojette en WGS84 (EPSG:4326), le standard du web cartographique utilisé par Leaflet. Il produit 8 fichiers GeoJSON (bien-inscrit, zone-tampon, bâtis, cavaliers, cités-minières, espace-neonaturel, terrils, puits-de-mines).

**`convert_wfs.py`** interroge le serveur WFS de geo2france.fr (Mission Bassin Minier). Ces données sont déjà en WGS84. Il produit 10 fichiers GeoJSON, dont 3 fichiers intermédiaires destinés à l'enrichissement (equipements-collectifs, equipements-extraction, cites-erbm).

**`download_epci.py`** et **`download_departements.py`** utilisent l'API REST geo.api.gouv.fr. Les départements sont construits par dissolution (union géométrique) des contours communaux, car l'API ne fournit pas directement les contours départementaux.

Tous les scripts appliquent les mêmes traitements :

- **Simplification géométrique** (tolérance 0.0001° ≈ 10 m) pour réduire la taille des fichiers sans perte visuelle perceptible aux niveaux de zoom utilisés
- **Arrondi des coordonnées** à 6 décimales (précision ≈ 0.1 m), suffisant pour la visualisation
- **Renommage** des propriétés en `snake_case`
- **Nettoyage** des chaînes (suppression des espaces, chaînes vides → `null`)

### 2. Enrichissement

Le script `enrich_geojson.py` fusionne les jeux de données qui se recoupent. Cette étape est nécessaire car les données patrimoniales proviennent de deux sources complémentaires : les shapefiles UNESCO (périmètre officiel) et les couches WFS de la Mission Bassin Minier (données descriptives plus riches).

Trois opérations d'enrichissement sont effectuées :

**Bâtis + Équipements.** Les shapefiles des bâtis contiennent la géométrie et la localisation, mais peu de métadonnées. Les couches WFS d'équipements (collectifs et extraction) apportent le nom, la compagnie, la période, le propriétaire et la protection. La fusion se fait par correspondance sur `id_unesco`. Les deux fichiers d'équipements sont ensuite supprimés.

**Cités minières + Cités ERBM.** Le shapefile des cités contient les données UNESCO, la couche WFS ERBM apporte des identifiants et propriétaires supplémentaires. La fusion se fait par correspondance sur le nom normalisé (sans accents, en minuscules). Les cités ERBM sans correspondance sont ajoutées comme nouvelles entités avec des champs UNESCO à `null`. Le fichier ERBM est ensuite supprimé.

**Communes + EPCI.** Les communes de la Mission Bassin Minier sont enrichies avec le code SIREN et le nom de l'EPCI de rattachement, récupérés via l'API geo.api.gouv.fr. Cette information permet la navigation commune → EPCI dans le panneau de détail.

Après enrichissement, le nombre de fichiers passe de 21 à 18 (suppression des 3 fichiers intermédiaires).

### 3. Indexation des liens croisés

Le script `build_reverse_links.py` parcourt les 15 couches GeoJSON finales et construit un index bidirectionnel `reverse-links.json`. Cet index permet au panneau de détail d'afficher instantanément toutes les entités liées à un élément sélectionné, sans parcourir toutes les couches côté client.

L'index contient 5 tables de correspondance :

**Communes.** Pour chaque commune, liste toutes les entités (bâtis, cités, terrils, cavaliers...) situées dans cette commune. L'indexation se fait sur les propriétés `commune_1` à `commune_6` selon les couches. Les noms sont normalisés (NFD + suppression des accents + minuscules) pour tolérer les variations d'écriture.

**Éléments.** Pour chaque code d'élément UNESCO, liste toutes les entités portant ce code. Permet de naviguer du bien inscrit vers les bâtis, cités et terrils qui le composent.

**Terrils.** Pour chaque identifiant de terril, liste les parvis agricoles d'où ce terril est visible (propriété `vue_sur`, liste d'identifiants séparés par des virgules) et les autres terrils associés.

**EPCI.** Pour chaque intercommunalité, liste les communes membres. Construit à partir de la propriété `epci_nom` des communes.

**Départements.** Pour chaque département, liste les communes et les EPCI rattachés. Le rattachement des communes est déterminé par le préfixe du code INSEE (59 = Nord, 62 = Pas-de-Calais). Les EPCI sont rattachés à chaque département dont ils couvrent au moins une commune.

Chaque entrée de l'index stocke l'index de l'entité dans son fichier GeoJSON et un libellé lisible, ce qui permet un affichage et une navigation instantanés sans recharger les données.

## Compromis et limites

**Taille des fichiers.** L'ensemble des données représente environ 3 Mo. La simplification géométrique réduit significativement cette taille, mais les couches à nombreuses entités (communes, EPCI, zt-cavaliers) restent volumineuses. Un découpage par tuiles n'a pas été jugé nécessaire aux volumes actuels.

**Fraîcheur des données.** Les données sont statiques : elles ne se mettent pas à jour automatiquement. Le pipeline doit être exécuté manuellement lors de changements dans les sources. Pour un site patrimonial, les données évoluent rarement.

**Correspondances d'enrichissement.** La fusion par nom normalisé (cités) est fragile face aux variations orthographiques. La fusion par `id_unesco` (bâtis) est plus robuste mais suppose que les identifiants restent stables entre les sources.

## Pour aller plus loin

- [Sources de données](sources-de-donnees.md) pour le détail de chaque source
- [Architecture du projet](architecture.md) pour la vue d'ensemble du système
- [Structure des fichiers GeoJSON](../reference/structure-geojson.md) pour les propriétés de chaque couche
