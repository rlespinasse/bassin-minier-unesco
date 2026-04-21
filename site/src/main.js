import 'leaflet/dist/leaflet.css';
import 'leaflet-atlas/css';
import './style.css';

import { MapApp } from 'leaflet-atlas';
import {
    styles, layerPatterns, tooltipText, layerGroups, contextLayers,
    layerPanes, borderClickLayers, searchableProps, dataGouvSources
} from './config.js';
import { buildLegalPages } from './legal.js';
import { createDetailBuilders } from './detail-builders.js';
import { crossLinkHandlers, buildCommuneIndex } from './cross-links.js';

const app = new MapApp({
    map: { center: [50.35, 2.8], zoom: 10, elementId: 'map', zoomSnap: 0.5 },
    title: {
        icon: 'favicon.svg',
        heading: 'Bassin Minier du Nord-Pas de Calais',
        subtitle: 'Patrimoine mondial de l\'UNESCO \u2014 Paysage culturel \u00e9volutif vivant, inscrit en 2012'
    },
    baseLayers: {
        'IGN': {
            url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}',
            options: {
                attribution: '&copy; <a href="https://www.ign.fr/">IGN</a>',
                maxZoom: 18
            },
            thumbnailUrl: 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX=10&TILEROW=345&TILECOL=520'
        },
        'Clair': {
            url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            options: {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            },
            thumbnailUrl: 'https://a.basemaps.cartocdn.com/light_all/10/520/345.png'
        },
        'Satellite': {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            options: {
                attribution: '&copy; <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics',
                maxZoom: 18
            },
            thumbnailUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/345/520'
        }
    },
    defaultBaseLayer: 'Clair',
    layerGroups,
    contextLayers,
    styles,
    patterns: layerPatterns,
    tooltips: tooltipText,
    layerPanes,
    borderClickLayers,
    searchableProps,
    detailBuilders: helpers => createDetailBuilders(helpers),
    crossLinkHandlers,
    maskLayer: { sourceLayerId: 'bassin-minier', fillColor: '#000', fillOpacity: 0.3 },
    boundsLayerId: 'bassin-minier',
    boundsFallback: { center: [50.35, 2.8], zoom: 10 },
    geometryTypes: {
        'cavaliers': 'line',
        'zt-cavaliers': 'line',
    },
    panes: {
        bassinPane: { zIndex: 350 },
        maskPane: { zIndex: 360, pointerEvents: 'none' },
        largeFeaturesPane: { zIndex: 370 },
        deptBorderPane: { zIndex: 373 },
        epciBorderPane: { zIndex: 375 },
        communeBorderPane: { zIndex: 377 },
        mediumFeaturesPane: { zIndex: 380 },
        smallFeaturesPane: { zIndex: 390 },
    },
    legalPages: buildLegalPages(dataGouvSources),
    analytics: { provider: 'goatcounter', basePath: '/bassin-minier-unesco/' },
    reverseLinksUrl: 'data/reverse-links.json',
    onReady: app => {
        buildCommuneIndex(app);
    },
});
