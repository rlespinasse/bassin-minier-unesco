(function () {
    'use strict';

    // --- Helpers ---

    function joinNotNull(arr) {
        return arr.filter(v => v && v !== 'None').join(', ');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function rawHtml(str) {
        return { __html: str };
    }

    function renderValue(val) {
        if (val && typeof val === 'object' && val.__html) return val.__html;
        return escapeHtml(val);
    }

    // --- Cross-link helpers ---

    function communeLink(name) {
        if (!name || name === 'None') return '';
        return `<a href="#" class="cross-link" data-link-type="commune" data-link-value="${escapeHtml(name)}">${escapeHtml(name)}<span class="cross-link-icon"> \u21AA</span></a>`;
    }

    function communeLinks(props) {
        var keys = Array.prototype.slice.call(arguments, 1);
        var links = keys
            .map(function (k) { return props[k]; })
            .filter(function (v) { return v && v !== 'None'; })
            .map(communeLink);
        return links.length ? rawHtml(links.join(', ')) : null;
    }

    function terrilLinks(vueStr) {
        if (!vueStr || vueStr === 'None') return null;
        var ids = vueStr.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        if (!ids.length) return null;
        var links = ids.map(function (id) {
            return `<a href="#" class="cross-link" data-link-type="terril" data-link-value="${escapeHtml(id)}">${escapeHtml(id)}<span class="cross-link-icon"> \u21AA</span></a>`;
        });
        return rawHtml(links.join(', '));
    }

    function elementLink(elementId) {
        if (!elementId || elementId === 'None') return null;
        return rawHtml(`<a href="#" class="cross-link" data-link-type="element" data-link-value="${escapeHtml(elementId)}">${escapeHtml(elementId)}<span class="cross-link-icon"> \u21AA</span></a>`);
    }

    /**
     * Set a toggle button's visual state.
     * @param {HTMLElement} btn - The button element
     * @param {boolean} active - Whether the toggle should appear active
     * @param {string} scope - Label for the title (e.g. 'la couche', 'le groupe')
     */
    function setToggleState(btn, active, scope) {
        btn.classList.toggle('active', active);
        btn.classList.toggle('inactive', !active);
        btn.textContent = active ? '\u2212' : '+';
        btn.title = `${active ? 'Masquer' : 'Afficher'} ${scope}`;
    }

    // --- Map initialization ---

    const map = L.map('map', { zoomControl: false }).setView([50.35, 2.8], 10);

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
                '<p>Patrimoine mondial de l\'UNESCO — Paysage culturel évolutif vivant, inscrit en 2012</p>';
            L.DomEvent.disableClickPropagation(div);
            return div;
        }
    });
    new TitleControl().addTo(map);


    // --- Layer styles ---

    const styles = {
        'bassin-minier': {
            color: '#FF6F00',
            weight: 2,
            dashArray: '8 6',
            fillColor: '#FF6F00',
            fillOpacity: 0.05,
            opacity: 0.7,
            pane: 'bassinPane'
        },
        'zone-tampon': {
            color: '#FFD700',
            weight: 2,
            dashArray: '6 4',
            fillColor: '#FFD700',
            fillOpacity: 0.1,
            opacity: 0.8
        },
        'bien-inscrit': {
            color: '#1E90FF',
            weight: 2,
            fillColor: '#1E90FF',
            fillOpacity: 0.2,
            opacity: 0.8
        },
        'cites-minieres': {
            color: '#E74C3C',
            weight: 2,
            fillColor: '#E74C3C',
            fillOpacity: 0.35,
            opacity: 0.9
        },
        'batis': {
            color: '#8B4513',
            weight: 2,
            fillColor: '#8B4513',
            fillOpacity: 0.4,
            opacity: 0.9
        },
        'cavaliers': {
            color: '#2ECC71',
            weight: 3,
            fillColor: '#2ECC71',
            fillOpacity: 0.4,
            opacity: 0.9
        },
        'espace-neonaturel': {
            color: '#27AE60',
            weight: 2,
            fillColor: '#27AE60',
            fillOpacity: 0.35,
            opacity: 0.9
        },
        'terrils': {
            color: '#95A5A6',
            weight: 2,
            fillColor: '#95A5A6',
            fillOpacity: 0.4,
            opacity: 0.9
        },
        'puits-de-mines': {
            radius: 3,
            color: '#9575CD',
            weight: 1,
            fillColor: '#B39DDB',
            fillOpacity: 0.5,
            opacity: 0.7
        },
        'communes-mbm': {
            color: '#B0BEC5',
            weight: 1,
            dashArray: '4 3',
            fillColor: '#B0BEC5',
            fillOpacity: 0.05,
            opacity: 0.6
        },
        'zt-cavaliers': {
            color: '#66BB6A',
            weight: 1.5,
            dashArray: '5 4',
            fillColor: '#66BB6A',
            fillOpacity: 0.2,
            opacity: 0.6
        },
        'zt-cites-minieres': {
            color: '#EF9A9A',
            weight: 1.5,
            dashArray: '5 4',
            fillColor: '#EF9A9A',
            fillOpacity: 0.2,
            opacity: 0.6
        },
        'zt-espaces-neonaturels': {
            color: '#81C784',
            weight: 1.5,
            dashArray: '5 4',
            fillColor: '#81C784',
            fillOpacity: 0.2,
            opacity: 0.6
        },
        'zt-terrils': {
            color: '#BDBDBD',
            weight: 1.5,
            dashArray: '5 4',
            fillColor: '#BDBDBD',
            fillOpacity: 0.2,
            opacity: 0.6
        },
        'zt-parvis-agricoles': {
            color: '#AED581',
            weight: 1.5,
            dashArray: '5 4',
            fillColor: '#AED581',
            fillOpacity: 0.2,
            opacity: 0.6
        },
    };

    // Pattern texture definitions per layer (excluded: bassin-minier, communes-mbm, puits-de-mines)
    const layerPatterns = {
        'batis':                  { type: 'crosshatch', size: 8,  strokeWidth: 1.5 },
        'cavaliers':              { type: 'diagonal',   size: 8,  strokeWidth: 2 },
        'cites-minieres':         { type: 'dots',       size: 8,  radius: 1.5 },
        'espace-neonaturel':      { type: 'circles',    size: 12, radius: 4, strokeWidth: 1 },
        'terrils':                { type: 'stipple',    size: 10, radius: 1 },
        'bien-inscrit':           { type: 'horizontal', size: 6,  strokeWidth: 1.5 },
        'zone-tampon':            { type: 'diagonal',   size: 10, strokeWidth: 1 },
        'zt-cavaliers':           { type: 'diagonal',   size: 10, strokeWidth: 1 },
        'zt-cites-minieres':      { type: 'dots',       size: 10, radius: 1 },
        'zt-espaces-neonaturels': { type: 'circles',    size: 14, radius: 4, strokeWidth: 0.8 },
        'zt-terrils':             { type: 'stipple',    size: 12, radius: 0.8 },
        'zt-parvis-agricoles':    { type: 'diagonal',   size: 12, strokeWidth: 1 },
    };

    function buildPatternContent(parent, cfg, color) {
        const NS = 'http://www.w3.org/2000/svg';
        switch (cfg.type) {
            case 'diagonal': {
                const line = document.createElementNS(NS, 'line');
                line.setAttribute('x1', 0);
                line.setAttribute('y1', cfg.size);
                line.setAttribute('x2', cfg.size);
                line.setAttribute('y2', 0);
                line.setAttribute('stroke', color);
                line.setAttribute('stroke-width', cfg.strokeWidth);
                parent.appendChild(line);
                break;
            }
            case 'crosshatch': {
                const l1 = document.createElementNS(NS, 'line');
                l1.setAttribute('x1', 0); l1.setAttribute('y1', cfg.size);
                l1.setAttribute('x2', cfg.size); l1.setAttribute('y2', 0);
                l1.setAttribute('stroke', color); l1.setAttribute('stroke-width', cfg.strokeWidth);
                const l2 = document.createElementNS(NS, 'line');
                l2.setAttribute('x1', 0); l2.setAttribute('y1', 0);
                l2.setAttribute('x2', cfg.size); l2.setAttribute('y2', cfg.size);
                l2.setAttribute('stroke', color); l2.setAttribute('stroke-width', cfg.strokeWidth);
                parent.appendChild(l1);
                parent.appendChild(l2);
                break;
            }
            case 'dots': {
                const c = document.createElementNS(NS, 'circle');
                c.setAttribute('cx', cfg.size / 2);
                c.setAttribute('cy', cfg.size / 2);
                c.setAttribute('r', cfg.radius);
                c.setAttribute('fill', color);
                parent.appendChild(c);
                break;
            }
            case 'stipple': {
                const c1 = document.createElementNS(NS, 'circle');
                c1.setAttribute('cx', cfg.size * 0.25);
                c1.setAttribute('cy', cfg.size * 0.25);
                c1.setAttribute('r', cfg.radius);
                c1.setAttribute('fill', color);
                const c2 = document.createElementNS(NS, 'circle');
                c2.setAttribute('cx', cfg.size * 0.75);
                c2.setAttribute('cy', cfg.size * 0.7);
                c2.setAttribute('r', cfg.radius);
                c2.setAttribute('fill', color);
                parent.appendChild(c1);
                parent.appendChild(c2);
                break;
            }
            case 'circles': {
                const c = document.createElementNS(NS, 'circle');
                c.setAttribute('cx', cfg.size / 2);
                c.setAttribute('cy', cfg.size / 2);
                c.setAttribute('r', cfg.radius);
                c.setAttribute('fill', 'none');
                c.setAttribute('stroke', color);
                c.setAttribute('stroke-width', cfg.strokeWidth);
                parent.appendChild(c);
                break;
            }
            case 'horizontal': {
                const line = document.createElementNS(NS, 'line');
                line.setAttribute('x1', 0);
                line.setAttribute('y1', cfg.size / 2);
                line.setAttribute('x2', cfg.size);
                line.setAttribute('y2', cfg.size / 2);
                line.setAttribute('stroke', color);
                line.setAttribute('stroke-width', cfg.strokeWidth);
                parent.appendChild(line);
                break;
            }
        }
    }

    function createPatternDefs() {
        const NS = 'http://www.w3.org/2000/svg';
        const defs = document.createElementNS(NS, 'defs');
        defs.setAttribute('data-map-patterns', 'true');

        for (const [layerId, cfg] of Object.entries(layerPatterns)) {
            const style = styles[layerId];
            if (!style) continue;
            const color = style.fillColor || style.color;
            const pat = document.createElementNS(NS, 'pattern');
            pat.setAttribute('id', `pattern-${layerId}`);
            pat.setAttribute('patternUnits', 'userSpaceOnUse');
            pat.setAttribute('width', cfg.size);
            pat.setAttribute('height', cfg.size);
            buildPatternContent(pat, cfg, color);
            defs.appendChild(pat);
        }
        return defs;
    }

    function injectPatterns() {
        const svgs = document.querySelectorAll('.leaflet-overlay-pane svg, .leaflet-pane svg');
        svgs.forEach(svg => {
            const existing = svg.querySelector('defs[data-map-patterns]');
            if (existing) return;
            svg.insertBefore(createPatternDefs(), svg.firstChild);
        });
    }

    // Hover highlight styles per layer
    function getHoverStyle(layerId) {
        const base = styles[layerId];
        if (base.radius) {
            return { radius: base.radius + 2, weight: 3, fillOpacity: 0.9 };
        }
        return { weight: (base.weight || 2) + 2, fillOpacity: Math.min((base.fillOpacity || 0.2) + 0.2, 0.8) };
    }

    // Tooltip text per layer
    const tooltipText = {
        'bassin-minier': p => p.nom,
        'bien-inscrit': p => p.nom,
        'zone-tampon': p => 'Zone tampon' + (p.id ? ` ${p.id}` : ''),
        'cites-minieres': p => p.nom,
        'batis': p => p.denomination || p.nom,
        'cavaliers': p => 'Cavalier' + (p.id_unesco ? ` ${p.id_unesco}` : ''),
        'espace-neonaturel': p => p.nom,
        'terrils': p => p.nom || `Terril ${p.no_terril || ''}`,
        'puits-de-mines': p => p.fosse ? `Fosse ${p.fosse}` : 'Puits',
        'communes-mbm': p => p.nom,
        'zt-cavaliers': p => p.nom || 'Cavalier (ZT)',
        'zt-cites-minieres': p => p.nom,
        'zt-espaces-neonaturels': p => p.nom,
        'zt-terrils': p => p.nom || 'Terril (ZT)',
        'zt-parvis-agricoles': p => 'Parvis agricole' + (p.id ? ` ${p.id}` : '')
    };

    // --- Detail panel ---

    const detailPanel = document.getElementById('detail-panel');
    const detailContent = document.getElementById('detail-content');
    const detailClose = document.getElementById('detail-close');

    const detailBackStack = []; // past entries
    const detailForwardStack = []; // future entries
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
        // Mobile: close layers drawer (mutual exclusion)
        if (window.innerWidth <= 600 && layersDrawer && layersDrawer.isOpen()) {
            layersDrawer.close();
        }
        // Push current content to history when panel is already showing a feature
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
        detailPanel.classList.remove('open');
        selectedFeatureInfo = null;
        detailBackStack.length = 0;
        detailForwardStack.length = 0;
        updateNavButtons();
        map.invalidateSize();
        if (loadedCount >= allLayerDefs.length) updateHash();
    }

    detailBack.addEventListener('click', () => {
        if (!detailBackStack.length) return;
        // Save current to forward stack
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
        // Save current to back stack
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
        detailBackStack.length = 0;
        detailForwardStack.length = 0;
        updateNavButtons();
    });

    detailClose.addEventListener('click', hideDetail);

    // Cross-link click handler (event delegation)
    detailContent.addEventListener('click', e => {
        const link = e.target.closest('.cross-link');
        if (!link) return;
        e.preventDefault();
        const type = link.dataset.linkType;
        const value = link.dataset.linkValue;

        if (type === 'commune') {
            const layer = communeIndex.get(value.toLowerCase());
            if (!layer) return;
            ensureLayerVisible('communes-mbm');
            if (layer.getBounds) {
                map.fitBounds(layer.getBounds(), { padding: [50, 50], maxZoom: 15 });
            }
            // Open detail panel
            const builder = detailBuilders['communes-mbm'];
            if (builder) {
                selectedFeatureInfo = { layerId: 'communes-mbm', featureIndex: findFeatureIndex('communes-mbm', layer) };
                showDetail(builder(layer.feature.properties));
                updateHash();
            }
            // Brief highlight
            if (layer.setStyle) {
                const orig = styles['communes-mbm'];
                layer.setStyle({ weight: 4, fillOpacity: 0.5, color: '#e57373' });
                setTimeout(() => layer.setStyle(orig), 2500);
            }
        } else if (type === 'terril') {
            // Search in terrils and zt-terrils layers
            let found = null;
            let foundLayerId = null;
            for (const lid of ['terrils', 'zt-terrils']) {
                const def = allLayerDefs.find(d => d.id === lid);
                if (!def || !def._leafletLayer) continue;
                def._leafletLayer.eachLayer(lyr => {
                    if (found) return;
                    const p = lyr.feature.properties;
                    if (String(p.no_terril) === value || String(p.id) === value) {
                        found = lyr;
                        foundLayerId = lid;
                    }
                });
                if (found) break;
            }
            if (!found) return;
            ensureLayerVisible(foundLayerId);
            if (found.getBounds) {
                map.fitBounds(found.getBounds(), { padding: [50, 50], maxZoom: 16 });
            } else if (found.getLatLng) {
                map.setView(found.getLatLng(), 16);
            }
            // Open detail
            const builder = detailBuilders[foundLayerId];
            if (builder) {
                selectedFeatureInfo = { layerId: foundLayerId, featureIndex: findFeatureIndex(foundLayerId, found) };
                showDetail(builder(found.feature.properties));
                updateHash();
            }
        } else if (type === 'element') {
            // Find all features sharing this element across UNESCO layers
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
            // Enable all needed layers and compute bounds
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
            // Open detail panel for the first match
            const first = matches[0];
            const elBuilder = detailBuilders[first.layerId];
            if (elBuilder) {
                selectedFeatureInfo = { layerId: first.layerId, featureIndex: findFeatureIndex(first.layerId, first.layer) };
                showDetail(elBuilder(first.layer.feature.properties));
                updateHash();
            }
            // Brief highlight all matches
            for (const m of matches) {
                if (m.layer.setStyle) {
                    const orig = styles[m.layerId];
                    m.layer.setStyle({ weight: 4, fillOpacity: 0.6, color: '#e57373' });
                    setTimeout(() => m.layer.setStyle(orig), 3000);
                }
            }
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (layersDrawer && layersDrawer.isOpen()) {
                layersDrawer.close();
            } else {
                hideDetail();
            }
        }
    });

    map.on('click', () => {
        hideDetail();
        if (layersDrawer && layersDrawer.isOpen()) {
            layersDrawer.close();
        }
    });

    // Helper: build MH protection rows
    function mhRows(p) {
        const rows = [];
        if (p.inscrit_mh && String(p.inscrit_mh).toLowerCase() !== 'false' && String(p.inscrit_mh).toLowerCase() !== 'non')
            rows.push(['Inscrit MH', 'Oui']);
        if (p.classe_mh && String(p.classe_mh).toLowerCase() !== 'false' && String(p.classe_mh).toLowerCase() !== 'non')
            rows.push(['Classe MH', 'Oui']);
        return rows;
    }

    // Data.gouv.fr sources for each dataset
    const dataGouvSources = {
        patrimoine: {
            name: 'Perimetre bien inscrit et zone tampon du Bassin Minier',
            url: 'https://www.data.gouv.fr/datasets/perimetre-bien-inscrit-et-zone-tampon-du-bassin-minier-patrimoine-mondial-unesco'
        },
        puits: {
            name: 'Anciens puits de mines dans le Bassin minier du Nord-Pas-de-Calais',
            url: 'https://www.data.gouv.fr/datasets/anciens-puits-de-mines-dans-le-bassin-minier-du-nord-pas-de-calais'
        },
        mbm: {
            name: 'Bassin minier au sens de la Mission Bassin Minier',
            url: 'https://www.data.gouv.fr/datasets/bassin-minier-au-sens-de-la-mission-bassin-minier'
        }
    };

    function sourceRow(source) {
        return ['Sources', rawHtml(`<a href="${source.url}" target="_blank" rel="noopener">${source.name}<span class="cross-link-icon"> \u2197</span></a>`)];
    }

    function buildDetail(title, layerId, groups) {
        const color = styles[layerId] ? (styles[layerId].fillColor || styles[layerId].color) : '#888';
        let html = `<h3><span class="detail-layer-badge" style="background:${color}"></span>${escapeHtml(title)}</h3>`;
        for (const group of groups) {
            const rows = group.rows.filter(Boolean);
            if (rows.length === 0) continue;
            html += `<h4>${escapeHtml(group.label)}</h4><table>`;
            for (const row of rows) {
                html += `<tr><td>${escapeHtml(row[0])}</td><td>${renderValue(row[1])}</td></tr>`;
            }
            html += '</table>';
        }
        return html;
    }

    // --- Detail builders per layer ---

    const detailBuilders = {
        'bassin-minier': p => buildDetail(p.nom || 'Bassin minier', 'bassin-minier', [
            {
                label: 'Caracteristiques', rows: [
                    p.surface_km2 && ['Surface', `${p.surface_km2} km\u00b2`],
                    p.population && ['Population', p.population.toLocaleString('fr-FR')]
                ]
            },
            { label: 'Liens', rows: [sourceRow(dataGouvSources.mbm)] }
        ]),
        'bien-inscrit': p => buildDetail(p.nom || 'Bien inscrit UNESCO', 'bien-inscrit', [
            {
                label: 'Identification', rows: [
                    p.section && ['Section', p.section],
                    p.no_section && ['N° Section', p.no_section],
                    p.no_element && ['Element', p.no_element]
                ]
            },
            {
                label: 'Caracteristiques', rows: [
                    p.surface_ha && ['Surface', `${p.surface_ha} ha`]
                ]
            },
            { label: 'Liens', rows: [sourceRow(dataGouvSources.patrimoine)] }
        ]),
        'zone-tampon': p => buildDetail('Zone tampon', 'zone-tampon', [
            {
                label: 'Identification', rows: [
                    p.id && ['ID', p.id]
                ]
            },
            {
                label: 'Caracteristiques', rows: [
                    p.surface_ha && ['Surface', `${p.surface_ha} ha`]
                ]
            },
            { label: 'Liens', rows: [sourceRow(dataGouvSources.patrimoine)] }
        ]),
        'cites-minieres': p => {
            let nom = p.nom || 'Cite miniere';
            if (p.nom_2) nom += ` / ${p.nom_2}`;
            const cl = communeLinks(p, 'commune_1', 'commune_2', 'commune_3');
            return buildDetail(nom, 'cites-minieres', [
                {
                    label: 'Localisation', rows: [
                        cl && ['Commune', cl]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.type && ['Type', p.type],
                        p.compagnie && ['Compagnie', p.compagnie],
                        p.interet && ['Interet', p.interet],
                        p.proprietaire && ['Proprietaire', p.proprietaire],
                        p.id_unesco && ['ID UNESCO', p.id_unesco],
                        p.element && ['Element', elementLink(p.element)],
                        p.objet && ['Objet', p.objet],
                        p.id_lsm && ['ID LSM', p.id_lsm]
                    ]
                },
                { label: 'Protection', rows: mhRows(p) },
                {
                    label: 'Liens', rows: [
                        p.id_unesco && sourceRow(dataGouvSources.patrimoine),
                        p.id_lsm && sourceRow(dataGouvSources.mbm)
                    ]
                }
            ]);
        },
        'batis': p => buildDetail(p.denomination || p.nom || 'Bati minier', 'batis', [
            {
                label: 'Localisation', rows: [
                    p.commune_1 && ['Commune', communeLinks(p, 'commune_1', 'commune_2')]
                ]
            },
            {
                label: 'Identification', rows: [
                    p.typologie && ['Typologie', p.typologie],
                    p.compagnie && ['Compagnie', p.compagnie],
                    p.periode && ['Periode', p.periode],
                    p.proprietaire && ['Proprietaire', p.proprietaire],
                    p.id_unesco && ['ID UNESCO', p.id_unesco],
                    p.element && ['Element', elementLink(p.element)],
                    p.objet && ['Objet', p.objet]
                ]
            },
            {
                label: 'Protection', rows: [
                    p.protection && p.protection !== 'non' && ['Protection', p.protection]
                ].concat(mhRows(p))
            },
            {
                label: 'Liens', rows: [
                    sourceRow(dataGouvSources.patrimoine),
                    (p.nom || p.compagnie || p.periode || p.proprietaire || p.protection) && sourceRow(dataGouvSources.mbm)
                ]
            }
        ]),
        'cavaliers': p => {
            const cl = communeLinks(p, 'commune_1', 'commune_2', 'commune_3', 'commune_4', 'commune_5', 'commune_6');
            return buildDetail('Cavalier minier', 'cavaliers', [
                {
                    label: 'Localisation', rows: [
                        cl && ['Communes', cl]
                    ]
                },
                {
                    label: 'Caracteristiques', rows: [
                        p.longueur_m && ['Longueur', `${Math.round(p.longueur_m)} m`]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.id_unesco && ['ID UNESCO', p.id_unesco],
                        p.element && ['Element', elementLink(p.element)],
                        p.objet && ['Objet', p.objet]
                    ]
                },
                { label: 'Liens', rows: [sourceRow(dataGouvSources.patrimoine)] }
            ]);
        },
        'espace-neonaturel': p => buildDetail(p.nom || 'Espace neo-naturel', 'espace-neonaturel', [
            {
                label: 'Localisation', rows: [
                    p.commune_1 && ['Commune', communeLinks(p, 'commune_1', 'commune_2')]
                ]
            },
            {
                label: 'Identification', rows: [
                    p.id_unesco && ['ID UNESCO', p.id_unesco],
                    p.element && ['Element', elementLink(p.element)],
                    p.objet && ['Objet', p.objet]
                ]
            },
            { label: 'Liens', rows: [sourceRow(dataGouvSources.patrimoine)] }
        ]),
        'terrils': p => buildDetail(p.nom || 'Terril', 'terrils', [
            {
                label: 'Localisation', rows: [
                    p.commune_1 && ['Commune', communeLinks(p, 'commune_1', 'commune_2', 'commune_3')]
                ]
            },
            {
                label: 'Identification', rows: [
                    p.no_terril && ['N\u00b0 Terril', p.no_terril],
                    p.compagnie && ['Compagnie', p.compagnie],
                    p.groupe && ['Groupe', p.groupe],
                    p.id_unesco && ['ID UNESCO', p.id_unesco],
                    p.element && ['Element', elementLink(p.element)],
                    p.objet && ['Objet', p.objet]
                ]
            },
            {
                label: 'Caracteristiques', rows: [
                    p.forme && ['Forme', p.forme]
                ]
            },
            { label: 'Liens', rows: [sourceRow(dataGouvSources.patrimoine)] }
        ]),
        'communes-mbm': p => buildDetail(p.nom || 'Commune', 'communes-mbm', [
            {
                label: 'Identification', rows: [
                    p.insee && ['INSEE', p.insee],
                    p.statut && ['Statut', p.statut]
                ]
            },
            {
                label: 'Caracteristiques', rows: [
                    p.population && ['Population', Number(p.population).toLocaleString('fr-FR')],
                    p.surface_km2 && ['Surface', `${Number(p.surface_km2).toFixed(1)} km\u00b2`]
                ]
            },
            { label: 'Liens', rows: [sourceRow(dataGouvSources.mbm)] }
        ]),
        'zt-cavaliers': p => {
            const cl = communeLinks(p, 'commune_1', 'commune_2', 'commune_3', 'commune_4');
            return buildDetail(p.nom || 'Cavalier (zone tampon)', 'zt-cavaliers', [
                {
                    label: 'Localisation', rows: [
                        cl && ['Communes', cl]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.id_troncon && ['Troncon', p.id_troncon]
                    ]
                },
                { label: 'Liens', rows: [sourceRow(dataGouvSources.mbm)] }
            ]);
        },
        'zt-cites-minieres': p => {
            let nom = p.nom || 'Cite miniere (zone tampon)';
            if (p.nom_2) nom += ` / ${p.nom_2}`;
            return buildDetail(nom, 'zt-cites-minieres', [
                {
                    label: 'Localisation', rows: [
                        p.commune_1 && ['Commune', communeLinks(p, 'commune_1', 'commune_2', 'commune_3')]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.type && ['Type', p.type],
                        p.compagnie && ['Compagnie', p.compagnie],
                        p.interet && ['Interet', p.interet],
                        p.proprietaire && ['Proprietaire', p.proprietaire]
                    ]
                },
                { label: 'Liens', rows: [sourceRow(dataGouvSources.mbm)] }
            ]);
        },
        'zt-espaces-neonaturels': p => buildDetail(p.nom || 'Espace neo-naturel (zone tampon)', 'zt-espaces-neonaturels', [
            {
                label: 'Localisation', rows: [
                    p.commune_1 && ['Commune', communeLinks(p, 'commune_1', 'commune_2', 'commune_3')]
                ]
            },
            {
                label: 'Identification', rows: [
                    p.id && ['ID', p.id]
                ]
            },
            { label: 'Liens', rows: [sourceRow(dataGouvSources.mbm)] }
        ]),
        'zt-terrils': p => {
            let nom = p.nom || 'Terril (zone tampon)';
            if (p.nom_usuel) nom += ` (${p.nom_usuel})`;
            return buildDetail(nom, 'zt-terrils', [
                {
                    label: 'Localisation', rows: [
                        p.commune_1 && ['Commune', communeLinks(p, 'commune_1', 'commune_2', 'commune_3')]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.id && ['ID', p.id]
                    ]
                },
                {
                    label: 'Caracteristiques', rows: [
                        p.forme && ['Forme', p.forme]
                    ]
                },
                { label: 'Liens', rows: [sourceRow(dataGouvSources.mbm)] }
            ]);
        },
        'zt-parvis-agricoles': p => buildDetail('Parvis agricole', 'zt-parvis-agricoles', [
            {
                label: 'Identification', rows: [
                    p.id && ['ID', p.id]
                ]
            },
            {
                label: 'Caracteristiques', rows: [
                    p.qualite_vue && ['Qualite de vue', p.qualite_vue],
                    p.vue_sur && ['Vue sur', terrilLinks(p.vue_sur) || p.vue_sur]
                ]
            },
            { label: 'Liens', rows: [sourceRow(dataGouvSources.mbm)] }
        ]),
        'puits-de-mines': p => {
            let title = 'Puits';
            if (p.fosse) {
                title = `Fosse ${p.fosse}`;
                if (p.fosse_alias) title += ` (${p.fosse_alias})`;
            }
            return buildDetail(title, 'puits-de-mines', [
                {
                    label: 'Localisation', rows: [
                        p.commune && ['Commune', rawHtml(communeLink(p.commune))],
                        p.concession && ['Concession', p.concession]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.id && ['ID', p.id],
                        p.puits && ['Puits', p.puits],
                        p.compagnie && ['Compagnie', p.compagnie]
                    ]
                },
                {
                    label: 'Caracteristiques', rows: [
                        p.profondeur && ['Profondeur', `${Math.round(p.profondeur)} m`],
                        p.cote && ['Cote', `${Math.round(p.cote)} m`]
                    ]
                },
                {
                    label: 'Historique', rows: [
                        p.creusement && ['Creusement', p.creusement],
                        p.fermeture && ['Fermeture', p.fermeture]
                    ]
                },
                {
                    label: 'Liens', rows: [
                        p.brgm && ['Fiche BRGM', rawHtml(`<a href="${encodeURI(p.brgm)}" target="_blank" rel="noopener">Voir<span class="cross-link-icon"> \u2197</span></a>`)],
                        sourceRow(dataGouvSources.puits)
                    ]
                }
            ]);
        }
    };

    // --- Layer definitions ---

    const layerGroups = [
        {
            group: 'Patrimoine mondial UNESCO', layers: [
                { id: 'batis', label: 'Batis', file: 'data/batis.geojson', active: true },
                { id: 'bien-inscrit', label: 'Bien inscrit', file: 'data/bien-inscrit.geojson', active: true },
                { id: 'cavaliers', label: 'Cavaliers', file: 'data/cavaliers.geojson', active: true },
                { id: 'cites-minieres', label: 'Cites minieres', file: 'data/cites-minieres.geojson', active: true },
                { id: 'espace-neonaturel', label: 'Espaces neo-naturels', file: 'data/espace-neonaturel.geojson', active: true },
                { id: 'terrils', label: 'Terrils', file: 'data/terrils.geojson', active: true },
                { id: 'zone-tampon', label: 'Zone tampon', file: 'data/zone-tampon.geojson', active: true }
            ]
        },
        {
            group: 'Autres éléments du bassin minier', layers: [
                { id: 'zt-cavaliers', label: 'Cavaliers (zone tampon)', file: 'data/zt-cavaliers.geojson', active: false },
                { id: 'zt-cites-minieres', label: 'Cites minieres (zone tampon)', file: 'data/zt-cites-minieres.geojson', active: false },
                { id: 'zt-espaces-neonaturels', label: 'Espaces neo-naturels (zone tampon)', file: 'data/zt-espaces-neonaturels.geojson', active: false },
                { id: 'zt-terrils', label: 'Terrils (zone tampon)', file: 'data/zt-terrils.geojson', active: false },
                { id: 'zt-parvis-agricoles', label: 'Parvis agricoles (zone tampon)', file: 'data/zt-parvis-agricoles.geojson', active: false },
                { id: 'puits-de-mines', label: 'Puits de mines', file: 'data/puits-de-mines.geojson', active: false }
            ]
        },
    ];

    const contextLayers = [
        { id: 'bassin-minier', label: 'Bassin minier (ERBM)', file: 'data/bassin-minier.geojson', active: true },
        { id: 'communes-mbm', label: 'Communes', file: 'data/communes-mbm.geojson', active: false }
    ];

    // Flatten for loading
    const allLayerDefs = [
        ...layerGroups.flatMap(g => g.layers),
        ...contextLayers
    ];

    // Determine geometry type for legend swatch
    function getLayerGeomType(layerId) {
        if (styles[layerId] && styles[layerId].radius) return 'point';
        if (layerId === 'cavaliers' || layerId === 'zt-cavaliers') return 'line';
        return 'polygon';
    }

    // Create a legend swatch element
    function createSwatch(layerId) {
        const style = styles[layerId];
        const geom = getLayerGeomType(layerId);
        const color = style.fillColor || style.color;
        const swatch = document.createElement('span');
        swatch.className = 'layer-swatch';

        if (geom === 'point') {
            swatch.classList.add('layer-swatch-point');
            swatch.style.background = color;
            swatch.style.border = `1.5px solid ${style.color}`;
        } else if (geom === 'line') {
            swatch.classList.add('layer-swatch-line');
            swatch.style.background = style.dashArray
                ? `repeating-linear-gradient(90deg, ${style.color} 0, ${style.color} 4px, transparent 4px, transparent 7px)`
                : style.color;
        } else if (layerPatterns[layerId]) {
            swatch.classList.add('layer-swatch-polygon');
            const W = 20, H = 12, B = 1.5;
            const NS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(NS, 'svg');
            svg.setAttribute('width', W);
            svg.setAttribute('height', H);
            svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
            svg.style.display = 'block';
            // Background color rect
            const bgRect = document.createElementNS(NS, 'rect');
            bgRect.setAttribute('x', B); bgRect.setAttribute('y', B);
            bgRect.setAttribute('width', W - B * 2); bgRect.setAttribute('height', H - B * 2);
            bgRect.setAttribute('fill', color);
            bgRect.setAttribute('fill-opacity', Math.max(style.fillOpacity || 0.3, 0.4));
            svg.appendChild(bgRect);
            // Inline pattern defs for swatch
            const defs = document.createElementNS(NS, 'defs');
            const cfg = layerPatterns[layerId];
            const pat = document.createElementNS(NS, 'pattern');
            const patId = `swatch-pattern-${layerId}`;
            pat.setAttribute('id', patId);
            pat.setAttribute('patternUnits', 'userSpaceOnUse');
            pat.setAttribute('width', cfg.size);
            pat.setAttribute('height', cfg.size);
            buildPatternContent(pat, cfg, color);
            defs.appendChild(pat);
            svg.appendChild(defs);
            // Pattern overlay rect (same inset as background)
            const patRect = document.createElementNS(NS, 'rect');
            patRect.setAttribute('x', B); patRect.setAttribute('y', B);
            patRect.setAttribute('width', W - B * 2); patRect.setAttribute('height', H - B * 2);
            patRect.setAttribute('fill', `url(#${patId})`);
            svg.appendChild(patRect);
            // Border rect
            const borderRect = document.createElementNS(NS, 'rect');
            borderRect.setAttribute('x', B / 2); borderRect.setAttribute('y', B / 2);
            borderRect.setAttribute('width', W - B); borderRect.setAttribute('height', H - B);
            borderRect.setAttribute('rx', 2);
            borderRect.setAttribute('fill', 'none');
            borderRect.setAttribute('stroke', style.color);
            borderRect.setAttribute('stroke-width', B);
            if (style.dashArray) borderRect.setAttribute('stroke-dasharray', style.dashArray);
            svg.appendChild(borderRect);
            swatch.appendChild(svg);
        } else {
            swatch.classList.add('layer-swatch-polygon');
            swatch.style.background = color;
            swatch.style.opacity = Math.max(style.fillOpacity || 0.3, 0.4);
            swatch.style.border = `1.5px solid ${style.color}`;
            if (style.dashArray) {
                swatch.style.borderStyle = 'dashed';
            }
        }
        return swatch;
    }

    // --- Unified Layers Drawer ---

    const LayersDrawer = L.Control.extend({
        options: { position: 'topleft' },
        initialize: function (layerGroups, contextLayers, baseLayers, options) {
            L.Util.setOptions(this, options);
            this._layerGroups = layerGroups;
            this._contextLayers = contextLayers;
            this._baseLayers = baseLayers;
            this._countSpans = {};
            this._groupLists = [];
            this._layerToggleBtns = {};
            this._groupSyncs = [];
        },
        onAdd: function () {
            const aside = L.DomUtil.create('aside', 'layers-drawer');
            L.DomEvent.disableClickPropagation(aside);
            L.DomEvent.disableScrollPropagation(aside);
            const self = this;
            this._aside = aside;

            // Drag handle (mobile)
            L.DomUtil.create('div', 'drag-handle', aside);

            // Header
            const header = L.DomUtil.create('div', 'layers-drawer-header', aside);
            const title = L.DomUtil.create('span', 'layers-drawer-title', header);
            title.textContent = 'Couches';
            const closeBtn = L.DomUtil.create('button', 'panel-close-btn', header);
            closeBtn.innerHTML = '&times;';
            closeBtn.title = 'Fermer';
            closeBtn.setAttribute('aria-label', 'Fermer');
            closeBtn.addEventListener('click', () => self.close());

            // Tabs
            const tabBar = L.DomUtil.create('div', 'layers-drawer-tabs', aside);
            const tabCouches = L.DomUtil.create('button', 'layers-drawer-tab active', tabBar);
            tabCouches.type = 'button';
            tabCouches.textContent = 'Couches';
            const tabFond = L.DomUtil.create('button', 'layers-drawer-tab', tabBar);
            tabFond.type = 'button';
            tabFond.textContent = 'Fond de carte';

            const contentCouches = L.DomUtil.create('div', 'layers-drawer-tab-content active', aside);
            const contentFond = L.DomUtil.create('div', 'layers-drawer-tab-content', aside);

            tabCouches.addEventListener('click', () => {
                tabCouches.classList.add('active');
                tabFond.classList.remove('active');
                contentCouches.classList.add('active');
                contentFond.classList.remove('active');
            });
            tabFond.addEventListener('click', () => {
                tabFond.classList.add('active');
                tabCouches.classList.remove('active');
                contentFond.classList.add('active');
                contentCouches.classList.remove('active');
            });

            // === Couches tab content ===
            this._buildGroupSection(contentCouches, 'Contexte', this._contextLayers, true);

            for (const g of this._layerGroups) {
                this._buildGroupSection(contentCouches, g.group, g.layers, false);
            }

            // === Fond de carte tab content ===
            const cardList = L.DomUtil.create('div', 'drawer-base-cards', contentFond);
            const activeName = Object.keys(this._baseLayers).find(n =>
                self._map.hasLayer(self._baseLayers[n])
            ) || Object.keys(this._baseLayers)[0];

            const baseCards = [];
            for (const name of Object.keys(this._baseLayers)) {
                const card = L.DomUtil.create('button', 'drawer-base-card', cardList);
                const isActive = name === activeName;
                if (isActive) card.classList.add('active');
                card.type = 'button';
                card.setAttribute('aria-pressed', isActive);
                if (baseLayerThumbnails[name]) {
                    const thumb = L.DomUtil.create('img', 'drawer-base-card-thumb', card);
                    thumb.src = baseLayerThumbnails[name];
                    thumb.alt = name;
                    thumb.loading = 'lazy';
                }
                const cardLabel = L.DomUtil.create('span', 'drawer-base-card-label', card);
                cardLabel.textContent = name;
                baseCards.push(card);
                card.addEventListener('click', () => {
                    for (const n of Object.keys(self._baseLayers)) {
                        self._map.removeLayer(self._baseLayers[n]);
                    }
                    self._baseLayers[name].addTo(self._map);
                    for (const c of baseCards) {
                        c.classList.remove('active');
                        c.setAttribute('aria-pressed', 'false');
                    }
                    card.classList.add('active');
                    card.setAttribute('aria-pressed', 'true');
                    self._map.fire('baselayerchange', { name, layer: self._baseLayers[name] });
                    updateHash();
                });
            }

            // Append aside to <main>, return empty div for L.Control
            document.querySelector('main').appendChild(aside);
            const dummy = L.DomUtil.create('div');
            dummy.style.display = 'none';
            return dummy;
        },

        _buildGroupSection: function (container, groupLabel, layerDefs, isContext) {
            const self = this;
            const groupHeader = L.DomUtil.create('div', 'drawer-group-header', container);
            const toggleArrow = L.DomUtil.create('span', 'drawer-group-toggle', groupHeader);
            const groupSpan = L.DomUtil.create('span', 'drawer-group-label', groupHeader);
            groupSpan.textContent = isContext ? groupLabel : ` ${groupLabel}`;

            const someActive = layerDefs.some(d => d.active !== false);
            const groupToggleBtn = L.DomUtil.create('button', 'layer-toggle-btn' + (isContext ? '' : ' group-toggle-btn'), groupHeader);
            groupToggleBtn.type = 'button';
            setToggleState(groupToggleBtn, someActive, 'le groupe');

            const groupList = L.DomUtil.create('div', 'drawer-group-list', container);
            const layerToggles = [];

            for (const def of layerDefs) {
                const toggleBtn = self._buildLayerRow(groupList, def, isContext);
                layerToggles.push({ toggleBtn, def });
            }

            function syncGroupToggle() {
                const anyActive = layerToggles.some(lt => lt.toggleBtn.classList.contains('active'));
                setToggleState(groupToggleBtn, anyActive, 'le groupe');
            }

            this._groupSyncs.push({ layerIds: layerDefs.map(d => d.id), sync: syncGroupToggle });

            for (const lt of layerToggles) {
                lt.toggleBtn.closest('.drawer-layer-row').addEventListener('click', () => {
                    setTimeout(syncGroupToggle, 0);
                });
            }

            groupToggleBtn.addEventListener('click', e => {
                e.stopPropagation();
                const nowActive = groupToggleBtn.classList.contains('active');
                for (const lt of layerToggles) {
                    const isLayerActive = lt.toggleBtn.classList.contains('active');
                    if (nowActive && isLayerActive) {
                        setToggleState(lt.toggleBtn, false, 'la couche');
                        if (lt.def._leafletLayer) self._map.removeLayer(lt.def._leafletLayer);
                        if (isContext && lt.def.id === 'bassin-minier' && bassinMask) {
                            self._map.removeLayer(bassinMask);
                        }
                    } else if (!nowActive && !isLayerActive) {
                        setToggleState(lt.toggleBtn, true, 'la couche');
                        if (lt.def._leafletLayer) lt.def._leafletLayer.addTo(self._map);
                        if (isContext && lt.def.id === 'bassin-minier' && bassinMask) {
                            bassinMask.addTo(self._map);
                        }
                    }
                }
                if (!nowActive && groupList.classList.contains('collapsed')) {
                    groupList.classList.remove('collapsed');
                    toggleArrow.classList.remove('collapsed');
                    groupList.style.maxHeight = `${groupList.scrollHeight}px`;
                }
                syncGroupToggle();
                self._updateToggleIndicator();
            });

            // Collapse/expand
            const isCollapsed = !someActive;
            if (isCollapsed) {
                groupList.classList.add('collapsed');
                toggleArrow.classList.add('collapsed');
            }
            this._groupLists.push(groupList);

            toggleArrow.addEventListener('click', e => {
                e.stopPropagation();
                if (groupList.classList.contains('collapsed')) {
                    groupList.classList.remove('collapsed');
                    toggleArrow.classList.remove('collapsed');
                    groupList.style.maxHeight = `${groupList.scrollHeight}px`;
                } else {
                    groupList.style.maxHeight = `${groupList.scrollHeight}px`;
                    groupList.offsetHeight; // force reflow
                    groupList.classList.add('collapsed');
                    toggleArrow.classList.add('collapsed');
                }
            });
        },

        _buildLayerRow: function (container, def, isContext) {
            const self = this;
            const row = L.DomUtil.create('div', 'drawer-layer-row', container);
            const color = styles[def.id].fillColor || styles[def.id].color;
            row.style.setProperty('--layer-color', color);

            row.appendChild(createSwatch(def.id));

            const label = L.DomUtil.create('span', 'drawer-layer-label', row);
            label.textContent = def.label;

            const countSpan = L.DomUtil.create('span', 'drawer-layer-count', row);
            self._countSpans[def.id] = countSpan;

            const isActive = def.active !== false;
            const toggleBtn = L.DomUtil.create('button', 'layer-toggle-btn', row);
            toggleBtn.type = 'button';
            setToggleState(toggleBtn, isActive, 'la couche');

            self._layerToggleBtns[def.id] = toggleBtn;

            row.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                const nowActive = toggleBtn.classList.contains('active');
                setToggleState(toggleBtn, !nowActive, 'la couche');
                if (nowActive) {
                    if (def._leafletLayer) self._map.removeLayer(def._leafletLayer);
                    if (isContext && def.id === 'bassin-minier' && bassinMask) {
                        self._map.removeLayer(bassinMask);
                    }
                } else {
                    if (def._leafletLayer) def._leafletLayer.addTo(self._map);
                    if (isContext && def.id === 'bassin-minier' && bassinMask) {
                        bassinMask.addTo(self._map);
                    }
                }
                self._updateToggleIndicator();
                    updateHash();
            });

            return toggleBtn;
        },
        open: function () {
            this._aside.classList.add('open');
            const self = this;
            requestAnimationFrame(() => {
                for (const gl of self._groupLists) {
                    if (!gl.classList.contains('collapsed')) {
                        gl.style.maxHeight = `${gl.scrollHeight}px`;
                    }
                }
            });
            // Mobile: close detail panel (mutual exclusion)
            if (window.innerWidth <= 600) {
                hideDetail();
            }
            this._map.invalidateSize();
        },
        close: function () {
            this._aside.classList.remove('open');
            this._map.invalidateSize();
        },
        toggle: function () {
            if (this._aside.classList.contains('open')) {
                this.close();
            } else {
                this.open();
            }
        },
        isOpen: function () {
            return this._aside.classList.contains('open');
        },
        updateCount: function (layerId, count) {
            if (this._countSpans[layerId]) {
                this._countSpans[layerId].textContent = count;
            }
        },
        syncLayerState: function (layerId, active) {
            const btn = this._layerToggleBtns[layerId];
            if (btn) setToggleState(btn, active, 'la couche');
            for (const gs of this._groupSyncs) {
                if (gs.layerIds.includes(layerId)) gs.sync();
            }
            this._updateToggleIndicator();
        },
        _toggleBtn: null,
        _updateToggleIndicator: function () {
            if (!this._toggleBtn) return;
            let hasNonDefault = false;
            for (const g of this._layerGroups) {
                for (const def of g.layers) {
                    if (!def._leafletLayer) continue;
                    const isOnMap = map.hasLayer(def._leafletLayer);
                    const wasDefault = def.active !== false;
                    if (isOnMap !== wasDefault) hasNonDefault = true;
                }
            }
            for (const def of this._contextLayers) {
                if (!def._leafletLayer) continue;
                const isOnMap = map.hasLayer(def._leafletLayer);
                const wasDefault = def.active !== false;
                if (isOnMap !== wasDefault) hasNonDefault = true;
            }
            this._toggleBtn.classList.toggle('has-active', hasNonDefault);
        }
    });

    // --- Search control ---

    const searchableProps = {
        'bassin-minier': { title: p => p.nom, meta: () => 'Perimetre', text: ['nom'] },
        'bien-inscrit': { title: p => p.nom, meta: p => 'Bien inscrit' + (p.section ? ` - ${p.section}` : ''), text: ['nom', 'section', 'no_section'] },
        'zone-tampon': { title: p => `Zone tampon ${p.id || ''}`, meta: () => 'Zone tampon', text: ['id'] },
        'cites-minieres': { title: p => p.nom, meta: p => joinNotNull([p.commune_1, p.commune_2, p.commune_3]) || 'Cite miniere', text: ['nom', 'nom_2', 'commune_1', 'commune_2', 'commune_3', 'compagnie', 'proprietaire', 'element', 'objet'] },
        'batis': { title: p => p.denomination || p.nom, meta: p => joinNotNull([p.commune_1, p.commune_2]) || 'Bati minier', text: ['denomination', 'nom', 'commune_1', 'commune_2', 'typologie', 'compagnie', 'proprietaire', 'element', 'objet'] },
        'cavaliers': { title: p => 'Cavalier' + (p.id_unesco ? ` ${p.id_unesco}` : ''), meta: p => joinNotNull([p.commune_1, p.commune_2, p.commune_3]) || 'Cavalier', text: ['commune_1', 'commune_2', 'commune_3', 'commune_4', 'commune_5', 'commune_6', 'id_unesco', 'element', 'objet'] },
        'espace-neonaturel': { title: p => p.nom, meta: p => joinNotNull([p.commune_1, p.commune_2]) || 'Espace neo-naturel', text: ['nom', 'commune_1', 'commune_2', 'element', 'objet'] },
        'terrils': { title: p => p.nom || `Terril ${p.no_terril || ''}`, meta: p => joinNotNull([p.commune_1, p.commune_2]) || 'Terril', text: ['nom', 'no_terril', 'commune_1', 'commune_2', 'compagnie', 'element', 'objet'] },
        'puits-de-mines': { title: p => p.fosse ? `Fosse ${p.fosse}${p.fosse_alias ? ` (${p.fosse_alias})` : ''}` : 'Puits', meta: p => p.commune || 'Puits de mine', text: ['fosse', 'fosse_alias', 'puits', 'commune', 'compagnie', 'concession', 'id'] },
        'communes-mbm': { title: p => p.nom, meta: p => 'Commune' + (p.population ? ` - pop. ${Number(p.population).toLocaleString('fr-FR')}` : ''), text: ['nom', 'insee'] },
        'zt-cavaliers': { title: p => p.nom || 'Cavalier (ZT)', meta: p => joinNotNull([p.commune_1, p.commune_2]) || 'Cavalier (zone tampon)', text: ['nom', 'commune_1', 'commune_2', 'commune_3', 'commune_4', 'id_troncon'] },
        'zt-cites-minieres': { title: p => p.nom, meta: p => joinNotNull([p.commune_1, p.commune_2]) || 'Cite miniere (zone tampon)', text: ['nom', 'nom_2', 'commune_1', 'commune_2', 'compagnie'] },
        'zt-espaces-neonaturels': { title: p => p.nom, meta: p => joinNotNull([p.commune_1, p.commune_2]) || 'Espace neo-naturel (zone tampon)', text: ['nom', 'commune_1', 'commune_2'] },
        'zt-terrils': { title: p => p.nom || 'Terril (ZT)', meta: p => joinNotNull([p.commune_1, p.commune_2]) || 'Terril (zone tampon)', text: ['nom', 'nom_usuel', 'commune_1', 'commune_2'] },
        'zt-parvis-agricoles': { title: p => `Parvis agricole ${p.id || ''}`, meta: p => p.qualite_vue || 'Parvis agricole', text: ['id', 'qualite_vue', 'vue_sur'] }
    };

    const searchIndex = [];

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

    const SearchControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function () {
            const container = L.DomUtil.create('div', 'search-control');
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            const inputWrapper = L.DomUtil.create('div', 'search-input-wrapper', container);
            const input = L.DomUtil.create('input', '', inputWrapper);
            input.type = 'text';
            input.placeholder = 'Rechercher un lieu...';
            input.setAttribute('aria-label', 'Rechercher');

            const clearBtn = L.DomUtil.create('button', 'search-clear', inputWrapper);
            clearBtn.type = 'button';
            clearBtn.innerHTML = '&times;';
            clearBtn.title = 'Effacer';
            clearBtn.setAttribute('aria-label', 'Effacer la recherche');

            const results = L.DomUtil.create('div', 'search-results', container);
            let activeIndex = -1;
            let previewLayer = null;
            let previewLayerId = null;
            let currentResults = [];

            function previewHighlight(item) {
                previewUnhighlight();
                if (!item || !item.layer) return;
                previewLayer = item.layer;
                previewLayerId = item.layerId;
                if (previewLayer.setStyle) {
                    previewLayer.setStyle(getHoverStyle(item.layerId));
                    if (previewLayer.bringToFront && item.layerId !== 'bassin-minier' && item.layerId !== 'communes-mbm') {
                        previewLayer.bringToFront();
                    }
                }
                if (previewLayer.getTooltip && previewLayer.getTooltip()) {
                    previewLayer.openTooltip();
                }
            }

            function previewUnhighlight() {
                if (!previewLayer) return;
                if (previewLayer.setStyle && previewLayerId) {
                    previewLayer.setStyle(styles[previewLayerId]);
                }
                if (previewLayer.getTooltip && previewLayer.getTooltip()) {
                    previewLayer.closeTooltip();
                }
                previewLayer = null;
                previewLayerId = null;
            }

            function updateClearBtn() {
                if (input.value.length > 0) {
                    clearBtn.classList.add('visible');
                    input.classList.add('expanded');
                } else {
                    clearBtn.classList.remove('visible');
                }
            }

            input.addEventListener('focus', () => input.classList.add('expanded'));
            input.addEventListener('blur', () => {
                if (input.value.length === 0) {
                    input.classList.remove('expanded');
                }
            });

            function clearResults() {
                previewUnhighlight();
                results.innerHTML = '';
                results.classList.remove('open');
                activeIndex = -1;
                currentResults = [];
            }

            function showResults(items) {
                results.innerHTML = '';
                activeIndex = -1;
                currentResults = items;
                if (items.length === 0) {
                    if (input.value.trim().length >= 2) {
                        results.innerHTML = '<div class="search-no-results">Aucun resultat</div>';
                        results.classList.add('open');
                    } else {
                        results.classList.remove('open');
                    }
                    return;
                }
                items.forEach((item, idx) => {
                    const div = L.DomUtil.create('div', 'search-result-item', results);
                    const color = styles[item.layerId].fillColor || styles[item.layerId].color;
                    div.innerHTML = `<div class="search-result-title"><span class="search-result-layer" style="background:${color}"></span>${escapeHtml(item.title)}</div>`
                        + `<div class="search-result-meta">${escapeHtml(item.meta)}</div>`;
                    div.addEventListener('click', () => selectResult(item));
                    div.addEventListener('mouseenter', () => {
                        setActive(idx);
                        previewHighlight(item);
                    });
                    div.addEventListener('mouseleave', () => previewUnhighlight());
                });
                results.classList.add('open');
            }

            function setActive(idx) {
                const items = results.querySelectorAll('.search-result-item');
                for (const el of items) el.classList.remove('active');
                activeIndex = idx;
                if (idx >= 0 && idx < items.length) {
                    items[idx].classList.add('active');
                    items[idx].scrollIntoView({ block: 'nearest' });
                }
            }

            function selectResult(item) {
                clearResults();
                input.value = item.title;
                updateClearBtn();

                // Ensure layer is visible
                ensureLayerVisible(item.layerId);

                // Zoom to feature
                if (item.layer.getBounds) {
                    map.fitBounds(item.layer.getBounds(), { padding: [50, 50], maxZoom: 16 });
                } else if (item.layer.getLatLng) {
                    map.setView(item.layer.getLatLng(), 16);
                }

                // Open detail panel
                const builder = detailBuilders[item.layerId];
                if (builder) {
                    selectedFeatureInfo = { layerId: item.layerId, featureIndex: findFeatureIndex(item.layerId, item.layer) };
                    showDetail(builder(item.layer.feature.properties));
                    updateHash();
                }

                // Highlight briefly
                if (item.layer.setStyle) {
                    const origStyle = styles[item.layerId];
                    item.layer.setStyle({ weight: 4, fillOpacity: 0.6 });
                    setTimeout(() => item.layer.setStyle(origStyle), 2000);
                }

                input.blur();
            }

            clearBtn.addEventListener('click', () => {
                input.value = '';
                clearResults();
                updateClearBtn();
                input.focus();
            });

            let debounceTimer;
            input.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                updateClearBtn();
                const query = input.value.trim().toLowerCase();
                if (query.length < 2) {
                    clearResults();
                    return;
                }
                debounceTimer = setTimeout(() => {
                    const terms = query.split(/\s+/);
                    const matches = searchIndex.filter(entry =>
                        terms.every(term =>
                            entry.searchText.includes(term) || entry.title.toLowerCase().includes(term)
                        )
                    ).slice(0, 20);
                    showResults(matches);
                }, 150);
            });

            input.addEventListener('keydown', e => {
                const items = results.querySelectorAll('.search-result-item');
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActive(Math.min(activeIndex + 1, items.length - 1));
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActive(Math.max(activeIndex - 1, 0));
                } else if (e.key === 'Enter' && activeIndex >= 0) {
                    e.preventDefault();
                    if (currentResults[activeIndex]) {
                        selectResult(currentResults[activeIndex]);
                    }
                } else if (e.key === 'Escape') {
                    clearResults();
                    input.blur();
                }
            });

            map.on('click', () => clearResults());

            return container;
        }
    });

    // --- Bottom bar: layers toggle + search + unified zoom ---

    const BottomBarControl = L.Control.extend({
        options: { position: 'bottomleft' },
        onAdd: function (map) {
            const container = L.DomUtil.create('div', 'bottom-pickers-bar');
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            // Layers toggle button
            const layersBtn = L.DomUtil.create('button', 'layers-toggle-btn', container);
            layersBtn.type = 'button';
            layersBtn.title = 'Couches';
            layersBtn.setAttribute('aria-label', 'Couches');
            layersBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';
            layersBtn.addEventListener('click', () => layersDrawer.toggle());
            layersDrawer._toggleBtn = layersBtn;

            // Search control
            const sc = new SearchControl();
            sc._map = map;
            container.appendChild(sc.onAdd(map));

            // Unified zoom (zoom in + full extent + zoom out)
            const zoomBar = L.DomUtil.create('div', 'leaflet-bar leaflet-control-zoom unified-zoom', container);

            const zoomIn = L.DomUtil.create('a', 'leaflet-control-zoom-in', zoomBar);
            zoomIn.href = '#';
            zoomIn.title = 'Zoom avant';
            zoomIn.setAttribute('role', 'button');
            zoomIn.setAttribute('aria-label', 'Zoom avant');
            zoomIn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';

            const fullExtent = L.DomUtil.create('a', 'leaflet-control-full-extent', zoomBar);
            fullExtent.href = '#';
            fullExtent.title = 'Vue d\'ensemble';
            fullExtent.setAttribute('role', 'button');
            fullExtent.setAttribute('aria-label', 'Vue d\'ensemble');
            fullExtent.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';

            const resetView = L.DomUtil.create('a', 'leaflet-control-reset-view', zoomBar);
            resetView.href = '#';
            resetView.title = 'Réinitialiser la vue';
            resetView.setAttribute('role', 'button');
            resetView.setAttribute('aria-label', 'Réinitialiser la vue');
            resetView.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';

            const zoomOut = L.DomUtil.create('a', 'leaflet-control-zoom-out', zoomBar);
            zoomOut.href = '#';
            zoomOut.title = 'Zoom arrière';
            zoomOut.setAttribute('role', 'button');
            zoomOut.setAttribute('aria-label', 'Zoom arrière');
            zoomOut.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';

            L.DomEvent.on(zoomIn, 'click', e => {
                L.DomEvent.preventDefault(e);
                map.zoomIn();
            });
            L.DomEvent.on(fullExtent, 'click', e => {
                L.DomEvent.preventDefault(e);
                hideDetail();
                if (boundsGroup.getBounds().isValid()) {
                    map.fitBounds(boundsGroup.getBounds(), { padding: [20, 20] });
                } else {
                    map.setView([50.35, 2.8], 10);
                }
            });
            L.DomEvent.on(resetView, 'click', e => {
                L.DomEvent.preventDefault(e);
                resetToDefaults();
            });
            L.DomEvent.on(zoomOut, 'click', e => {
                L.DomEvent.preventDefault(e);
                map.zoomOut();
            });

            return container;
        }
    });

    // --- Initialize controls and load data ---

    const layersDrawer = new LayersDrawer(layerGroups, contextLayers, baseLayers);
    layersDrawer.addTo(map);

    function ensureLayerVisible(layerId) {
        const def = allLayerDefs.find(d => d.id === layerId);
        if (!def || !def._leafletLayer) return;
        if (!map.hasLayer(def._leafletLayer)) {
            def._leafletLayer.addTo(map);
            if (layerId === 'bassin-minier' && bassinMask) bassinMask.addTo(map);
            layersDrawer.syncLayerState(layerId, true);
        }
    }

    new BottomBarControl().addTo(map);

    const boundsGroup = L.featureGroup();
    let loadedCount = 0;
    let bassinMask = null;

    const loadingOverlay = document.getElementById('loading-overlay');

    // Dedicated pane for bassin-minier so it renders below other overlays
    const bassinPane = map.createPane('bassinPane');
    bassinPane.style.zIndex = 350;

    // Dedicated pane for the mask so it never intercepts clicks
    const maskPane = map.createPane('maskPane');
    maskPane.style.zIndex = 360;
    maskPane.style.pointerEvents = 'none';

    // Layered panes so smaller features render above larger ones (and stay clickable)
    const largeFeaturesPane = map.createPane('largeFeaturesPane');
    largeFeaturesPane.style.zIndex = 370;

    const mediumFeaturesPane = map.createPane('mediumFeaturesPane');
    mediumFeaturesPane.style.zIndex = 380;

    const smallFeaturesPane = map.createPane('smallFeaturesPane');
    smallFeaturesPane.style.zIndex = 390;

    // Map layer IDs to their rendering pane (largest → lowest z-index)
    const layerPanes = {
        'zone-tampon': 'largeFeaturesPane',
        'bien-inscrit': 'largeFeaturesPane',
        'communes-mbm': 'largeFeaturesPane',
        'zt-cavaliers': 'largeFeaturesPane',
        'zt-cites-minieres': 'largeFeaturesPane',
        'zt-espaces-neonaturels': 'largeFeaturesPane',
        'zt-terrils': 'largeFeaturesPane',
        'zt-parvis-agricoles': 'largeFeaturesPane',
        'cites-minieres': 'mediumFeaturesPane',
        'espace-neonaturel': 'mediumFeaturesPane',
        'cavaliers': 'smallFeaturesPane',
        'terrils': 'smallFeaturesPane',
        'batis': 'smallFeaturesPane',
    };

    // Build an inverted polygon (world exterior with hole cut for the given coordinates)
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

    let hoveredLayer = null;
    const communeIndex = new Map();

    // --- URL hash state ---

    // Track the currently selected feature for URL sharing
    let selectedFeatureInfo = null; // { layerId, featureIndex }

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

        // Layers: only include if different from defaults
        const activeLayers = getActiveLayerIds();
        const defaultLayers = getDefaultLayerIds();
        if (!arraysEqual(activeLayers.slice().sort(), defaultLayers.slice().sort())) {
            params.set('layers', activeLayers.join(','));
        }

        // Base layer: only include if not the default (Clair)
        const base = getActiveBaseLayerName();
        if (base !== 'Clair') {
            params.set('base', base);
        }

        // Map view
        const center = map.getCenter();
        const zoom = map.getZoom();
        params.set('lat', center.lat.toFixed(5));
        params.set('lng', center.lng.toFixed(5));
        params.set('z', zoom);

        // Selected feature
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
        // Close detail panel
        hideDetail();

        // Close layers drawer
        if (layersDrawer && layersDrawer.isOpen()) layersDrawer.close();

        // Restore default layers
        for (const def of allLayerDefs) {
            if (!def._leafletLayer) continue;
            const shouldBeActive = def.active !== false;
            const isActive = map.hasLayer(def._leafletLayer);
            if (shouldBeActive && !isActive) {
                def._leafletLayer.addTo(map);
                if (def.id === 'bassin-minier' && bassinMask) bassinMask.addTo(map);
            } else if (!shouldBeActive && isActive) {
                map.removeLayer(def._leafletLayer);
                if (def.id === 'bassin-minier' && bassinMask) map.removeLayer(bassinMask);
            }
            layersDrawer.syncLayerState(def.id, shouldBeActive);
        }

        // Restore default base layer (Clair)
        for (const name of Object.keys(baseLayers)) {
            map.removeLayer(baseLayers[name]);
        }
        baseLayers['Clair'].addTo(map);
        const cards = document.querySelectorAll('.drawer-base-card');
        cards.forEach(c => {
            const label = c.querySelector('.drawer-base-card-label');
            const isMatch = label && label.textContent === 'Clair';
            c.classList.toggle('active', isMatch);
            c.setAttribute('aria-pressed', isMatch);
        });

        // Restore default view
        if (boundsGroup.getBounds().isValid()) {
            map.fitBounds(boundsGroup.getBounds(), { padding: [20, 20] });
        } else {
            map.setView([50.35, 2.8], 10);
        }

        // Clear URL hash
        history.replaceState(null, '', location.pathname + location.search);
    }

    function findFeatureIndex(layerId, targetLayer) {
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

    // Save hash state parsed before loading, to apply after all layers are ready
    const initialHashState = parseHash();

    function onLayerLoaded() {
        loadedCount++;
        if (loadedCount < allLayerDefs.length) return;

        for (const d of allLayerDefs) {
            if (d._featureCount !== undefined) {
                layersDrawer.updateCount(d.id, d._featureCount);
            }
        }
        buildSearchIndex();

        // Build commune lookup index
        const communeDef = allLayerDefs.find(d => d.id === 'communes-mbm');
        if (communeDef && communeDef._leafletLayer) {
            communeDef._leafletLayer.eachLayer(layer => {
                const name = layer.feature.properties.nom;
                if (name) communeIndex.set(name.toLowerCase(), layer);
            });
        }

        injectPatterns();

        // Apply initial URL hash state or default bounds
        if (initialHashState) {
            // Restore layers
            if (initialHashState.layers) {
                for (const def of allLayerDefs) {
                    if (!def._leafletLayer) continue;
                    const shouldBeActive = initialHashState.layers.includes(def.id);
                    const isActive = map.hasLayer(def._leafletLayer);
                    if (shouldBeActive && !isActive) {
                        def._leafletLayer.addTo(map);
                        if (def.id === 'bassin-minier' && bassinMask) bassinMask.addTo(map);
                    } else if (!shouldBeActive && isActive) {
                        map.removeLayer(def._leafletLayer);
                        if (def.id === 'bassin-minier' && bassinMask) map.removeLayer(bassinMask);
                    }
                    layersDrawer.syncLayerState(def.id, shouldBeActive);
                }
            }

            // Restore base layer
            if (initialHashState.base && baseLayers[initialHashState.base]) {
                for (const name of Object.keys(baseLayers)) {
                    map.removeLayer(baseLayers[name]);
                }
                baseLayers[initialHashState.base].addTo(map);
                // Sync base layer cards in drawer
                const cards = document.querySelectorAll('.drawer-base-card');
                cards.forEach(c => {
                    const label = c.querySelector('.drawer-base-card-label');
                    const isMatch = label && label.textContent === initialHashState.base;
                    c.classList.toggle('active', isMatch);
                    c.setAttribute('aria-pressed', isMatch);
                });
            }

            // Restore map view
            if (initialHashState.lat !== undefined) {
                map.setView([initialHashState.lat, initialHashState.lng], initialHashState.zoom);
            } else if (boundsGroup.getBounds().isValid()) {
                map.fitBounds(boundsGroup.getBounds(), { padding: [20, 20] });
            }

            // Restore selected feature
            if (initialHashState.sel) {
                const { layerId, featureIndex } = initialHashState.sel;
                const def = allLayerDefs.find(d => d.id === layerId);
                if (def && def._leafletLayer) {
                    ensureLayerVisible(layerId);
                    let idx = 0;
                    def._leafletLayer.eachLayer(lyr => {
                        if (idx === featureIndex) {
                            const builder = detailBuilders[layerId];
                            if (builder) {
                                selectedFeatureInfo = { layerId, featureIndex };
                                showDetail(builder(lyr.feature.properties));
                            }
                        }
                        idx++;
                    });
                }
            }
        } else {
            if (boundsGroup.getBounds().isValid()) {
                map.fitBounds(boundsGroup.getBounds(), { padding: [20, 20] });
            }
        }

        // Start updating hash on map move (after initial state is applied)
        map.on('moveend', updateHash);

        if (loadingOverlay) {
            loadingOverlay.classList.add('fade-out');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                map.invalidateSize();
            }, 400);
        }
    }

    for (const def of allLayerDefs) {
        fetch(def.file)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(geojson => {
                const paneOpt = layerPanes[def.id] ? { pane: layerPanes[def.id] } : {};
                const layerOpts = {
                    style: () => ({
                        ...styles[def.id],
                        ...paneOpt,
                        ...(layerPatterns[def.id] ? { className: `layer-${def.id}` } : {})
                    }),
                    onEachFeature: (feature, layer) => {
                        const builder = detailBuilders[def.id];
                        if (builder) {
                            layer.on('click', e => {
                                L.DomEvent.stopPropagation(e);
                                // Track selected feature for URL sharing
                                const idx = geojson.features.indexOf(feature);
                                selectedFeatureInfo = { layerId: def.id, featureIndex: idx };
                                showDetail(builder(feature.properties));
                                updateHash();
                            });
                        }

                        // Hover tooltip
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

                        // Hover highlight
                        layer.on('mouseover', () => {
                            if (hoveredLayer && hoveredLayer !== layer && hoveredLayer.setStyle) {
                                hoveredLayer.setStyle(styles[def.id]);
                            }
                            hoveredLayer = layer;
                            if (layer.setStyle) {
                                layer.setStyle(getHoverStyle(def.id));
                            }
                            if (layer.bringToFront && def.id !== 'bassin-minier' && def.id !== 'communes-mbm') {
                                layer.bringToFront();
                            }
                        });
                        layer.on('mouseout', () => {
                            if (layer.setStyle) {
                                layer.setStyle(styles[def.id]);
                            }
                            hoveredLayer = null;
                        });
                    }
                };
                if (styles[def.id] && styles[def.id].radius) {
                    layerOpts.pointToLayer = (_feature, latlng) => L.circleMarker(latlng, { ...styles[def.id], ...paneOpt });
                }
                const layer = L.geoJSON(geojson, layerOpts);
                def._leafletLayer = layer;

                const featureCount = geojson.features ? geojson.features.length : 0;
                def._featureCount = featureCount;

                // Create inverted mask for bassin-minier
                if (def.id === 'bassin-minier' && geojson.features && geojson.features[0]) {
                    bassinMask = createMaskLayer(geojson.features[0].geometry.coordinates);
                    if (def.active !== false) {
                        bassinMask.addTo(map);
                    }
                }

                if (def.active !== false) {
                    layer.addTo(map);
                }
                boundsGroup.addLayer(layer);

                onLayerLoaded();
            })
            .catch(err => {
                console.warn(`Failed to load ${def.file}:`, err);
                onLayerLoaded();
            });
    }

    // Re-inject pattern defs when Leaflet recreates SVG containers
    map.on('layeradd', () => injectPatterns());

    // Add drag handle for mobile bottom sheet
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    detailPanel.insertBefore(dragHandle, detailPanel.firstChild);
})();
