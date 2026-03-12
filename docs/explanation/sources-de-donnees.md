# Sources de données

## Pourquoi ces sources ?

Le projet s'appuie sur des données ouvertes publiées par des organismes publics français. Ce choix garantit la fiabilité, la pérennité et la réutilisabilité des données sous [Licence Ouverte ETALAB v2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/).

## data.gouv.fr — Shapefiles

### Périmètre UNESCO

Source : [Périmètre bien inscrit et zone tampon du Bassin Minier](https://www.data.gouv.fr/datasets/perimetre-bien-inscrit-et-zone-tampon-du-bassin-minier-patrimoine-mondial-unesco)

Ce jeu de données fournit les périmètres officiels de l'inscription UNESCO de 2012 :

- **Bien inscrit** : le périmètre exact du bien classé au patrimoine mondial
- **Zone tampon** : la zone de protection réglementaire autour du bien
- **Bâtis** : les bâtiments liés à l'histoire minière (fosses, chevalements, équipements, monuments)
- **Cavaliers** : les anciennes voies ferrées utilisées pour le transport du charbon
- **Cités minières** : les cités ouvrières (corons, cités pavillonnaires, cités-jardins, cités modernes)
- **Espaces néo-naturels** : les étendues d'eau formées par les affaissements miniers
- **Terrils** : les dépôts de schistes issus de l'exploitation

Ces données sont publiées en projection Lambert 93 (EPSG:2154) et converties en WGS84 (EPSG:4326) par le pipeline.

### Puits de mines

Source : [Anciens puits de mines dans le Bassin minier du Nord-Pas-de-Calais](https://www.data.gouv.fr/datasets/anciens-puits-de-mines-dans-le-bassin-minier-du-nord-pas-de-calais)

- **Puits de mines** : 636 localisations d'anciens puits de mines

## geo2france.fr — WFS

Les couches WFS de la Mission Bassin Minier apportent des données complémentaires :

Source : [Bassin minier au sens de la Mission Bassin Minier](https://www.data.gouv.fr/datasets/bassin-minier-au-sens-de-la-mission-bassin-minier)

- **Bassin minier** : le contour du bassin minier selon la Mission Bassin Minier
- **Communes MBM** : les communes du périmètre de la Mission Bassin Minier
- **Couches zone tampon** : cavaliers, cités minières, espaces néo-naturels, terrils et parvis agricoles spécifiques à la zone tampon

Ces couches WFS fournissent également les données d'enrichissement :

- **Équipements collectifs et d'extraction** : fusionnés dans la couche bâtis (nom, compagnie, période, propriétaire, protection)
- **Cités ERBM** : fusionnées dans la couche cités minières (identifiant, nom, propriétaire, commune)

## geo.api.gouv.fr — API REST

L'API géographique du gouvernement fournit les découpages administratifs :

- **EPCI** : les intercommunalités couvrant les communes du bassin minier (départements 59 et 62)
- **Départements** : les contours du Nord (59) et du Pas-de-Calais (62), obtenus par dissolution des contours communaux

Les codes EPCI sont également utilisés pour enrichir les communes MBM (code SIREN et nom de l'EPCI de rattachement).

## Enrichissements

Le script `enrich_geojson.py` fusionne les jeux de données qui se recoupent, réduisant le nombre de fichiers de 18 à 16 :

| Couche enrichie  | Sources fusionnées                              | Champs ajoutés                                     |
| ---------------- | ----------------------------------------------- | -------------------------------------------------- |
| Bâtis            | Équipements collectifs + équipements extraction | nom, compagnie, période, propriétaire, protection  |
| Cités minières   | Cités ERBM                                      | id_lsm, nom_2, propriétaire, commune_3             |
| Communes MBM     | geo.api.gouv.fr                                 | code SIREN et nom de l'EPCI                        |
