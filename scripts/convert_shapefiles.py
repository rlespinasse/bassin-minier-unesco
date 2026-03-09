#!/usr/bin/env python3
"""Download and convert shapefiles from data.gouv.fr to WGS84 GeoJSON for web display."""

import geopandas as gpd
import json
import os
import tempfile
import urllib.request
import zipfile
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "site" / "data"

# Data sources: each has a URL, optional subdirectory, and shapefile configurations
DATA_SOURCES = [
    {
        "url": "https://www.data.gouv.fr/fr/datasets/r/7bea0497-889d-410c-8de9-144f4159ae8e",
        "subdir": "UNESCO - L93 2018",
        "shapefiles": {
            "Bien Inscrit UNESCO BM.shp": {
                "output": "bien-inscrit.geojson",
                "keep_columns": ["No section", "Section", "No element", "Nom", "Surface"],
                "rename": {
                    "No section": "no_section",
                    "Section": "section",
                    "No element": "no_element",
                    "Nom": "nom",
                    "Surface": "surface_ha",
                },
            },
            "Zone Tampon.shp": {
                "output": "zone-tampon.geojson",
                "keep_columns": ["ID", "Surface"],
                "rename": {"ID": "id", "Surface": "surface_ha"},
            },
            "batis.shp": {
                "output": "batis.geojson",
                "keep_columns": [
                    "COMMUNE_1", "COMMUNE_2", "Typologie", "Inscrit_MH", "Classé_MH",
                    "ID_UNESCO", "element", "objet", "Dénominat",
                ],
                "rename": {
                    "COMMUNE_1": "commune_1",
                    "COMMUNE_2": "commune_2",
                    "Typologie": "typologie",
                    "Inscrit_MH": "inscrit_mh",
                    "Classé_MH": "classe_mh",
                    "ID_UNESCO": "id_unesco",
                    "element": "element",
                    "objet": "objet",
                    "Dénominat": "denomination",
                },
            },
            "cavaliers.shp": {
                "output": "cavaliers.geojson",
                "keep_columns": [
                    "ID_UNESCO", "element", "objet",
                    "Commune 1", "Commune 2", "Commune 3",
                    "Commune 4", "Commune 5", "Commune 6", "Longueur M",
                ],
                "rename": {
                    "ID_UNESCO": "id_unesco",
                    "Commune 1": "commune_1",
                    "Commune 2": "commune_2",
                    "Commune 3": "commune_3",
                    "Commune 4": "commune_4",
                    "Commune 5": "commune_5",
                    "Commune 6": "commune_6",
                    "Longueur M": "longueur_m",
                    "element": "element",
                    "objet": "objet",
                },
            },
            "cités minières.shp": {
                "output": "cites-minieres.geojson",
                "keep_columns": [
                    "NOM", "COMMUNE_1", "COMMUNE_2", "TYPE", "COMPAGNIE",
                    "INTERET", "INSCRIT_MH", "CLASSE_MH", "ID_UNESCO", "element", "objet",
                ],
                "rename": {
                    "NOM": "nom",
                    "COMMUNE_1": "commune_1",
                    "COMMUNE_2": "commune_2",
                    "TYPE": "type",
                    "COMPAGNIE": "compagnie",
                    "INTERET": "interet",
                    "INSCRIT_MH": "inscrit_mh",
                    "CLASSE_MH": "classe_mh",
                    "ID_UNESCO": "id_unesco",
                    "element": "element",
                    "objet": "objet",
                },
            },
            "espace neonaturel.shp": {
                "output": "espace-neonaturel.geojson",
                "keep_columns": [
                    "NOM", "COMMUNE_1", "COMMUNE_2", "ID_UNESCO", "element", "objet",
                ],
                "rename": {
                    "NOM": "nom",
                    "COMMUNE_1": "commune_1",
                    "COMMUNE_2": "commune_2",
                    "ID_UNESCO": "id_unesco",
                    "element": "element",
                    "objet": "objet",
                },
            },
            "Terrils.shp": {
                "output": "terrils.geojson",
                "keep_columns": [
                    "NO_TERRIL", "NOM", "COMMUNE_1", "COMMUNE_2", "COMMUNE_3",
                    "COMPAGNIE", "GROUPE", "FORME", "ID_UNESCO", "element", "objet",
                ],
                "rename": {
                    "NO_TERRIL": "no_terril",
                    "NOM": "nom",
                    "COMMUNE_1": "commune_1",
                    "COMMUNE_2": "commune_2",
                    "COMMUNE_3": "commune_3",
                    "COMPAGNIE": "compagnie",
                    "GROUPE": "groupe",
                    "FORME": "forme",
                    "ID_UNESCO": "id_unesco",
                    "element": "element",
                    "objet": "objet",
                },
            },
        },
    },
    {
        "url": "https://cdn.s-pass.org/SPASSDATA/attachments/2022_07/18/127666-puits-de-mines-bm-npdc.zip",
        "subdir": None,
        "shapefiles": {
            "puits_de_mines BM_NPdC.shp": {
                "output": "puits-de-mines.geojson",
                "keep_columns": [
                    "COMMUNE", "COMPAGNIE", "CONCESSION", "FOSSE", "FOS_ALIAS",
                    "PUITS", "COTE", "CREUSEMENT", "FERMETURE", "PROFONDEUR", "BRGM",
                ],
                "rename": {
                    "COMMUNE": "commune",
                    "COMPAGNIE": "compagnie",
                    "CONCESSION": "concession",
                    "FOSSE": "fosse",
                    "FOS_ALIAS": "fosse_alias",
                    "PUITS": "puits",
                    "COTE": "cote",
                    "CREUSEMENT": "creusement",
                    "FERMETURE": "fermeture",
                    "PROFONDEUR": "profondeur",
                    "BRGM": "brgm",
                },
            },
        },
    },
]

SIMPLIFY_TOLERANCE = 0.0001  # ~10m in degrees
COORD_PRECISION = 6


def download_and_extract(url, dest_dir):
    """Download ZIP from data.gouv.fr and extract to dest_dir."""
    zip_path = os.path.join(dest_dir, "data.zip")
    print(f"Downloading from data.gouv.fr...")
    req = urllib.request.Request(url, headers={"User-Agent": "bassin-minier-unesco/1.0"})
    with urllib.request.urlopen(req) as response, open(zip_path, "wb") as out:
        out.write(response.read())
    print(f"Extracting to {dest_dir}...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(dest_dir)
    os.remove(zip_path)


def round_coords(geojson_dict, precision):
    """Round coordinates in a GeoJSON dict to reduce file size."""
    import re
    raw = json.dumps(geojson_dict)
    rounded = re.sub(r'-?\d+\.\d{7,}', lambda m: str(round(float(m.group()), precision)), raw)
    return json.loads(rounded)


def convert_shapefile(data_dir, source_name, config):
    source_path = data_dir / source_name
    output_path = OUTPUT_DIR / config["output"]

    print(f"Converting {source_name}...")

    gdf = gpd.read_file(source_path)
    print(f"  CRS: {gdf.crs}, {len(gdf)} features")

    # Reproject to WGS84
    gdf = gdf.to_crs(epsg=4326)

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
    geojson_dict = json.loads(geojson_str)

    # Round coordinates
    geojson_dict = round_coords(geojson_dict, COORD_PRECISION)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(geojson_dict, f, ensure_ascii=False)

    size_kb = output_path.stat().st_size / 1024
    print(f"  -> {config['output']} ({size_kb:.1f} KB, {len(gdf)} features)")
    return size_kb


def resolve_data_dir(tmp_dir, subdir):
    """Resolve the data directory inside an extracted ZIP."""
    if subdir:
        data_dir = Path(tmp_dir) / subdir
        if data_dir.exists():
            return data_dir
    # Try to find an extracted subdirectory
    subdirs = [d for d in Path(tmp_dir).iterdir() if d.is_dir()]
    if subdirs:
        return subdirs[0]
    return Path(tmp_dir)


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    total_size = 0
    for source in DATA_SOURCES:
        with tempfile.TemporaryDirectory() as tmp_dir:
            download_and_extract(source["url"], tmp_dir)
            data_dir = resolve_data_dir(tmp_dir, source.get("subdir"))

            for source_name, config in source["shapefiles"].items():
                try:
                    size = convert_shapefile(data_dir, source_name, config)
                    total_size += size
                except Exception as e:
                    print(f"  ERROR: {e}")

    print(f"\nTotal GeoJSON size: {total_size:.1f} KB ({total_size / 1024:.2f} MB)")


if __name__ == "__main__":
    main()
