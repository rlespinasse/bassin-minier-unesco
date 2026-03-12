import {
    styles, layerPatterns, tooltipText, layerGroups, contextLayers, allLayerDefs,
    layerPanes, borderClickLayers, searchableProps
} from './config.js';

import {
    trackEvent, trackPageView, normalizeText, escapeHtml, findFeatureIndex,
    findLayerByProperty, findLayerByIndex, fitBassinBounds, highlightFeature,
    setToggleState, getHoverStyle
} from './helpers.js';

import { createDetailBuilders } from './detail-builders.js';

import {
    injectPatterns, createSwatch, getLayerGeomType,
    createLayersDrawer, createSearchControl, createBottomBarControl
} from './controls.js';

// --- Mutable state ---

let searchInput = null;
let bassinMask = null;
let hoveredLayer = null;
let hoveredLayerId = null;
let reverseLinks = null;
let selectedFeatureInfo = null;
let loadedCount = 0;
let helpOverlay = null;

const communeIndex = new Map();
const boundsGroup = L.featureGroup();
const searchIndex = [];

const detailBuilders = createDetailBuilders(() => reverseLinks);

// --- Map initialization ---

const map = L.map('map', { zoomControl: false, zoomSnap: 0.5 }).setView([50.35, 2.8], 10);

// Base layers
const ignPlan = L.tileLayer('https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
    attribution: '&copy; <a href="https://www.ign.fr/">IGN</a>',
    maxZoom: 18
});

const cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
});

const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics',
    maxZoom: 18
});

const baseLayers = {
    'IGN': ignPlan,
    'Clair': cartoPositron,
    'Satellite': esriSatellite
};

const baseLayerThumbnails = {
    'IGN': 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX=10&TILEROW=345&TILECOL=520',
    'Clair': 'https://a.basemaps.cartocdn.com/light_all/10/520/345.png',
    'Satellite': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/345/520'
};

cartoPositron.addTo(map);

// Title overlay control
const TitleControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function () {
        const div = L.DomUtil.create('div', 'title-overlay');
        div.innerHTML = '<h1>Bassin Minier du Nord-Pas de Calais</h1>' +
            '<p>Patrimoine mondial de l\'UNESCO \u2014 Paysage culturel \u00e9volutif vivant, inscrit en 2012</p>';
        L.DomEvent.disableClickPropagation(div);
        return div;
    }
});
new TitleControl().addTo(map);

// --- Detail panel ---

const detailPanel = document.getElementById('detail-panel');
const detailContent = document.getElementById('detail-content');
const detailClose = document.getElementById('detail-close');

const detailBackStack = [];
const detailForwardStack = [];
let lastClosedDetail = null;
const detailBack = document.getElementById('detail-back');
const detailForward = document.getElementById('detail-forward');
const detailClearHistory = document.getElementById('detail-clear-history');
const detailSep = detailPanel.querySelector('.panel-actions-sep');

function updateNavButtons() {
    const hasBack = detailBackStack.length > 0;
    const hasForward = detailForwardStack.length > 0;
    const hasNav = hasBack || hasForward;
    detailBack.style.display = hasNav ? '' : 'none';
    detailForward.style.display = hasNav ? '' : 'none';
    detailClearHistory.style.display = hasNav ? '' : 'none';
    detailBack.disabled = !hasBack;
    detailForward.disabled = !hasForward;
    detailSep.style.display = hasNav ? '' : 'none';
}

function showDetail(html) {
    if (window.innerWidth <= 600 && layersDrawer && layersDrawer.isOpen()) {
        layersDrawer.close();
    }
    if (detailPanel.classList.contains('open') && detailContent.innerHTML) {
        detailBackStack.push({
            html: detailContent.innerHTML,
            featureInfo: selectedFeatureInfo ? { ...selectedFeatureInfo } : null
        });
        detailForwardStack.length = 0;
    }
    detailContent.innerHTML = html;
    detailPanel.classList.add('open');
    updateNavButtons();
    map.invalidateSize();
}

function hideDetail() {
    if (detailPanel.classList.contains('open') && detailContent.innerHTML) {
        lastClosedDetail = {
            html: detailContent.innerHTML,
            featureInfo: selectedFeatureInfo ? { ...selectedFeatureInfo } : null
        };
    }
    detailPanel.classList.remove('open');
    selectedFeatureInfo = null;
    detailBackStack.length = 0;
    detailForwardStack.length = 0;
    updateNavButtons();
    map.invalidateSize();
    if (loadedCount >= allLayerDefs.length) updateHash();
}

function reopenLastDetail() {
    if (!lastClosedDetail) return;
    selectedFeatureInfo = lastClosedDetail.featureInfo;
    showDetail(lastClosedDetail.html);
    if (loadedCount >= allLayerDefs.length) updateHash();
}

detailBack.addEventListener('click', () => {
    if (!detailBackStack.length) return;
    trackEvent('event/panel/back', 'Detail panel back');
    detailForwardStack.push({
        html: detailContent.innerHTML,
        featureInfo: selectedFeatureInfo ? { ...selectedFeatureInfo } : null
    });
    const prev = detailBackStack.pop();
    selectedFeatureInfo = prev.featureInfo;
    detailContent.innerHTML = prev.html;
    updateNavButtons();
    if (loadedCount >= allLayerDefs.length) updateHash();
});

detailForward.addEventListener('click', () => {
    if (!detailForwardStack.length) return;
    trackEvent('event/panel/forward', 'Detail panel forward');
    detailBackStack.push({
        html: detailContent.innerHTML,
        featureInfo: selectedFeatureInfo ? { ...selectedFeatureInfo } : null
    });
    const next = detailForwardStack.pop();
    selectedFeatureInfo = next.featureInfo;
    detailContent.innerHTML = next.html;
    updateNavButtons();
    if (loadedCount >= allLayerDefs.length) updateHash();
});

detailClearHistory.addEventListener('click', () => {
    trackEvent('event/panel/clear-history', 'Detail panel clear history');
    detailBackStack.length = 0;
    detailForwardStack.length = 0;
    updateNavButtons();
});

detailClose.addEventListener('click', () => {
    trackEvent('event/panel/close', 'Detail panel close');
    hideDetail();
});

// --- Cross-link click handler ---

detailContent.addEventListener('click', e => {
    const link = e.target.closest('.cross-link');
    if (!link) return;
    e.preventDefault();
    const type = link.dataset.linkType;
    const value = link.dataset.linkValue;

    if (type === 'commune') {
        const layer = communeIndex.get(normalizeText(value));
        if (!layer) return;
        ensureLayerVisible('communes-mbm');
        if (layer.getBounds) {
            map.fitBounds(layer.getBounds(), { padding: [50, 50], maxZoom: 15 });
        }
        const builder = detailBuilders['communes-mbm'];
        if (builder) {
            selectedFeatureInfo = { layerId: 'communes-mbm', featureIndex: findFeatureIndex('communes-mbm', layer) };
            showDetail(builder(layer.feature.properties));
            updateHash();
        }
        highlightFeature(layer, 'communes-mbm', { style: { weight: 4, fillOpacity: 0.5, color: '#e57373' } });
    } else if (type === 'epci') {
        const found = findLayerByProperty('epci', p => p.nom && normalizeText(p.nom) === normalizeText(value));
        if (!found) return;
        ensureLayerVisible('epci');
        if (found.getBounds) {
            map.fitBounds(found.getBounds(), { padding: [50, 50], maxZoom: 13 });
        }
        const epciBuilder = detailBuilders['epci'];
        if (epciBuilder) {
            selectedFeatureInfo = { layerId: 'epci', featureIndex: findFeatureIndex('epci', found) };
            showDetail(epciBuilder(found.feature.properties));
            updateHash();
        }
        highlightFeature(found, 'epci', { style: { weight: 4, fillOpacity: 0.2, color: '#7E57C2' } });
    } else if (type === 'departement') {
        const found = findLayerByProperty('departements', p => p.nom && normalizeText(p.nom) === normalizeText(value));
        if (!found) return;
        ensureLayerVisible('departements');
        if (found.getBounds) {
            map.fitBounds(found.getBounds(), { padding: [50, 50], maxZoom: 11 });
        }
        const deptBuilder = detailBuilders['departements'];
        if (deptBuilder) {
            selectedFeatureInfo = { layerId: 'departements', featureIndex: findFeatureIndex('departements', found) };
            showDetail(deptBuilder(found.feature.properties));
            updateHash();
        }
        highlightFeature(found, 'departements', { style: { weight: 4, fillOpacity: 0.1, color: '#FF8F00' } });
    } else if (type === 'terril') {
        let found = null;
        let foundLayerId = null;
        for (const lid of ['terrils', 'zt-terrils']) {
            found = findLayerByProperty(lid, p => String(p.no_terril) === value || String(p.id) === value);
            if (found) { foundLayerId = lid; break; }
        }
        if (!found) return;
        ensureLayerVisible(foundLayerId);
        if (found.getBounds) {
            map.fitBounds(found.getBounds(), { padding: [50, 50], maxZoom: 16 });
        } else if (found.getLatLng) {
            map.setView(found.getLatLng(), 16);
        }
        const builder = detailBuilders[foundLayerId];
        if (builder) {
            selectedFeatureInfo = { layerId: foundLayerId, featureIndex: findFeatureIndex(foundLayerId, found) };
            showDetail(builder(found.feature.properties));
            updateHash();
        }
    } else if (type === 'element') {
        const elementLayers = ['batis', 'cites-minieres', 'cavaliers', 'espace-neonaturel', 'terrils'];
        const matches = [];
        for (const lid of elementLayers) {
            const def = allLayerDefs.find(d => d.id === lid);
            if (!def || !def._leafletLayer) continue;
            def._leafletLayer.eachLayer(lyr => {
                if (String(lyr.feature.properties.element) === value) {
                    matches.push({ layer: lyr, layerId: lid });
                }
            });
        }
        if (!matches.length) return;
        const bounds = L.latLngBounds();
        for (const m of matches) {
            ensureLayerVisible(m.layerId);
            if (m.layer.getBounds) {
                bounds.extend(m.layer.getBounds());
            } else if (m.layer.getLatLng) {
                bounds.extend(m.layer.getLatLng());
            }
        }
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
        const first = matches[0];
        const elBuilder = detailBuilders[first.layerId];
        if (elBuilder) {
            selectedFeatureInfo = { layerId: first.layerId, featureIndex: findFeatureIndex(first.layerId, first.layer) };
            showDetail(elBuilder(first.layer.feature.properties));
            updateHash();
        }
        for (const m of matches) {
            highlightFeature(m.layer, m.layerId, {
                style: { weight: 5, fillOpacity: 0.7, color: '#d32f2f', opacity: 1 },
                duration: 4000,
                bringToFront: true
            });
        }
    } else if (type === 'feature') {
        const targetLayerId = link.dataset.linkLayer;
        const targetIndex = parseInt(link.dataset.linkValue, 10);
        const found = findLayerByIndex(targetLayerId, targetIndex);
        if (!found) return;
        ensureLayerVisible(targetLayerId);
        if (found.getBounds) {
            map.fitBounds(found.getBounds(), { padding: [50, 50], maxZoom: 16 });
        } else if (found.getLatLng) {
            map.setView(found.getLatLng(), 16);
        }
        const builder = detailBuilders[targetLayerId];
        if (builder) {
            selectedFeatureInfo = { layerId: targetLayerId, featureIndex: targetIndex };
            showDetail(builder(found.feature.properties));
            updateHash();
        }
        highlightFeature(found, targetLayerId, {
            style: { weight: 4, fillOpacity: 0.5, color: '#e57373' },
            bringToFront: true
        });
    }
});

// --- Help overlay ---

function toggleHelpOverlay() {
    if (!helpOverlay) return;
    helpOverlay.classList.toggle('open');
}

// --- Keyboard shortcuts ---

document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    const key = e.key.toLowerCase();

    if (e.key === 'Escape') {
        if (helpOverlay && helpOverlay.classList.contains('open')) {
            helpOverlay.classList.remove('open');
        } else if (layersDrawer && layersDrawer.isOpen()) {
            layersDrawer.close();
        } else {
            hideDetail();
        }
    } else if (e.key === '+') {
        trackEvent('event/shortcut/zoom-in', 'Shortcut zoom in');
    } else if (e.key === '-') {
        trackEvent('event/shortcut/zoom-out', 'Shortcut zoom out');
    } else if (key === 'e') {
        trackEvent('event/shortcut/full-extent', 'Shortcut full extent');
        hideDetail();
        fitBassinBounds(map);
    } else if (key === 'r') {
        trackEvent('event/shortcut/reset', 'Shortcut reset view');
        resetToDefaults();
    } else if (key === 'f') {
        e.preventDefault();
        trackEvent('event/shortcut/search', 'Shortcut open search');
        if (searchInput) {
            searchInput.classList.add('expanded');
            searchInput.focus();
        }
    } else if (key === 'c') {
        trackEvent('event/shortcut/layers', 'Shortcut layers drawer');
        layersDrawer.toggle();
    } else if (key === 'p') {
        trackEvent('event/shortcut/toggle-panel', 'Shortcut toggle panel');
        if (detailPanel.classList.contains('open')) {
            hideDetail();
        } else {
            reopenLastDetail();
        }
    } else if (key === 'h') {
        trackEvent('event/shortcut/panel-back', 'Shortcut panel back');
        detailBack.click();
    } else if (key === 'j') {
        trackEvent('event/shortcut/panel-forward', 'Shortcut panel forward');
        detailForward.click();
    } else if (e.key === '?') {
        trackEvent('event/shortcut/help', 'Shortcut help overlay');
        toggleHelpOverlay();
    }
});

map.on('click', () => {
    hideDetail();
    if (layersDrawer && layersDrawer.isOpen()) {
        layersDrawer.close();
    }
});

// --- Layer visibility helpers ---

function ensureLayerVisible(layerId) {
    const def = allLayerDefs.find(d => d.id === layerId);
    if (!def || !def._leafletLayer) return;
    if (!map.hasLayer(def._leafletLayer)) {
        def._leafletLayer.addTo(map);
        if (def._clickLayer) def._clickLayer.addTo(map);
        if (layerId === 'bassin-minier' && bassinMask) bassinMask.addTo(map);
        layersDrawer.syncLayerState(layerId, true);
    }
}

function setLayerVisibility(def, active) {
    if (!def._leafletLayer) return;
    const isActive = map.hasLayer(def._leafletLayer);
    if (active && !isActive) {
        def._leafletLayer.addTo(map);
        if (def._clickLayer) def._clickLayer.addTo(map);
        if (def.id === 'bassin-minier' && bassinMask) bassinMask.addTo(map);
    } else if (!active && isActive) {
        map.removeLayer(def._leafletLayer);
        if (def._clickLayer) map.removeLayer(def._clickLayer);
        if (def.id === 'bassin-minier' && bassinMask) map.removeLayer(bassinMask);
    }
    layersDrawer.syncLayerState(def.id, active);
}

function syncBaseLayerCards(targetName) {
    const cards = document.querySelectorAll('.drawer-base-card');
    cards.forEach(c => {
        const label = c.querySelector('.drawer-base-card-label');
        const isMatch = label && label.textContent === targetName;
        c.classList.toggle('active', isMatch);
        c.setAttribute('aria-pressed', isMatch);
    });
}

// --- Initialize controls ---

const layersDrawer = createLayersDrawer(layerGroups, contextLayers, baseLayers, baseLayerThumbnails, {
    map,
    bassinMaskRef: () => bassinMask,
    hideDetail,
    updateHash,
    allLayerDefs
});
layersDrawer.addTo(map);

const SearchControl = createSearchControl({
    map, styles, searchIndex, allLayerDefs, detailBuilders,
    ensureLayerVisible, showDetail, updateHash, findFeatureIndex,
    setSelectedFeatureInfo: info => { selectedFeatureInfo = info; },
    searchInputRef: input => { searchInput = input; }
});

const BottomBarControl = createBottomBarControl({
    map, layersDrawer, toggleHelpOverlay, hideDetail, resetToDefaults, fitBassinBounds,
    SearchControl
});

new BottomBarControl().addTo(map);

// --- Keyboard help overlay ---

(function createHelpOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'help-overlay';
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
    });

    const card = document.createElement('div');
    card.className = 'help-card';

    const title = document.createElement('h2');
    title.textContent = 'Raccourcis clavier';
    card.appendChild(title);

    const shortcuts = [
        ['?', 'Aide raccourcis clavier'],
        ['F', 'Rechercher'],
        ['E', 'Vue d\u2019ensemble'],
        ['R', 'R\u00e9initialiser la vue'],
        ['C', 'Couches (ouvrir/fermer)'],
        ['P', 'Panneau (ouvrir/fermer)'],
        ['H', 'Panneau : pr\u00e9c\u00e9dent'],
        ['J', 'Panneau : suivant'],
        ['+', 'Zoom avant'],
        ['\u2212', 'Zoom arri\u00e8re'],
        ['Echap', 'Fermer']
    ];

    const table = document.createElement('table');
    shortcuts.forEach(([key, desc]) => {
        const tr = document.createElement('tr');
        const tdKey = document.createElement('td');
        const kbd = document.createElement('kbd');
        kbd.textContent = key;
        tdKey.appendChild(kbd);
        const tdDesc = document.createElement('td');
        tdDesc.textContent = desc;
        tr.appendChild(tdKey);
        tr.appendChild(tdDesc);
        table.appendChild(tr);
    });
    card.appendChild(table);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'help-close-btn';
    closeBtn.type = 'button';
    closeBtn.innerHTML = '&times;';
    closeBtn.title = 'Fermer';
    closeBtn.setAttribute('aria-label', 'Fermer l\u2019aide');
    closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
    card.appendChild(closeBtn);

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    helpOverlay = overlay;
})();

// --- Map panes ---

const bassinPane = map.createPane('bassinPane');
bassinPane.style.zIndex = 350;

const maskPane = map.createPane('maskPane');
maskPane.style.zIndex = 360;
maskPane.style.pointerEvents = 'none';

const largeFeaturesPane = map.createPane('largeFeaturesPane');
largeFeaturesPane.style.zIndex = 370;

const deptBorderPane = map.createPane('deptBorderPane');
deptBorderPane.style.zIndex = 373;
const epciBorderPane = map.createPane('epciBorderPane');
epciBorderPane.style.zIndex = 375;
const communeBorderPane = map.createPane('communeBorderPane');
communeBorderPane.style.zIndex = 377;

const mediumFeaturesPane = map.createPane('mediumFeaturesPane');
mediumFeaturesPane.style.zIndex = 380;

const smallFeaturesPane = map.createPane('smallFeaturesPane');
smallFeaturesPane.style.zIndex = 390;

// --- Mask layer ---

function createMaskLayer(coordinates) {
    const world = [
        [-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]
    ];
    const holeLatLng = coordinates[0].map(c => [c[1], c[0]]);
    return L.polygon([world, holeLatLng], {
        color: 'none',
        fillColor: '#000',
        fillOpacity: 0.3,
        stroke: false,
        interactive: false,
        pane: 'maskPane'
    });
}

// --- URL hash state ---

function getDefaultLayerIds() {
    return allLayerDefs.filter(d => d.active !== false).map(d => d.id);
}

function getActiveLayerIds() {
    return allLayerDefs
        .filter(d => d._leafletLayer && map.hasLayer(d._leafletLayer))
        .map(d => d.id);
}

function getActiveBaseLayerName() {
    for (const name of Object.keys(baseLayers)) {
        if (map.hasLayer(baseLayers[name])) return name;
    }
    return 'Clair';
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function updateHash() {
    const params = new URLSearchParams();

    const activeLayers = getActiveLayerIds();
    const defaultLayers = getDefaultLayerIds();
    if (!arraysEqual(activeLayers.slice().sort(), defaultLayers.slice().sort())) {
        params.set('layers', activeLayers.join(','));
    }

    const base = getActiveBaseLayerName();
    if (base !== 'Clair') {
        params.set('base', base);
    }

    const center = map.getCenter();
    const zoom = map.getZoom();
    params.set('lat', center.lat.toFixed(5));
    params.set('lng', center.lng.toFixed(5));
    params.set('z', zoom);

    if (selectedFeatureInfo) {
        params.set('sel', selectedFeatureInfo.layerId + ',' + selectedFeatureInfo.featureIndex);
    }

    const hash = params.toString();
    history.replaceState(null, '', '#' + hash);
}

function parseHash() {
    const hash = location.hash.replace(/^#/, '');
    if (!hash) return null;
    const params = new URLSearchParams(hash);
    const state = {};

    if (params.has('layers')) {
        state.layers = params.get('layers').split(',').filter(Boolean);
    }
    if (params.has('base')) {
        state.base = params.get('base');
    }
    if (params.has('lat') && params.has('lng') && params.has('z')) {
        state.lat = parseFloat(params.get('lat'));
        state.lng = parseFloat(params.get('lng'));
        state.zoom = parseInt(params.get('z'), 10);
    }
    if (params.has('sel')) {
        const parts = params.get('sel').split(',');
        if (parts.length >= 2) {
            state.sel = { layerId: parts[0], featureIndex: parseInt(parts[1], 10) };
        }
    }
    return state;
}

function resetToDefaults() {
    hideDetail();

    if (layersDrawer && layersDrawer.isOpen()) layersDrawer.close();

    for (const def of allLayerDefs) {
        const shouldBeActive = def.active !== false;
        setLayerVisibility(def, shouldBeActive);
    }

    for (const name of Object.keys(baseLayers)) {
        map.removeLayer(baseLayers[name]);
    }
    baseLayers['Clair'].addTo(map);
    syncBaseLayerCards('Clair');

    fitBassinBounds(map);

    history.replaceState(null, '', location.pathname + location.search);
}

const initialHashState = parseHash();

const loadingOverlay = document.getElementById('loading-overlay');

// --- Search index ---

function buildSearchIndex() {
    for (const def of allLayerDefs) {
        if (!def._leafletLayer) continue;
        const config = searchableProps[def.id];
        if (!config) continue;
        def._leafletLayer.eachLayer(layer => {
            const props = layer.feature.properties;
            const title = config.title(props) || '';
            if (!title) return;
            const searchText = config.text
                .map(key => props[key] ? String(props[key]) : '')
                .join(' ')
                .toLowerCase();
            searchIndex.push({
                title,
                meta: config.meta(props),
                searchText,
                layer,
                layerId: def.id,
                def
            });
        });
    }
}

// --- Data loading ---

function onLayerLoaded() {
    loadedCount++;
    if (loadedCount < allLayerDefs.length) return;

    for (const d of allLayerDefs) {
        if (d._featureCount !== undefined) {
            layersDrawer.updateCount(d.id, d._featureCount);
        }
    }
    buildSearchIndex();

    const communeDef = allLayerDefs.find(d => d.id === 'communes-mbm');
    if (communeDef && communeDef._leafletLayer) {
        communeDef._leafletLayer.eachLayer(layer => {
            const name = layer.feature.properties.nom;
            if (name) communeIndex.set(normalizeText(name), layer);
        });
    }

    injectPatterns();

    if (initialHashState) {
        if (initialHashState.layers) {
            for (const def of allLayerDefs) {
                const shouldBeActive = initialHashState.layers.includes(def.id);
                setLayerVisibility(def, shouldBeActive);
            }
        }

        if (initialHashState.base && baseLayers[initialHashState.base]) {
            for (const name of Object.keys(baseLayers)) {
                map.removeLayer(baseLayers[name]);
            }
            baseLayers[initialHashState.base].addTo(map);
            syncBaseLayerCards(initialHashState.base);
        }

        if (initialHashState.lat !== undefined) {
            map.setView([initialHashState.lat, initialHashState.lng], initialHashState.zoom);
        } else {
            fitBassinBounds(map);
        }

        if (initialHashState.sel) {
            const { layerId, featureIndex } = initialHashState.sel;
            ensureLayerVisible(layerId);
            const found = findLayerByIndex(layerId, featureIndex);
            if (found) {
                const builder = detailBuilders[layerId];
                if (builder) {
                    selectedFeatureInfo = { layerId, featureIndex };
                    showDetail(builder(found.feature.properties));
                }
            }
        }
    } else {
        fitBassinBounds(map);
    }

    trackPageView();

    map.on('moveend', updateHash);

    if (loadingOverlay) {
        loadingOverlay.classList.add('fade-out');
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            map.invalidateSize();
        }, 400);
    }
}

fetch('data/reverse-links.json')
    .then(r => r.ok ? r.json() : null)
    .then(data => { reverseLinks = data; })
    .catch(() => { /* reverse links unavailable */ });

for (const def of allLayerDefs) {
    fetch(def.file)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(geojson => {
            const paneOpt = layerPanes[def.id] ? { pane: layerPanes[def.id] } : {};
            const hasBorderClick = !!borderClickLayers[def.id];
            const layerOpts = {
                ...(hasBorderClick ? { interactive: false } : {}),
                style: () => ({
                    ...styles[def.id],
                    ...paneOpt,
                    ...(layerPatterns[def.id] ? { className: `layer-${def.id}` } : {})
                }),
                onEachFeature: (feature, layer) => {

                    if (!hasBorderClick) {
                        const builder = detailBuilders[def.id];
                        if (builder) {
                            layer.on('click', e => {
                                L.DomEvent.stopPropagation(e);
                                const idx = geojson.features.indexOf(feature);
                                trackEvent('event/feature', 'Feature click');
                                selectedFeatureInfo = { layerId: def.id, featureIndex: idx };
                                showDetail(builder(feature.properties));
                                updateHash();
                            });
                        }
                    }

                    if (!hasBorderClick) {
                        const ttFn = tooltipText[def.id];
                        if (ttFn) {
                            const text = ttFn(feature.properties);
                            if (text) {
                                layer.bindTooltip(text, {
                                    className: 'feature-tooltip',
                                    sticky: true,
                                    direction: 'top',
                                    offset: [0, -10]
                                });
                            }
                        }
                    }

                    if (!hasBorderClick) {
                        layer.on('mouseover', () => {
                            if (hoveredLayer && hoveredLayer !== layer && hoveredLayer.setStyle) {
                                hoveredLayer.setStyle(styles[hoveredLayerId || def.id]);
                            }
                            hoveredLayer = layer;
                            hoveredLayerId = def.id;
                            if (layer.setStyle) {
                                layer.setStyle(getHoverStyle(def.id));
                            }
                            if (layer.bringToFront && def.id !== 'bassin-minier' && def.id !== 'communes-mbm' && def.id !== 'epci' && def.id !== 'departements') {
                                layer.bringToFront();
                            }
                        });
                        layer.on('mouseout', () => {
                            if (layer.setStyle) {
                                layer.setStyle(styles[def.id]);
                            }
                            hoveredLayer = null;
                            hoveredLayerId = null;
                        });
                    }
                }
            };
            if (styles[def.id] && styles[def.id].radius) {
                layerOpts.pointToLayer = (_feature, latlng) => L.circleMarker(latlng, { ...styles[def.id], ...paneOpt });
            }
            const layer = L.geoJSON(geojson, layerOpts);
            def._leafletLayer = layer;

            const featureCount = geojson.features ? geojson.features.length : 0;
            def._featureCount = featureCount;

            if (borderClickLayers[def.id]) {
                const clickPane = borderClickLayers[def.id];
                const clickLayer = L.geoJSON(geojson, {
                    style: () => ({
                        weight: 12,
                        color: 'transparent',
                        fill: false,
                        pane: clickPane
                    }),
                    onEachFeature: (feature, lyr) => {
                        const builder = detailBuilders[def.id];
                        if (builder) {
                            lyr.on('click', e => {
                                L.DomEvent.stopPropagation(e);
                                const idx = geojson.features.indexOf(feature);
                                trackEvent('event/feature', 'Feature click');
                                selectedFeatureInfo = { layerId: def.id, featureIndex: idx };
                                showDetail(builder(feature.properties));
                                updateHash();
                            });
                        }
                        const ttFn = tooltipText[def.id];
                        if (ttFn) {
                            const text = ttFn(feature.properties);
                            if (text) lyr.bindTooltip(text, {
                                className: 'feature-tooltip',
                                sticky: true, direction: 'top', offset: [0, -10]
                            });
                        }
                        lyr.on('mouseover', () => {
                            const idx = geojson.features.indexOf(feature);
                            const visualFeature = def._leafletLayer.getLayers()[idx];
                            if (hoveredLayer && hoveredLayer !== visualFeature && hoveredLayer.setStyle) {
                                hoveredLayer.setStyle(styles[hoveredLayerId || def.id]);
                            }
                            hoveredLayer = visualFeature;
                            hoveredLayerId = def.id;
                            if (visualFeature && visualFeature.setStyle) {
                                visualFeature.setStyle(getHoverStyle(def.id));
                            }
                        });
                        lyr.on('mouseout', () => {
                            const idx = geojson.features.indexOf(feature);
                            const visualFeature = def._leafletLayer.getLayers()[idx];
                            if (visualFeature && visualFeature.setStyle) {
                                visualFeature.setStyle(styles[def.id]);
                            }
                            hoveredLayer = null;
                            hoveredLayerId = null;
                        });
                    }
                });
                def._clickLayer = clickLayer;
            }

            if (def.id === 'bassin-minier' && geojson.features && geojson.features[0]) {
                bassinMask = createMaskLayer(geojson.features[0].geometry.coordinates);
                if (def.active !== false) {
                    bassinMask.addTo(map);
                }
            }

            if (def.active !== false) {
                layer.addTo(map);
                if (def._clickLayer) def._clickLayer.addTo(map);
            }
            boundsGroup.addLayer(layer);

            onLayerLoaded();
        })
        .catch(err => {
            console.warn(`Failed to load ${def.file}:`, err);
            onLayerLoaded();
        });
}

map.on('layeradd', () => injectPatterns());

// --- Drag/resize handles ---

const dragHandle = document.createElement('div');
dragHandle.className = 'drag-handle';
detailPanel.insertBefore(dragHandle, detailPanel.firstChild);

const resizeHandle = document.createElement('div');
resizeHandle.className = 'resize-handle';
detailPanel.appendChild(resizeHandle);

const MIN_PANEL_WIDTH = 340;
const MAX_PANEL_WIDTH = 700;

resizeHandle.addEventListener('mousedown', (e) => {
    if (window.innerWidth <= 600) return;
    e.preventDefault();
    detailPanel.classList.add('resizing');
    const startX = e.clientX;
    const startWidth = detailPanel.offsetWidth;

    function onMouseMove(e) {
        const delta = startX - e.clientX;
        const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, startWidth + delta));
        detailPanel.style.width = newWidth + 'px';
        map.invalidateSize();
    }

    function onMouseUp() {
        detailPanel.classList.remove('resizing');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});
