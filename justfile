# Bassin Minier UNESCO - Site vitrine statique

set dotenv-load := false

python := "python3"
port := "8000"

# List available recipes
default:
    @just --list

# --- Setup ---

# Install Python dependencies (geopandas)
[group('setup')]
install:
    uv pip install geopandas

# --- Data ---

# Download and convert all data sources to GeoJSON
[group('data')]
convert: convert-wfs convert-shapefiles download-epci download-departements enrich reverse-links

# Download from WFS endpoints and convert to GeoJSON
[group('data')]
convert-wfs:
    {{ python }} scripts/convert_wfs.py

# Download shapefiles from data.gouv.fr and convert to GeoJSON (EPSG:2154 -> EPSG:4326)
[group('data')]
convert-shapefiles:
    {{ python }} scripts/convert_shapefiles.py

# Download EPCI boundaries from geo.api.gouv.fr
[group('data')]
download-epci:
    {{ python }} scripts/download_epci.py

# Download department boundaries from geo.api.gouv.fr
[group('data')]
download-departements:
    {{ python }} scripts/download_departements.py

# Enrich and deduplicate GeoJSON files (merge overlapping datasets)
[group('data')]
enrich:
    {{ python }} scripts/enrich_geojson.py

# Build reverse-links.json (bidirectional lookups between features)
[group('data')]
reverse-links:
    {{ python }} scripts/build_reverse_links.py

# Remove generated GeoJSON files
[group('data')]
clean:
    rm -f site/data/*.geojson
    @echo "Cleaned site/data/"

# Rebuild: clean then convert
[group('data')]
rebuild: clean convert

# --- Site assets ---

# Generate all favicon and icon files from favicon.svg (requires ImageMagick: brew install imagemagick)
[group('site')]
favicons:
    #!/usr/bin/env bash
    set -euo pipefail
    if ! command -v magick &>/dev/null; then
        echo "Error: ImageMagick is required. Install it with: brew install imagemagick"
        exit 1
    fi
    cd site
    echo "Generating favicons from favicon.svg..."
    magick -background none favicon.svg -resize 16x16 favicon-16x16.png
    magick -background none favicon.svg -resize 32x32 favicon-32x32.png
    magick -background none favicon.svg -resize 180x180 apple-touch-icon.png
    magick -background none favicon.svg -resize 192x192 android-chrome-192x192.png
    magick -background none favicon.svg -resize 512x512 android-chrome-512x512.png
    magick -background none favicon.svg -resize 16x16 /tmp/fav-16.png
    magick -background none favicon.svg -resize 32x32 /tmp/fav-32.png
    magick -background none favicon.svg -resize 48x48 /tmp/fav-48.png
    magick /tmp/fav-16.png /tmp/fav-32.png /tmp/fav-48.png favicon.ico
    rm -f /tmp/fav-16.png /tmp/fav-32.png /tmp/fav-48.png
    echo "Generated: favicon.ico favicon-16x16.png favicon-32x32.png apple-touch-icon.png android-chrome-192x192.png android-chrome-512x512.png"

# --- Dev ---

# Start a local development server
[group('dev')]
serve:
    @echo "Serving site at http://localhost:{{ port }}"
    cd site && {{ python }} -m http.server {{ port }}

# Convert shapefiles then start the dev server
[group('dev')]
dev: convert serve

# --- Quality ---

# Check that all 17 GeoJSON files exist in site/data/
[group('quality')]
check:
    #!/usr/bin/env bash
    set -euo pipefail
    files=(
        bassin-minier.geojson
        bien-inscrit.geojson
        zone-tampon.geojson
        batis.geojson
        cavaliers.geojson
        cites-minieres.geojson
        espace-neonaturel.geojson
        terrils.geojson
        puits-de-mines.geojson
        communes-mbm.geojson
        epci.geojson
        departements.geojson
        zt-cavaliers.geojson
        zt-cites-minieres.geojson
        zt-espaces-neonaturels.geojson
        zt-terrils.geojson
        zt-parvis-agricoles.geojson
        reverse-links.json
    )
    missing=0
    for f in "${files[@]}"; do
        if [ -f "site/data/$f" ]; then
            size=$(du -h "site/data/$f" | cut -f1)
            echo "OK   site/data/$f ($size)"
        else
            echo "MISS site/data/$f"
            missing=$((missing + 1))
        fi
    done
    total=$(du -sh site/data/ | cut -f1)
    echo ""
    echo "Total: $total"
    if [ "$missing" -gt 0 ]; then
        echo "$missing file(s) missing. Run 'just convert' first."
        exit 1
    fi
    echo "All files present."

# Validate GeoJSON files are parseable JSON
[group('quality')]
validate:
    #!/usr/bin/env bash
    set -euo pipefail
    errors=0
    for f in site/data/*.geojson; do
        if {{ python }} -c "import json; json.load(open('$f'))" 2>/dev/null; then
            count=$({{ python }} -c "import json; d=json.load(open('$f')); print(len(d.get('features',[])))")
            echo "OK   $f ($count features)"
        else
            echo "FAIL $f (invalid JSON)"
            errors=$((errors + 1))
        fi
    done
    if [ "$errors" -gt 0 ]; then
        echo "$errors file(s) failed validation."
        exit 1
    fi
    echo "All GeoJSON files valid."
