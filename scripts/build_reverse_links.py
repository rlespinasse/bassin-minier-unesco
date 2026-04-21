#!/usr/bin/env python3
"""Build reverse-links.json from GeoJSON data.

Scans all 15 GeoJSON files and produces a reverse lookup table so that
communes, UNESCO elements, and terrils can discover which features reference them.

Output: site/public/data/reverse-links.json
"""

import json
import os
import unicodedata

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'site', 'public', 'data')


def load_geojson(name):
    path = os.path.join(DATA_DIR, name)
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)


def normalize(text):
    """NFD + accent removal + lowercase, matching app.js normalizeText."""
    if not text or text == 'None':
        return None
    nfd = unicodedata.normalize('NFD', str(text))
    stripped = ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')
    return stripped.lower()


# --- Label extraction per layer ---

def label_for(layer_id, props):
    p = props
    if layer_id == 'batis':
        return p.get('denomination') or p.get('nom') or 'Bati minier'
    if layer_id == 'cites-minieres':
        return p.get('nom') or 'Cite miniere'
    if layer_id == 'cavaliers':
        uid = p.get('id_unesco')
        return 'Cavalier' + (' ' + uid if uid else '')
    if layer_id == 'espace-neonaturel':
        return p.get('nom') or 'Espace neo-naturel'
    if layer_id == 'terrils':
        return p.get('nom') or p.get('no_terril') or 'Terril'
    if layer_id == 'zt-cavaliers':
        return p.get('nom') or 'Cavalier (ZT)'
    if layer_id == 'zt-cites-minieres':
        return p.get('nom') or 'Cite (ZT)'
    if layer_id == 'zt-espaces-neonaturels':
        return p.get('nom') or 'Espace (ZT)'
    if layer_id == 'zt-terrils':
        return p.get('nom') or 'Terril (ZT)'
    if layer_id == 'zt-parvis-agricoles':
        return 'Parvis #' + str(p.get('id', ''))
    if layer_id == 'puits-de-mines':
        return ('Fosse ' + p['fosse']) if p.get('fosse') else 'Puits'
    return layer_id


# --- Commune property keys per layer ---

COMMUNE_PROPS = {
    'batis': ['commune_1', 'commune_2'],
    'cites-minieres': ['commune_1', 'commune_2', 'commune_3'],
    'cavaliers': ['commune_1', 'commune_2', 'commune_3', 'commune_4', 'commune_5', 'commune_6'],
    'espace-neonaturel': ['commune_1', 'commune_2'],
    'terrils': ['commune_1', 'commune_2', 'commune_3'],
    'zt-cavaliers': ['commune_1', 'commune_2', 'commune_3', 'commune_4'],
    'zt-cites-minieres': ['commune_1', 'commune_2', 'commune_3'],
    'zt-espaces-neonaturels': ['commune_1', 'commune_2', 'commune_3'],
    'zt-terrils': ['commune_1', 'commune_2', 'commune_3'],
    'puits-de-mines': ['commune'],
}

# Layers with an 'element' property for element reverse links
ELEMENT_LAYERS = ['batis', 'cites-minieres', 'cavaliers', 'espace-neonaturel', 'terrils']

# Layers with 'vue_sur' property (comma-separated terril IDs)
VUE_SUR_LAYERS = ['zt-parvis-agricoles', 'terrils']


def add_entry(index, key, layer_id, item):
    """Add an item to index[key][layer_id]."""
    if key not in index:
        index[key] = {}
    if layer_id not in index[key]:
        index[key][layer_id] = []
    index[key][layer_id].append(item)


def build():
    communes = {}
    elements = {}
    terrils = {}
    epcis = {}

    all_layer_ids = sorted(set(
        list(COMMUNE_PROPS.keys()) + ELEMENT_LAYERS + VUE_SUR_LAYERS
    ))

    for layer_id in all_layer_ids:
        geojson = load_geojson(f'{layer_id}.geojson')
        if not geojson:
            print(f"  Skipped {layer_id} (file not found)")
            continue

        features = geojson.get('features', [])
        print(f"  Processing {layer_id}: {len(features)} features")

        for idx, feature in enumerate(features):
            props = feature.get('properties', {})
            label = label_for(layer_id, props)
            item = {'index': idx, 'label': label}

            # Commune reverse links
            if layer_id in COMMUNE_PROPS:
                for key in COMMUNE_PROPS[layer_id]:
                    val = props.get(key)
                    norm = normalize(val)
                    if norm:
                        add_entry(communes, norm, layer_id, item)

            # Element reverse links
            if layer_id in ELEMENT_LAYERS:
                elem = props.get('element')
                if elem and str(elem) != 'None':
                    add_entry(elements, str(elem), layer_id, item)

            # Terril reverse links (vue_sur is comma-separated)
            if layer_id in VUE_SUR_LAYERS:
                vue_sur = props.get('vue_sur')
                if vue_sur and str(vue_sur) != 'None':
                    ids = [s.strip() for s in str(vue_sur).split(',') if s.strip()]
                    for tid in ids:
                        add_entry(terrils, tid, layer_id, item)

    # EPCI reverse links: communes-mbm features with epci_nom
    communes_geojson = load_geojson('communes-mbm.geojson')
    if communes_geojson:
        print(f"  Building EPCI reverse links from communes-mbm...")
        for idx, feature in enumerate(communes_geojson.get('features', [])):
            props = feature.get('properties', {})
            epci_nom = props.get('epci_nom')
            norm = normalize(epci_nom)
            if norm:
                label = props.get('nom', 'Commune')
                add_entry(epcis, norm, 'communes-mbm', {'index': idx, 'label': label})
        print(f"  EPCI entries: {len(epcis)}")

    # Département reverse links: communes and EPCIs per département
    departements = {}
    dept_geojson = load_geojson('departements.geojson')
    if dept_geojson and communes_geojson:
        # Build code -> nom mapping from departements.geojson
        dept_map = {}
        for feat in dept_geojson.get('features', []):
            p = feat.get('properties', {})
            dept_map[p.get('code')] = p.get('nom')

        print(f"  Building département reverse links...")

        # Link communes to départements via INSEE code prefix
        for idx, feature in enumerate(communes_geojson.get('features', [])):
            props = feature.get('properties', {})
            insee = props.get('insee', '')
            dept_code = insee[:2] if len(insee) >= 2 else None
            if dept_code and dept_code in dept_map:
                dept_nom = dept_map[dept_code]
                norm = normalize(dept_nom)
                if norm:
                    label = props.get('nom', 'Commune')
                    add_entry(departements, norm, 'communes-mbm', {'index': idx, 'label': label})

        # Link EPCIs to départements via their member communes
        epci_geojson = load_geojson('epci.geojson')
        if epci_geojson:
            # Determine which départements each EPCI covers based on its member communes
            epci_depts = {}
            for feature in communes_geojson.get('features', []):
                props = feature.get('properties', {})
                epci_nom = props.get('epci_nom')
                insee = props.get('insee', '')
                dept_code = insee[:2] if len(insee) >= 2 else None
                if epci_nom and dept_code and dept_code in dept_map:
                    if epci_nom not in epci_depts:
                        epci_depts[epci_nom] = set()
                    epci_depts[epci_nom].add(dept_code)

            for idx, feature in enumerate(epci_geojson.get('features', [])):
                props = feature.get('properties', {})
                epci_nom = props.get('nom', '')
                label = epci_nom or 'EPCI'
                for dept_code in epci_depts.get(epci_nom, set()):
                    dept_nom = dept_map[dept_code]
                    norm = normalize(dept_nom)
                    if norm:
                        add_entry(departements, norm, 'epci', {'index': idx, 'label': label})

        print(f"  Département entries: {len(departements)}")

    result = {
        'communes': communes,
        'elements': elements,
        'terrils': terrils,
        'epcis': epcis,
        'departements': departements,
    }

    output_path = os.path.join(DATA_DIR, 'reverse-links.json')
    with open(output_path, 'w') as f:
        json.dump(result, f, ensure_ascii=False, separators=(',', ':'))

    size = os.path.getsize(output_path)
    print(f"\n  Output: reverse-links.json ({size:,} bytes)")
    print(f"  Communes: {len(communes)} entries")
    print(f"  Elements: {len(elements)} entries")
    print(f"  Terrils: {len(terrils)} entries")
    print(f"  EPCIs: {len(epcis)} entries")
    print(f"  Départements: {len(departements)} entries")


if __name__ == '__main__':
    print("=== Building reverse links ===\n")
    build()
    print("\nDone.")
