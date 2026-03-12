// --- Pure utility functions ---

import { styles, allLayerDefs } from './config.js';

// --- Analytics ---

export function isLocalhost() {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '0.0.0.0';
}

export function trackEvent(path, title) {
    if (!isLocalhost() && window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: '/bassin-minier-unesco/' + path, title: title, event: true });
    }
}

export function trackPageView() {
    if (!isLocalhost() && window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: location.pathname, title: document.title });
    }
}

// --- Text helpers ---

export function joinNotNull(arr) {
    return arr.filter(v => v && v !== 'None').join(', ');
}

export function normalizeText(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function rawHtml(str) {
    return { __html: str };
}

export function renderValue(val) {
    if (val && typeof val === 'object' && val.__html) return val.__html;
    return escapeHtml(val);
}

// --- Cross-link helpers ---

export function crossLink(type, value, displayText, extraAttrs) {
    if (!value || value === 'None') return '';
    const attrs = extraAttrs || '';
    return `<a href="#" class="cross-link" data-link-type="${escapeHtml(type)}" data-link-value="${escapeHtml(value)}"${attrs}>${escapeHtml(displayText || value)}<span class="cross-link-icon"> \u21AA</span></a>`;
}

export function communeLink(name) {
    return crossLink('commune', name, name);
}

export function communeLinks(props) {
    var keys = Array.prototype.slice.call(arguments, 1);
    var links = keys
        .map(function (k) { return props[k]; })
        .filter(function (v) { return v && v !== 'None'; })
        .map(communeLink);
    return links.length ? rawHtml(links.join(', ')) : null;
}

export function epciLink(name) {
    return crossLink('epci', name, name);
}

export function deptLink(name) {
    return crossLink('departement', name, name);
}

export function terrilLinks(vueStr) {
    if (!vueStr || vueStr === 'None') return null;
    var ids = vueStr.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!ids.length) return null;
    var links = ids.map(function (id) {
        return crossLink('terril', id, id);
    });
    return rawHtml(links.join(', '));
}

export function elementLink(elementId) {
    if (!elementId || elementId === 'None') return null;
    return rawHtml(crossLink('element', elementId, elementId));
}

export function featureLink(layerId, featureIndex, displayText) {
    return `<a href="#" class="cross-link" data-link-type="feature" data-link-layer="${escapeHtml(layerId)}" data-link-value="${featureIndex}">${escapeHtml(displayText)}<span class="cross-link-icon"> \u21AA</span></a>`;
}

// --- Toggle state ---

export function setToggleState(btn, active, scope, partial) {
    btn.classList.toggle('active', active && !partial);
    btn.classList.toggle('inactive', !active);
    btn.classList.toggle('partial', !!partial);
    btn.textContent = active ? '\u2212' : '+';
    btn.title = `${active ? 'Masquer' : 'Afficher'} ${scope}`;
}

// --- MH protection rows ---

export function mhRows(p) {
    const rows = [];
    if (p.inscrit_mh && String(p.inscrit_mh).toLowerCase() !== 'false' && String(p.inscrit_mh).toLowerCase() !== 'non')
        rows.push(['Inscrit MH', 'Oui']);
    if (p.classe_mh && String(p.classe_mh).toLowerCase() !== 'false' && String(p.classe_mh).toLowerCase() !== 'non')
        rows.push(['Classe MH', 'Oui']);
    return rows;
}

// --- Hover style ---

export function getHoverStyle(layerId) {
    const base = styles[layerId];
    if (base.radius) {
        return { radius: base.radius + 2, weight: 3, fillOpacity: 0.9 };
    }
    return { weight: (base.weight || 2) + 2, fillOpacity: Math.min((base.fillOpacity || 0.2) + 0.2, 0.8) };
}

// --- Layer lookup helpers ---

export function findLayerByProperty(layerId, matchFn) {
    const def = allLayerDefs.find(d => d.id === layerId);
    if (!def || !def._leafletLayer) return null;
    let found = null;
    def._leafletLayer.eachLayer(lyr => {
        if (!found && matchFn(lyr.feature.properties, lyr)) {
            found = lyr;
        }
    });
    return found;
}

export function findLayerByIndex(layerId, index) {
    const def = allLayerDefs.find(d => d.id === layerId);
    if (!def || !def._leafletLayer) return null;
    let found = null;
    let idx = 0;
    def._leafletLayer.eachLayer(lyr => {
        if (idx === index) found = lyr;
        idx++;
    });
    return found;
}

export function findFeatureIndex(layerId, targetLayer) {
    const def = allLayerDefs.find(d => d.id === layerId);
    if (!def || !def._leafletLayer) return -1;
    let idx = 0;
    let found = -1;
    def._leafletLayer.eachLayer(lyr => {
        if (lyr === targetLayer) found = idx;
        idx++;
    });
    return found;
}

// --- Shared fit bounds ---

export function fitBassinBounds(map) {
    const bassinDef = allLayerDefs.find(d => d.id === 'bassin-minier');
    if (bassinDef && bassinDef._leafletLayer) {
        map.fitBounds(bassinDef._leafletLayer.getBounds(), { paddingTopLeft: [20, 80], paddingBottomRight: [20, 20] });
    } else {
        map.setView([50.35, 2.8], 10);
    }
}

// --- Shared highlight ---

export function highlightFeature(layer, layerId, opts) {
    if (!layer || !layer.setStyle) return;
    const orig = styles[layerId];
    const highlightStyle = opts && opts.style ? opts.style : { weight: 4, fillOpacity: 0.5, color: '#e57373' };
    const duration = opts && opts.duration ? opts.duration : 2500;
    if (opts && opts.bringToFront && layer.bringToFront) layer.bringToFront();
    layer.setStyle(highlightStyle);
    setTimeout(() => layer.setStyle(orig), duration);
}

export function deptNameFromInsee(insee) {
    if (!insee || insee.length < 2) return null;
    const prefix = insee.substring(0, 2);
    const def = allLayerDefs.find(d => d.id === 'departements');
    if (!def || !def._leafletLayer) return null;
    let name = null;
    def._leafletLayer.eachLayer(lyr => {
        if (!name && lyr.feature.properties.code === prefix) {
            name = lyr.feature.properties.nom;
        }
    });
    return name;
}
