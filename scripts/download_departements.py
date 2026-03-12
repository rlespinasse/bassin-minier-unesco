#!/usr/bin/env python3
"""Download department boundaries from geo.api.gouv.fr.

Fetches commune contours for departments 59 (Nord) and 62 (Pas-de-Calais),
dissolves them into single department polygons, simplifies geometries
and outputs site/data/departements.geojson.
"""

import json
import os

from shapely.geometry import shape, mapping
from shapely.ops import unary_union

from utils import fetch_json, round_coords

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'site', 'data')

COORD_PRECISION = 6
SIMPLIFY_TOLERANCE = 0.001

DEPARTMENTS = ['59', '62']

API_BASE = 'https://geo.api.gouv.fr'



def main():
    print("=== Downloading department boundaries ===\n")

    all_features = []
    for dept in DEPARTMENTS:
        # Fetch department metadata
        info_url = f'{API_BASE}/departements/{dept}?fields=nom,code'
        print(f"  Fetching department {dept} info...")
        info = fetch_json(info_url)
        nom = info.get('nom', '')
        code = info.get('code', dept)

        # Fetch all commune contours for this department
        communes_url = f'{API_BASE}/departements/{dept}/communes?format=geojson&geometry=contour'
        print(f"  Fetching commune contours for department {dept}...")
        geojson = fetch_json(communes_url)

        features = geojson.get('features', [])
        print(f"    {len(features)} communes fetched")

        if not features:
            print(f"    WARNING: no communes found for department {dept}")
            continue

        # Dissolve commune geometries into a single polygon
        geometries = [shape(f['geometry']) for f in features]
        merged = unary_union(geometries)

        # Simplify the geometry
        simplified = merged.simplify(SIMPLIFY_TOLERANCE, preserve_topology=True)

        all_features.append({
            'type': 'Feature',
            'properties': {
                'code': code,
                'nom': nom,
            },
            'geometry': mapping(simplified),
        })
        print(f"    -> dissolved into {simplified.geom_type}")

    print(f"\n  Department features: {len(all_features)}")

    output = {
        'type': 'FeatureCollection',
        'features': all_features,
    }

    # Round coordinates
    output = round_coords(output, COORD_PRECISION)

    # Write output
    os.makedirs(DATA_DIR, exist_ok=True)
    output_path = os.path.join(DATA_DIR, 'departements.geojson')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"\n  -> departements.geojson ({size_kb:.1f} KB, {len(all_features)} features)")
    print("\nDone.")


if __name__ == '__main__':
    main()
