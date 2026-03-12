// --- Consumer cross-link handlers ---

import { normalizeText } from '../lib/leaflet-atlas/js/index.js';

let communeIndex = null;

export function buildCommuneIndex(app) {
    communeIndex = new Map();
    app.eachLayerFeature('communes-mbm', layer => {
        const name = layer.feature.properties.nom;
        if (name) communeIndex.set(normalizeText(name), layer);
    });
}

export const crossLinkHandlers = {
    commune: (app, value) => {
        if (!communeIndex) return;
        const layer = communeIndex.get(normalizeText(value));
        if (!layer) return;
        app.ensureLayerVisible('communes-mbm');
        if (layer.getBounds) {
            app.getMap().fitBounds(layer.getBounds(), { padding: [50, 50], maxZoom: 15 });
        }
        app.showFeatureDetail('communes-mbm', app.findFeatureIndex('communes-mbm', layer), layer.feature.properties);
        app.highlightFeature(layer, 'communes-mbm', { style: { weight: 4, fillOpacity: 0.5, color: '#e57373' } });
    },

    epci: (app, value) => {
        const found = app.findLayerByProperty('epci', p => p.nom && normalizeText(p.nom) === normalizeText(value));
        if (!found) return;
        app.ensureLayerVisible('epci');
        if (found.getBounds) {
            app.getMap().fitBounds(found.getBounds(), { padding: [50, 50], maxZoom: 13 });
        }
        app.showFeatureDetail('epci', app.findFeatureIndex('epci', found), found.feature.properties);
        app.highlightFeature(found, 'epci', { style: { weight: 4, fillOpacity: 0.2, color: '#7E57C2' } });
    },

    departement: (app, value) => {
        const found = app.findLayerByProperty('departements', p => p.nom && normalizeText(p.nom) === normalizeText(value));
        if (!found) return;
        app.ensureLayerVisible('departements');
        if (found.getBounds) {
            app.getMap().fitBounds(found.getBounds(), { padding: [50, 50], maxZoom: 11 });
        }
        app.showFeatureDetail('departements', app.findFeatureIndex('departements', found), found.feature.properties);
        app.highlightFeature(found, 'departements', { style: { weight: 4, fillOpacity: 0.1, color: '#FF8F00' } });
    },

    terril: (app, value) => {
        let found = null;
        let foundLayerId = null;
        for (const lid of ['terrils', 'zt-terrils']) {
            found = app.findLayerByProperty(lid, p => String(p.no_terril) === value || String(p.id) === value);
            if (found) { foundLayerId = lid; break; }
        }
        if (!found) return;
        app.ensureLayerVisible(foundLayerId);
        if (found.getBounds) {
            app.getMap().fitBounds(found.getBounds(), { padding: [50, 50], maxZoom: 16 });
        } else if (found.getLatLng) {
            app.getMap().setView(found.getLatLng(), 16);
        }
        app.showFeatureDetail(foundLayerId, app.findFeatureIndex(foundLayerId, found), found.feature.properties);
    },

    element: (app, value) => {
        const elementLayers = ['batis', 'cites-minieres', 'cavaliers', 'espace-neonaturel', 'terrils'];
        const matches = [];
        for (const lid of elementLayers) {
            app.eachLayerFeature(lid, lyr => {
                if (String(lyr.feature.properties.element) === value) {
                    matches.push({ layer: lyr, layerId: lid });
                }
            });
        }
        if (!matches.length) return;
        const bounds = L.latLngBounds();
        for (const m of matches) {
            app.ensureLayerVisible(m.layerId);
            if (m.layer.getBounds) {
                bounds.extend(m.layer.getBounds());
            } else if (m.layer.getLatLng) {
                bounds.extend(m.layer.getLatLng());
            }
        }
        if (bounds.isValid()) {
            app.getMap().fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
        const first = matches[0];
        app.showFeatureDetail(first.layerId, app.findFeatureIndex(first.layerId, first.layer), first.layer.feature.properties);
        for (const m of matches) {
            app.highlightFeature(m.layer, m.layerId, {
                style: { weight: 5, fillOpacity: 0.7, color: '#d32f2f', opacity: 1 },
                duration: 4000,
                bringToFront: true
            });
        }
    },
};
