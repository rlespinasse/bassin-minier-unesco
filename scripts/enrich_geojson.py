#!/usr/bin/env python3
"""Post-processing script to enrich and deduplicate GeoJSON files.

Runs after convert_wfs.py and convert_shapefiles.py. Merges overlapping datasets:
  - equipements-collectifs + equipements-extraction -> batis (enriched)
  - cites-erbm -> cites-minieres (enriched + appended)

Idempotent: skips enrichments if source files are already deleted.
"""

import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'site', 'data')


def load_geojson(name):
    path = os.path.join(DATA_DIR, name)
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def save_geojson(name, data):
    path = os.path.join(DATA_DIR, name)
    with open(path, 'w') as f:
        json.dump(data, f, ensure_ascii=False)


def delete_geojson(name):
    path = os.path.join(DATA_DIR, name)
    if os.path.exists(path):
        os.remove(path)
        print(f"  Deleted {name}")


def enrich_batis():
    """Enrich batis.geojson with properties from equipements-collectifs and equipements-extraction."""
    print("Enrichment A: batis + equipements")

    batis = load_geojson('batis.geojson')
    equip_coll = load_geojson('equipements-collectifs.geojson')
    equip_extr = load_geojson('equipements-extraction.geojson')

    if equip_coll is None and equip_extr is None:
        print("  Skipped (source files already deleted)")
        return

    if batis is None:
        print("  Skipped (batis.geojson not found)")
        return

    # Build lookup from equipements by id_unicode (= id_unesco in batis)
    equip_by_id = {}
    sources = []
    if equip_coll:
        sources.extend(equip_coll['features'])
    if equip_extr:
        sources.extend(equip_extr['features'])

    skipped = 0
    for feat in sources:
        p = feat['properties']
        key = p.get('id_unesco')
        if not key:
            skipped += 1
            continue
        equip_by_id[key] = p

    # Enrich batis features
    enriched = 0
    props_to_add = ['nom', 'compagnie', 'periode', 'proprietaire', 'protection']
    for feat in batis['features']:
        bp = feat['properties']
        key = bp.get('id_unesco')
        if key and key in equip_by_id:
            ep = equip_by_id[key]
            for prop in props_to_add:
                if prop not in bp or bp[prop] is None:
                    bp[prop] = ep.get(prop)
            enriched += 1

    save_geojson('batis.geojson', batis)
    delete_geojson('equipements-collectifs.geojson')
    delete_geojson('equipements-extraction.geojson')

    print(f"  Equipements indexed: {len(equip_by_id)} (skipped {skipped} null id)")
    print(f"  Batis enriched: {enriched}/{len(batis['features'])}")


def enrich_cites_minieres():
    """Enrich cites-minieres.geojson with cites-erbm.geojson properties and append unmatched."""
    print("Enrichment B: cites-minieres + cites-erbm")

    cites = load_geojson('cites-minieres.geojson')
    erbm = load_geojson('cites-erbm.geojson')

    if erbm is None:
        print("  Skipped (source file already deleted)")
        return

    if cites is None:
        print("  Skipped (cites-minieres.geojson not found)")
        return

    # Build lookup from cites-minieres by normalized name
    cites_by_name = {}
    for feat in cites['features']:
        name = feat['properties'].get('nom')
        if name:
            cites_by_name[name.strip().lower()] = feat

    # Match and enrich
    matched = 0
    unmatched_features = []
    props_to_add = ['id_lsm', 'nom_2', 'proprietaire', 'commune_3']

    for feat in erbm['features']:
        ep = feat['properties']
        name = ep.get('nom')
        key = name.strip().lower() if name else None

        if key and key in cites_by_name:
            cp = cites_by_name[key]['properties']
            for prop in props_to_add:
                if prop not in cp or cp[prop] is None:
                    cp[prop] = ep.get(prop)
            matched += 1
        else:
            # Append as new feature with null UNESCO fields
            new_props = dict(ep)
            for unesco_field in ['inscrit_mh', 'classe_mh', 'id_unesco', 'element', 'objet']:
                new_props.setdefault(unesco_field, None)
            feat_copy = dict(feat)
            feat_copy['properties'] = new_props
            unmatched_features.append(feat_copy)

    cites['features'].extend(unmatched_features)

    save_geojson('cites-minieres.geojson', cites)
    delete_geojson('cites-erbm.geojson')

    print(f"  Matched and enriched: {matched}")
    print(f"  Appended (unmatched): {len(unmatched_features)}")
    print(f"  Total cites-minieres: {len(cites['features'])}")


if __name__ == '__main__':
    print("=== GeoJSON Enrichment & Deduplication ===\n")
    enrich_batis()
    print()
    enrich_cites_minieres()
    print("\nDone.")
