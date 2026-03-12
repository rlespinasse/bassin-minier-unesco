"""Shared utilities for data processing scripts."""

import json
import re
import urllib.request


def fetch_json(url):
    """Fetch JSON from a URL."""
    req = urllib.request.Request(url, headers={'User-Agent': 'bassin-minier-unesco/1.0'})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode('utf-8'))


def round_coords(geojson_dict, precision):
    """Round coordinates in a GeoJSON dict to reduce file size."""
    raw = json.dumps(geojson_dict)
    rounded = re.sub(r'-?\d+\.\d{7,}', lambda m: str(round(float(m.group()), precision)), raw)
    return json.loads(rounded)
