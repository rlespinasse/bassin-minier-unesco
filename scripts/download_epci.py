#!/usr/bin/env python3
"""Download EPCI boundaries from geo.api.gouv.fr for the bassin minier area.

Fetches EPCI GeoJSON for departments 59 (Nord) and 62 (Pas-de-Calais),
filters to only EPCIs that contain bassin minier communes, simplifies
geometries and outputs site/public/data/epci.geojson.
"""

import json
import os

from utils import fetch_json, round_coords

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'site', 'public', 'data')

COORD_PRECISION = 6

DEPARTMENTS = ['59', '62']

API_BASE = 'https://geo.api.gouv.fr'



def load_commune_insee_codes():
    """Load INSEE codes from communes-mbm.geojson."""
    path = os.path.join(DATA_DIR, 'communes-mbm.geojson')
    if not os.path.exists(path):
        print("  ERROR: communes-mbm.geojson not found")
        return set()
    with open(path) as f:
        data = json.load(f)
    codes = set()
    for feat in data.get('features', []):
        insee = feat.get('properties', {}).get('insee')
        if insee:
            codes.add(str(insee))
    return codes


def main():
    print("=== Downloading EPCI boundaries ===\n")

    # Load bassin minier commune INSEE codes
    commune_codes = load_commune_insee_codes()
    print(f"  Bassin minier communes: {len(commune_codes)} INSEE codes")

    if not commune_codes:
        print("  Cannot proceed without commune codes")
        return

    # Fetch commune-to-EPCI mapping to find relevant EPCIs
    relevant_epcis = {}  # code_siren -> set of commune codes
    for dept in DEPARTMENTS:
        url = f'{API_BASE}/communes?codeDepartement={dept}&fields=code,codeEpci'
        print(f"  Fetching communes for department {dept}...")
        communes = fetch_json(url)
        for c in communes:
            code = c.get('code')
            epci_code = c.get('codeEpci')
            if code in commune_codes and epci_code:
                if epci_code not in relevant_epcis:
                    relevant_epcis[epci_code] = {'communes': set()}
                relevant_epcis[epci_code]['communes'].add(code)

    print(f"  Relevant EPCIs: {len(relevant_epcis)}")

    # Fetch EPCI boundaries
    all_features = []
    for dept in DEPARTMENTS:
        url = f'{API_BASE}/epcis?codeDepartement={dept}&fields=nom,code&format=geojson&geometry=contour'
        print(f"  Fetching EPCI boundaries for department {dept}...")
        try:
            geojson = fetch_json(url)
        except Exception as e:
            print(f"    ERROR: {e}")
            continue
        for feat in geojson.get('features', []):
            code = feat.get('properties', {}).get('code')
            if code in relevant_epcis:
                all_features.append(feat)

    print(f"  EPCI features fetched: {len(all_features)}")

    # Deduplicate (same EPCI may appear in both departments)
    seen = set()
    unique_features = []
    for feat in all_features:
        code = feat['properties']['code']
        if code not in seen:
            seen.add(code)
            unique_features.append(feat)

    print(f"  Unique EPCI features: {len(unique_features)}")

    # Process features: rename properties
    output_features = []
    for feat in unique_features:
        props = feat['properties']
        code = props.get('code', '')
        nom = props.get('nom', '')

        output_features.append({
            'type': 'Feature',
            'properties': {
                'code_siren': code,
                'nom': nom,
            },
            'geometry': feat['geometry'],
        })

    output = {
        'type': 'FeatureCollection',
        'features': output_features,
    }

    # Round coordinates
    output = round_coords(output, COORD_PRECISION)

    # Write output
    os.makedirs(DATA_DIR, exist_ok=True)
    output_path = os.path.join(DATA_DIR, 'epci.geojson')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"\n  -> epci.geojson ({size_kb:.1f} KB, {len(output_features)} features)")
    print("\nDone.")


if __name__ == '__main__':
    main()
