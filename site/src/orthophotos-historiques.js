import L from 'leaflet';

// Service WMS Géo2France (GeoServer Hauts-de-France). Vérifié : répond en
// EPSG:3857 par reprojection à la volée bien que le service ne déclare que
// EPSG:2154 et CRS:84 dans son GetCapabilities — même situation que le
// GeoServer de la MEL utilisé par ChronoMEL.
export const WMS_BASE = 'https://www.geo2france.fr/geoserver/ows';

// z-index : au-dessus du fond de carte mais sous les couches vectorielles
// patrimoniales (mêmes panes que le reste du site, cf. site/src/main.js).
const ORTHO_Z_INDEX = 250;

// Emprise (EPSG:3857) utilisée pour générer les vignettes des cartes de
// sélection — un point du bassin minier, vérifié non vide sur les 6 couches.
const THUMBNAIL_BBOX_3857 = '326000,6560000,330000,6564000';

/** URL GetMap statique pour la vignette d'un millésime (carte de sélection). */
export function buildThumbnailUrl(layerName) {
  const params = new URLSearchParams({
    service: 'WMS',
    version: '1.3.0',
    request: 'GetMap',
    layers: layerName,
    styles: '',
    bbox: THUMBNAIL_BBOX_3857,
    width: '80',
    height: '80',
    crs: 'EPSG:3857',
    format: 'image/png',
    transparent: 'true',
  });
  return `${WMS_BASE}?${params.toString()}`;
}

/** @typedef {{ id: string, annee: string, layer: string, libelle: string }} MillesimeHistorique */

/**
 * Catalogue des millésimes d'orthophotographie historique du Nord-Pas-de-Calais
 * disponibles sur le WMS Géo2France, vérifiés via GetCapabilities le 2026-07-11.
 * Les sources data.gouv.fr correspondantes sont citées dans la page "Crédits"
 * (voir `dataGouvSources` dans site/src/config.js et
 * chronomel/docs/orthophotographies-france-data-gouv-fr.md pour le détail).
 * @type {MillesimeHistorique[]}
 */
export const MILLESIMES_HISTORIQUES = [
  {
    id: '1950',
    annee: '1949-1955',
    layer: 'ign:1949_1952_1955_R32_Ortho_0m50_NB_COG',
    libelle: '1949-1955 (noir et blanc)',
  },
  {
    id: '1998',
    annee: '1998',
    layer: 'geo2france:1998_D59_D62_Ortho_0m50_RVB_COG',
    libelle: '1998',
  },
  {
    id: '2005',
    annee: '2005',
    layer: 'geo2france:ortho_2005',
    libelle: '2005',
  },
  {
    id: '2009',
    annee: '2009',
    layer: 'geo2france:ortho_2009_rgb',
    libelle: '2009',
  },
  {
    id: '2012',
    annee: '2012-2013',
    layer: 'geo2france:ortho_2012_rgb',
    libelle: '2012-2013',
  },
  {
    id: '2015',
    annee: '2015',
    layer: 'geo2france:ortho_2015_rgb',
    libelle: '2015',
  },
];

/**
 * Crée une couche WMS Leaflet pour un millésime historique donné.
 * @param {MillesimeHistorique} millesime
 * @returns {L.TileLayer.WMS}
 */
export function createOrthoHistoriqueLayer(millesime) {
  const layer = L.tileLayer.wms(WMS_BASE, {
    layers: millesime.layer,
    format: 'image/png',
    version: '1.3.0',
    // Les zones hors emprise de la couche renvoient un blanc opaque quand
    // transparent=false (vérifié) — ce qui masque le fond de carte partout
    // où l'orthophoto n'a pas de donnée. transparent=true laisse ces zones
    // en alpha=0 et le fond de carte reste visible en dessous.
    transparent: true,
    tiled: true,
    maxZoom: 20,
    attribution:
      'Orthophotographies historiques © <a href="https://www.geo2france.fr/" target="_blank" rel="noopener">Géo2France</a> / IGN — Licence Ouverte',
  });
  layer.setZIndex(ORTHO_Z_INDEX);
  return layer;
}
