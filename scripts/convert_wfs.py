#!/usr/bin/env python3
"""Download and convert WFS layers from geo2france.fr to GeoJSON for web display."""

import geopandas as gpd
import json
import re
import urllib.request
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "site" / "data"

# WFS sources: download GeoJSON directly from WFS endpoints
WFS_SOURCES = [
    {
        "url": (
            "https://www.geo2france.fr/geoserver/mission_bassin_minier/ows"
            "?service=WFS&version=1.1.0&request=GetFeature"
            "&typeName=mission_bassin_minier:bassin_minier"
            "&outputFormat=application/json&srsName=EPSG:4326"
        ),
        "output": "bassin-minier.geojson",
        "keep_columns": ["nom", "surf_km", "pop"],
        "rename": {
            "nom": "nom",
            "surf_km": "surface_km2",
            "pop": "population",
        },
    },
]

SIMPLIFY_TOLERANCE = 0.0001  # ~10m in degrees
COORD_PRECISION = 6


def round_coords(geojson_dict, precision):
    """Round coordinates in a GeoJSON dict to reduce file size."""
    raw = json.dumps(geojson_dict)
    rounded = re.sub(r'-?\d+\.\d{7,}', lambda m: str(round(float(m.group()), precision)), raw)
    return json.loads(rounded)


def convert_wfs(config):
    """Download GeoJSON from a WFS endpoint and process it."""
    output_path = OUTPUT_DIR / config["output"]

    print(f"Downloading from WFS: {config['output']}...")
    req = urllib.request.Request(config["url"], headers={"User-Agent": "bassin-minier-unesco/1.0"})
    with urllib.request.urlopen(req) as response:
        geojson_dict = json.loads(response.read().decode("utf-8"))

    gdf = gpd.GeoDataFrame.from_features(geojson_dict["features"], crs="EPSG:4326")
    print(f"  CRS: EPSG:4326, {len(gdf)} features")

    # Simplify geometries
    gdf["geometry"] = gdf["geometry"].simplify(SIMPLIFY_TOLERANCE, preserve_topology=True)

    # Keep only relevant columns
    available_cols = [c for c in config["keep_columns"] if c in gdf.columns]
    missing = [c for c in config["keep_columns"] if c not in gdf.columns]
    if missing:
        print(f"  Warning: missing columns {missing}")

    gdf = gdf[available_cols + ["geometry"]]

    # Rename columns
    rename_map = {k: v for k, v in config["rename"].items() if k in gdf.columns}
    gdf = gdf.rename(columns=rename_map)

    # Clean string fields: strip whitespace, replace empty with None
    for col in gdf.select_dtypes(include=["object", "string"]).columns:
        if col != "geometry":
            gdf[col] = gdf[col].apply(lambda x: x.strip() if isinstance(x, str) else x)
            gdf[col] = gdf[col].replace({"": None, " ": None})

    # Export to GeoJSON
    geojson_str = gdf.to_json(ensure_ascii=False)
    geojson_out = json.loads(geojson_str)
    geojson_out = round_coords(geojson_out, COORD_PRECISION)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(geojson_out, f, ensure_ascii=False)

    size_kb = output_path.stat().st_size / 1024
    print(f"  -> {config['output']} ({size_kb:.1f} KB, {len(gdf)} features)")
    return size_kb


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    total_size = 0
    for config in WFS_SOURCES:
        try:
            size = convert_wfs(config)
            total_size += size
        except Exception as e:
            print(f"  ERROR: {e}")

    print(f"\nTotal GeoJSON size: {total_size:.1f} KB ({total_size / 1024:.2f} MB)")


if __name__ == "__main__":
    main()
