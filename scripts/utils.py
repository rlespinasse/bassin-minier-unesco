"""Shared utilities for data processing scripts."""

import json
import re
import sys
import time
import urllib.error
import urllib.request

USER_AGENT = "bassin-minier-unesco/1.0"
TIMEOUT = 60
MAX_RETRIES = 3
RETRY_DELAY = 2


def open_url(url):
    """Open URL with User-Agent, timeout, and exponential backoff retry."""
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return urllib.request.urlopen(req, timeout=TIMEOUT)
        except (urllib.error.URLError, TimeoutError) as e:
            if attempt == MAX_RETRIES:
                raise
            print(f"  Retry {attempt}/{MAX_RETRIES - 1} for {url}: {e}", file=sys.stderr)
            time.sleep(RETRY_DELAY * attempt)


def fetch_json(url):
    """Fetch JSON from a URL."""
    with open_url(url) as response:
        return json.loads(response.read().decode("utf-8"))


def round_coords(geojson_dict, precision):
    """Round coordinates in a GeoJSON dict to reduce file size."""
    raw = json.dumps(geojson_dict)
    rounded = re.sub(r'-?\d+\.\d{7,}', lambda m: str(round(float(m.group()), precision)), raw)
    return json.loads(rounded)
