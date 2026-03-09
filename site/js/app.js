(function () {
    'use strict';

    // Map initialization
    var map = L.map('map').setView([50.35, 2.8], 10);

    // Base layers
    var osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    });

    var osmTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17
    });

    var esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics',
        maxZoom: 18
    });

    var baseLayers = {
        'Plan': osmStandard,
        'Relief': osmTopo,
        'Satellite': esriSatellite
    };

    var baseLayerThumbnails = {
        'Plan': 'https://a.tile.openstreetmap.org/10/523/340.png',
        'Relief': 'https://a.tile.opentopomap.org/10/523/340.png',
        'Satellite': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/340/523'
    };

    var baseLayerAttributions = {
        'Plan': 'Fond de carte &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        'Relief': 'Fond de carte &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>, &copy; <a href="https://opentopomap.org" target="_blank" rel="noopener">OpenTopoMap</a>',
        'Satellite': 'Fond de carte &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a>, Maxar, Earthstar Geographics'
    };

    osmStandard.addTo(map);

    map.on('baselayerchange', function (e) {
        var el = document.getElementById('base-layer-attribution');
        if (el && baseLayerAttributions[e.name]) {
            el.innerHTML = baseLayerAttributions[e.name];
        }
    });

    // Layer styles
    var styles = {
        'bassin-minier': {
            color: '#FF6F00',
            weight: 2,
            dashArray: '8 6',
            fillColor: '#FF6F00',
            fillOpacity: 0.05,
            opacity: 0.7
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
            weight: 1.5,
            fillColor: '#E74C3C',
            fillOpacity: 0.35,
            opacity: 0.8
        },
        'batis': {
            color: '#8B4513',
            weight: 1.5,
            fillColor: '#8B4513',
            fillOpacity: 0.4,
            opacity: 0.8
        },
        'cavaliers': {
            color: '#2ECC71',
            weight: 3,
            fillColor: '#2ECC71',
            fillOpacity: 0.4,
            opacity: 0.8
        },
        'espace-neonaturel': {
            color: '#27AE60',
            weight: 1.5,
            fillColor: '#27AE60',
            fillOpacity: 0.35,
            opacity: 0.8
        },
        'terrils': {
            color: '#95A5A6',
            weight: 1.5,
            fillColor: '#95A5A6',
            fillOpacity: 0.4,
            opacity: 0.8
        },
        'puits-de-mines': {
            radius: 5,
            color: '#4A235A',
            weight: 1.5,
            fillColor: '#7D3C98',
            fillOpacity: 0.7,
            opacity: 0.9
        }
    };

    // Detail panel
    var detailPanel = document.getElementById('detail-panel');
    var detailContent = document.getElementById('detail-content');
    var detailClose = document.getElementById('detail-close');

    function showDetail(html) {
        detailContent.innerHTML = html;
        detailPanel.classList.remove('hidden');
        map.invalidateSize();
    }

    function hideDetail() {
        detailPanel.classList.add('hidden');
        map.invalidateSize();
    }

    detailClose.addEventListener('click', hideDetail);

    // Helper: build MH protection rows
    function mhRows(p) {
        var rows = [];
        if (p.inscrit_mh && String(p.inscrit_mh).toLowerCase() !== 'false' && String(p.inscrit_mh).toLowerCase() !== 'non')
            rows.push(['Inscrit MH', 'Oui']);
        if (p.classe_mh && String(p.classe_mh).toLowerCase() !== 'false' && String(p.classe_mh).toLowerCase() !== 'non')
            rows.push(['Classe MH', 'Oui']);
        return rows;
    }

    // Detail builders per layer — each returns an array of { label, rows } groups
    var detailBuilders = {
        'bassin-minier': function (p) {
            return buildDetail(p.nom || 'Bassin minier', [
                { label: 'Caracteristiques', rows: [
                    p.surface_km2 && ['Surface', p.surface_km2 + ' km\u00b2'],
                    p.population && ['Population', p.population.toLocaleString('fr-FR')]
                ]}
            ]);
        },
        'bien-inscrit': function (p) {
            return buildDetail(p.nom || 'Bien inscrit UNESCO', [
                { label: 'Identification', rows: [
                    p.section && ['Section', p.section],
                    p.no_element && ['Element', p.no_element]
                ]},
                { label: 'Caracteristiques', rows: [
                    p.surface_ha && ['Surface', p.surface_ha + ' ha']
                ]}
            ]);
        },
        'zone-tampon': function (p) {
            return buildDetail('Zone tampon', [
                { label: 'Identification', rows: [
                    p.id && ['ID', p.id]
                ]},
                { label: 'Caracteristiques', rows: [
                    p.surface_ha && ['Surface', p.surface_ha + ' ha']
                ]}
            ]);
        },
        'cites-minieres': function (p) {
            return buildDetail(p.nom || 'Cite miniere', [
                { label: 'Localisation', rows: [
                    p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2])]
                ]},
                { label: 'Identification', rows: [
                    p.type && ['Type', p.type],
                    p.compagnie && ['Compagnie', p.compagnie],
                    p.interet && ['Interet', p.interet],
                    p.id_unesco && ['ID UNESCO', p.id_unesco]
                ]},
                { label: 'Protection', rows: mhRows(p) }
            ]);
        },
        'batis': function (p) {
            return buildDetail(p.denomination || 'Bati minier', [
                { label: 'Localisation', rows: [
                    p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2])]
                ]},
                { label: 'Identification', rows: [
                    p.typologie && ['Typologie', p.typologie],
                    p.id_unesco && ['ID UNESCO', p.id_unesco]
                ]},
                { label: 'Protection', rows: mhRows(p) }
            ]);
        },
        'cavaliers': function (p) {
            var communes = joinNotNull([
                p.commune_1, p.commune_2, p.commune_3,
                p.commune_4, p.commune_5, p.commune_6
            ]);
            return buildDetail('Cavalier minier', [
                { label: 'Localisation', rows: [
                    communes && ['Communes', communes]
                ]},
                { label: 'Caracteristiques', rows: [
                    p.longueur_m && ['Longueur', Math.round(p.longueur_m) + ' m']
                ]},
                { label: 'Identification', rows: [
                    p.id_unesco && ['ID UNESCO', p.id_unesco]
                ]}
            ]);
        },
        'espace-neonaturel': function (p) {
            return buildDetail(p.nom || 'Espace neo-naturel', [
                { label: 'Localisation', rows: [
                    p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2])]
                ]},
                { label: 'Identification', rows: [
                    p.id_unesco && ['ID UNESCO', p.id_unesco]
                ]}
            ]);
        },
        'terrils': function (p) {
            return buildDetail(p.nom || 'Terril', [
                { label: 'Localisation', rows: [
                    p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2, p.commune_3])]
                ]},
                { label: 'Identification', rows: [
                    p.no_terril && ['N\u00b0 Terril', p.no_terril],
                    p.compagnie && ['Compagnie', p.compagnie],
                    p.groupe && ['Groupe', p.groupe],
                    p.id_unesco && ['ID UNESCO', p.id_unesco]
                ]},
                { label: 'Caracteristiques', rows: [
                    p.forme && ['Forme', p.forme]
                ]}
            ]);
        },
        'puits-de-mines': function (p) {
            var title = 'Puits';
            if (p.fosse) {
                title = 'Fosse ' + p.fosse;
                if (p.fosse_alias) title += ' (' + p.fosse_alias + ')';
            }
            return buildDetail(title, [
                { label: 'Localisation', rows: [
                    p.commune && ['Commune', p.commune],
                    p.concession && ['Concession', p.concession]
                ]},
                { label: 'Identification', rows: [
                    p.puits && ['Puits', p.puits],
                    p.compagnie && ['Compagnie', p.compagnie]
                ]},
                { label: 'Caracteristiques', rows: [
                    p.profondeur && ['Profondeur', Math.round(p.profondeur) + ' m'],
                    p.cote && ['Cote', Math.round(p.cote) + ' m']
                ]},
                { label: 'Historique', rows: [
                    p.creusement && ['Creusement', p.creusement],
                    p.fermeture && ['Fermeture', p.fermeture]
                ]},
                { label: 'Liens', rows: [
                    p.brgm && ['Fiche BRGM', rawHtml('<a href="' + encodeURI(p.brgm) + '" target="_blank" rel="noopener">Voir</a>')]
                ]}
            ]);
        }
    };

    function joinNotNull(arr) {
        return arr.filter(function (v) { return v && v !== 'None'; }).join(', ');
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

    function buildDetail(title, groups) {
        var html = '<h3>' + escapeHtml(title) + '</h3>';
        groups.forEach(function (group) {
            // Filter out falsy rows (from conditional && expressions)
            var rows = group.rows.filter(Boolean);
            if (rows.length === 0) return;
            html += '<h4>' + escapeHtml(group.label) + '</h4>';
            html += '<table>';
            rows.forEach(function (row) {
                html += '<tr><td>' + escapeHtml(row[0]) + '</td><td>' + renderValue(row[1]) + '</td></tr>';
            });
            html += '</table>';
        });
        return html;
    }

    // Layer definitions grouped (render order: first group/layer = bottom)
    // active: whether the layer is visible by default
    var layerGroups = [
        { group: 'Patrimoine mondial UNESCO', layers: [
            { id: 'batis', label: 'Batis', file: 'data/batis.geojson', active: true },
            { id: 'bien-inscrit', label: 'Bien inscrit', file: 'data/bien-inscrit.geojson', active: true },
            { id: 'cavaliers', label: 'Cavaliers', file: 'data/cavaliers.geojson', active: true },
            { id: 'cites-minieres', label: 'Cites minieres', file: 'data/cites-minieres.geojson', active: true },
            { id: 'espace-neonaturel', label: 'Espaces neo-naturels', file: 'data/espace-neonaturel.geojson', active: true },
            { id: 'terrils', label: 'Terrils', file: 'data/terrils.geojson', active: true },
            { id: 'zone-tampon', label: 'Zone tampon', file: 'data/zone-tampon.geojson', active: true }
        ]},
        { group: 'Inventaire minier', layers: [
            { id: 'puits-de-mines', label: 'Puits de mines', file: 'data/puits-de-mines.geojson', active: false }
        ]},
        { group: 'Perimetre', layers: [
            { id: 'bassin-minier', label: 'Bassin minier (ERBM)', file: 'data/bassin-minier.geojson', active: true }
        ]}
    ];

    // Flatten for loading
    var allLayerDefs = [];
    layerGroups.forEach(function (g) {
        g.layers.forEach(function (def) { allLayerDefs.push(def); });
    });

    // Base layer picker control (bottom-left button + popup panel)
    var BaseLayerPicker = L.Control.extend({
        options: { position: 'bottomleft' },
        initialize: function (baseLayers, options) {
            L.Util.setOptions(this, options);
            this._baseLayers = baseLayers;
        },
        onAdd: function () {
            var wrapper = L.DomUtil.create('div', 'base-layer-picker');
            L.DomEvent.disableClickPropagation(wrapper);
            L.DomEvent.disableScrollPropagation(wrapper);
            var self = this;

            // Toggle button — shows thumbnail of current base layer
            var toggle = L.DomUtil.create('button', 'base-layer-toggle', wrapper);
            toggle.type = 'button';
            toggle.title = 'Fond de carte';
            toggle.setAttribute('aria-label', 'Fond de carte');

            var toggleThumb = L.DomUtil.create('img', 'base-layer-toggle-thumb', toggle);
            var toggleLabel = L.DomUtil.create('span', 'base-layer-toggle-label', toggle);

            // Set initial state from active layer
            var activeName = Object.keys(this._baseLayers).find(function (n) {
                return self._map.hasLayer(self._baseLayers[n]);
            }) || Object.keys(this._baseLayers)[0];
            toggleThumb.src = baseLayerThumbnails[activeName];
            toggleThumb.alt = '';
            toggleLabel.textContent = activeName;

            // Popup panel
            var panel = L.DomUtil.create('div', 'base-layer-panel', wrapper);
            var panelTitle = L.DomUtil.create('div', 'base-layer-panel-title', panel);
            panelTitle.textContent = 'Fond de carte';
            var cardList = L.DomUtil.create('div', 'base-layer-cards', panel);

            var baseCards = [];
            Object.keys(this._baseLayers).forEach(function (name) {
                var card = L.DomUtil.create('button', 'base-layer-card', cardList);
                var isActive = name === activeName;
                if (isActive) card.classList.add('active');
                card.type = 'button';
                card.setAttribute('aria-pressed', isActive);
                if (baseLayerThumbnails[name]) {
                    var thumb = L.DomUtil.create('img', 'base-layer-card-thumb', card);
                    thumb.src = baseLayerThumbnails[name];
                    thumb.alt = name;
                    thumb.loading = 'lazy';
                }
                var cardLabel = L.DomUtil.create('span', 'base-layer-card-label', card);
                cardLabel.textContent = name;
                baseCards.push(card);
                card.addEventListener('click', function () {
                    Object.keys(self._baseLayers).forEach(function (n) {
                        self._map.removeLayer(self._baseLayers[n]);
                    });
                    self._baseLayers[name].addTo(self._map);
                    baseCards.forEach(function (c) {
                        c.classList.remove('active');
                        c.setAttribute('aria-pressed', 'false');
                    });
                    card.classList.add('active');
                    card.setAttribute('aria-pressed', 'true');
                    toggleThumb.src = baseLayerThumbnails[name];
                    toggleLabel.textContent = name;
                    panel.classList.remove('open');
                    self._map.fire('baselayerchange', { name: name, layer: self._baseLayers[name] });
                });
            });

            toggle.addEventListener('click', function () {
                panel.classList.toggle('open');
            });

            // Close panel when clicking elsewhere on the map
            this._map.on('click', function () {
                panel.classList.remove('open');
            });

            return wrapper;
        }
    });

    // Grouped layer control (overlays only)
    var GroupedLayerControl = L.Control.extend({
        options: { position: 'topright', collapsed: false },
        initialize: function (layerGroups, options) {
            L.Util.setOptions(this, options);
            this._layerGroups = layerGroups;
            this._layerMap = {};
        },
        onAdd: function () {
            var container = L.DomUtil.create('div', 'leaflet-control-layers leaflet-control-layers-expanded grouped-layers');
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);
            var self = this;

            // Overlay groups
            this._layerGroups.forEach(function (g) {
                var groupLabel = L.DomUtil.create('label', 'grouped-layers-group', container);
                var groupInput = L.DomUtil.create('input', '', groupLabel);
                groupInput.type = 'checkbox';
                groupInput.checked = g.layers.some(function (d) { return d.active !== false; });
                var groupSpan = L.DomUtil.create('span', '', groupLabel);
                groupSpan.textContent = ' ' + g.group;

                var groupList = L.DomUtil.create('div', 'grouped-layers-list', container);
                var layerInputs = [];

                g.layers.forEach(function (def) {
                    var label = L.DomUtil.create('label', 'grouped-layers-item', groupList);
                    var input = L.DomUtil.create('input', '', label);
                    input.type = 'checkbox';
                    input.checked = def.active !== false;
                    label.style.setProperty('--layer-color', styles[def.id].fillColor || styles[def.id].color);
                    self._layerMap[def.id] = input;
                    layerInputs.push({ input: input, def: def });
                    var span = L.DomUtil.create('span', '', label);
                    span.textContent = ' ' + def.label;
                    input.addEventListener('change', function () {
                        if (!def._leafletLayer) return;
                        if (input.checked) {
                            def._leafletLayer.addTo(self._map);
                        } else {
                            self._map.removeLayer(def._leafletLayer);
                        }
                        // Update group checkbox state
                        var allChecked = layerInputs.every(function (li) { return li.input.checked; });
                        var someChecked = layerInputs.some(function (li) { return li.input.checked; });
                        groupInput.checked = someChecked;
                        groupInput.indeterminate = someChecked && !allChecked;
                    });
                });

                groupInput.addEventListener('change', function () {
                    var checked = groupInput.checked;
                    groupInput.indeterminate = false;
                    layerInputs.forEach(function (li) {
                        li.input.checked = checked;
                        if (!li.def._leafletLayer) return;
                        if (checked) {
                            li.def._leafletLayer.addTo(self._map);
                        } else {
                            self._map.removeLayer(li.def._leafletLayer);
                        }
                    });
                });
            });

            return container;
        }
    });

    var baseLayerPicker = new BaseLayerPicker(baseLayers);
    baseLayerPicker.addTo(map);

    var overlayControl = new GroupedLayerControl(layerGroups);

    var boundsGroup = L.featureGroup();
    var loadedCount = 0;

    allLayerDefs.forEach(function (def) {
        fetch(def.file)
            .then(function (response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(function (geojson) {
                var layerOpts = {
                    style: function () {
                        return styles[def.id];
                    },
                    onEachFeature: function (feature, layer) {
                        var builder = detailBuilders[def.id];
                        if (builder) {
                            layer.on('click', function () {
                                showDetail(builder(feature.properties));
                            });
                        }
                    }
                };
                if (styles[def.id] && styles[def.id].radius) {
                    layerOpts.pointToLayer = function (feature, latlng) {
                        return L.circleMarker(latlng, styles[def.id]);
                    };
                }
                var layer = L.geoJSON(geojson, layerOpts);
                def._leafletLayer = layer;

                if (def.active !== false) {
                    layer.addTo(map);
                }
                boundsGroup.addLayer(layer);

                loadedCount++;
                if (loadedCount === allLayerDefs.length) {
                    overlayControl.addTo(map);
                    if (boundsGroup.getBounds().isValid()) {
                        map.fitBounds(boundsGroup.getBounds(), { padding: [20, 20] });
                    }
                }
            })
            .catch(function (err) {
                console.warn('Failed to load ' + def.file + ':', err);
                loadedCount++;
                if (loadedCount === allLayerDefs.length) {
                    overlayControl.addTo(map);
                    if (boundsGroup.getBounds().isValid()) {
                        map.fitBounds(boundsGroup.getBounds(), { padding: [20, 20] });
                    }
                }
            });
    });
})();
