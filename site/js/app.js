(function () {
    'use strict';

    // Map initialization
    var map = L.map('map', { zoomControl: false }).setView([50.35, 2.8], 10);

    // Base layers
    var ignPlan = L.tileLayer('https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
        attribution: '&copy; <a href="https://www.ign.fr/">IGN</a>',
        maxZoom: 18
    });

    var cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    });

    var esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="https://www.esri.com">Esri</a>, Maxar, Earthstar Geographics',
        maxZoom: 18
    });

    var baseLayers = {
        'IGN': ignPlan,
        'Clair': cartoPositron,
        'Satellite': esriSatellite
    };

    var baseLayerThumbnails = {
        'IGN': 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX=10&TILEROW=345&TILECOL=520',
        'Clair': 'https://a.basemaps.cartocdn.com/light_all/10/520/345.png',
        'Satellite': 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/10/345/520'
    };

    cartoPositron.addTo(map);

    // Title overlay control
    var TitleControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function () {
            var div = L.DomUtil.create('div', 'title-overlay');
            div.innerHTML = '<h1>Bassin Minier du Nord-Pas de Calais</h1>' +
                '<p>Patrimoine mondial de l\'UNESCO — Paysage culturel évolutif vivant, inscrit en 2012</p>';
            L.DomEvent.disableClickPropagation(div);
            return div;
        }
    });
    new TitleControl().addTo(map);

    // Data source attribution
    map.attributionControl.addAttribution(
        'Données <a href="https://www.missionbassinminier.org">Mission Bassin Minier</a> — <a href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/">Licence ETALAB v2.0</a>'
    );

    // Layer styles
    var styles = {
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
            radius: 5,
            color: '#4A235A',
            weight: 1.5,
            fillColor: '#7D3C98',
            fillOpacity: 0.7,
            opacity: 0.9
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

    // Hover highlight styles per layer
    function getHoverStyle(layerId) {
        var base = styles[layerId];
        if (base.radius) {
            return { radius: base.radius + 2, weight: 3, fillOpacity: 0.9 };
        }
        return { weight: (base.weight || 2) + 2, fillOpacity: Math.min((base.fillOpacity || 0.2) + 0.2, 0.8) };
    }

    // Tooltip text per layer
    var tooltipText = {
        'bassin-minier': function (p) { return p.nom; },
        'bien-inscrit': function (p) { return p.nom; },
        'zone-tampon': function (p) { return 'Zone tampon' + (p.id ? ' ' + p.id : ''); },
        'cites-minieres': function (p) { return p.nom; },
        'batis': function (p) { return p.denomination || p.nom; },
        'cavaliers': function (p) { return 'Cavalier' + (p.id_unesco ? ' ' + p.id_unesco : ''); },
        'espace-neonaturel': function (p) { return p.nom; },
        'terrils': function (p) { return p.nom || ('Terril ' + (p.no_terril || '')); },
        'puits-de-mines': function (p) { return p.fosse ? 'Fosse ' + p.fosse : 'Puits'; },
        'communes-mbm': function (p) { return p.nom; },
        'zt-cavaliers': function (p) { return p.nom || 'Cavalier (ZT)'; },
        'zt-cites-minieres': function (p) { return p.nom; },
        'zt-espaces-neonaturels': function (p) { return p.nom; },
        'zt-terrils': function (p) { return p.nom || 'Terril (ZT)'; },
        'zt-parvis-agricoles': function (p) { return 'Parvis agricole' + (p.id ? ' ' + p.id : ''); }
    };

    // Detail panel
    var detailPanel = document.getElementById('detail-panel');
    var detailContent = document.getElementById('detail-content');
    var detailClose = document.getElementById('detail-close');

    function showDetail(html) {
        detailContent.innerHTML = html;
        detailPanel.classList.add('open');
        map.invalidateSize();
    }

    function hideDetail() {
        detailPanel.classList.remove('open');
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
            return buildDetail(p.nom || 'Bassin minier', 'bassin-minier', [
                {
                    label: 'Caracteristiques', rows: [
                        p.surface_km2 && ['Surface', p.surface_km2 + ' km\u00b2'],
                        p.population && ['Population', p.population.toLocaleString('fr-FR')]
                    ]
                }
            ]);
        },
        'bien-inscrit': function (p) {
            return buildDetail(p.nom || 'Bien inscrit UNESCO', 'bien-inscrit', [
                {
                    label: 'Identification', rows: [
                        p.section && ['Section', p.section],
                        p.no_element && ['Element', p.no_element]
                    ]
                },
                {
                    label: 'Caracteristiques', rows: [
                        p.surface_ha && ['Surface', p.surface_ha + ' ha']
                    ]
                }
            ]);
        },
        'zone-tampon': function (p) {
            return buildDetail('Zone tampon', 'zone-tampon', [
                {
                    label: 'Identification', rows: [
                        p.id && ['ID', p.id]
                    ]
                },
                {
                    label: 'Caracteristiques', rows: [
                        p.surface_ha && ['Surface', p.surface_ha + ' ha']
                    ]
                }
            ]);
        },
        'cites-minieres': function (p) {
            var nom = p.nom || 'Cite miniere';
            if (p.nom_2) nom += ' / ' + p.nom_2;
            return buildDetail(nom, 'cites-minieres', [
                {
                    label: 'Localisation', rows: [
                        p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2, p.commune_3])]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.type && ['Type', p.type],
                        p.compagnie && ['Compagnie', p.compagnie],
                        p.interet && ['Interet', p.interet],
                        p.proprietaire && ['Proprietaire', p.proprietaire],
                        p.id_unesco && ['ID UNESCO', p.id_unesco],
                        p.id_lsm && ['ID LSM', p.id_lsm]
                    ]
                },
                { label: 'Protection', rows: mhRows(p) }
            ]);
        },
        'batis': function (p) {
            return buildDetail(p.denomination || p.nom || 'Bati minier', 'batis', [
                {
                    label: 'Localisation', rows: [
                        p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2])]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.typologie && ['Typologie', p.typologie],
                        p.compagnie && ['Compagnie', p.compagnie],
                        p.periode && ['Periode', p.periode],
                        p.proprietaire && ['Proprietaire', p.proprietaire],
                        p.id_unesco && ['ID UNESCO', p.id_unesco]
                    ]
                },
                {
                    label: 'Protection', rows: [
                        p.protection && p.protection !== 'non' && ['Protection', p.protection]
                    ].concat(mhRows(p))
                }
            ]);
        },
        'cavaliers': function (p) {
            var communes = joinNotNull([
                p.commune_1, p.commune_2, p.commune_3,
                p.commune_4, p.commune_5, p.commune_6
            ]);
            return buildDetail('Cavalier minier', 'cavaliers', [
                {
                    label: 'Localisation', rows: [
                        communes && ['Communes', communes]
                    ]
                },
                {
                    label: 'Caracteristiques', rows: [
                        p.longueur_m && ['Longueur', Math.round(p.longueur_m) + ' m']
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.id_unesco && ['ID UNESCO', p.id_unesco]
                    ]
                }
            ]);
        },
        'espace-neonaturel': function (p) {
            return buildDetail(p.nom || 'Espace neo-naturel', 'espace-neonaturel', [
                {
                    label: 'Localisation', rows: [
                        p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2])]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.id_unesco && ['ID UNESCO', p.id_unesco]
                    ]
                }
            ]);
        },
        'terrils': function (p) {
            return buildDetail(p.nom || 'Terril', 'terrils', [
                {
                    label: 'Localisation', rows: [
                        p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2, p.commune_3])]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.no_terril && ['N\u00b0 Terril', p.no_terril],
                        p.compagnie && ['Compagnie', p.compagnie],
                        p.groupe && ['Groupe', p.groupe],
                        p.id_unesco && ['ID UNESCO', p.id_unesco]
                    ]
                },
                {
                    label: 'Caracteristiques', rows: [
                        p.forme && ['Forme', p.forme]
                    ]
                }
            ]);
        },
        'communes-mbm': function (p) {
            return buildDetail(p.nom || 'Commune', 'communes-mbm', [
                {
                    label: 'Identification', rows: [
                        p.insee && ['INSEE', p.insee],
                        p.statut && ['Statut', p.statut]
                    ]
                },
                {
                    label: 'Caracteristiques', rows: [
                        p.population && ['Population', Number(p.population).toLocaleString('fr-FR')],
                        p.surface_km2 && ['Surface', Number(p.surface_km2).toFixed(1) + ' km\u00b2']
                    ]
                }
            ]);
        },
        'zt-cavaliers': function (p) {
            var communes = joinNotNull([p.commune_1, p.commune_2, p.commune_3, p.commune_4]);
            return buildDetail(p.nom || 'Cavalier (zone tampon)', 'zt-cavaliers', [
                {
                    label: 'Localisation', rows: [
                        communes && ['Communes', communes]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.id_troncon && ['Troncon', p.id_troncon]
                    ]
                }
            ]);
        },
        'zt-cites-minieres': function (p) {
            var nom = p.nom || 'Cite miniere (zone tampon)';
            if (p.nom_2) nom += ' / ' + p.nom_2;
            return buildDetail(nom, 'zt-cites-minieres', [
                {
                    label: 'Localisation', rows: [
                        p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2, p.commune_3])]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.type && ['Type', p.type],
                        p.compagnie && ['Compagnie', p.compagnie],
                        p.interet && ['Interet', p.interet],
                        p.proprietaire && ['Proprietaire', p.proprietaire]
                    ]
                }
            ]);
        },
        'zt-espaces-neonaturels': function (p) {
            return buildDetail(p.nom || 'Espace neo-naturel (zone tampon)', 'zt-espaces-neonaturels', [
                {
                    label: 'Localisation', rows: [
                        p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2, p.commune_3])]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.id && ['ID', p.id]
                    ]
                }
            ]);
        },
        'zt-terrils': function (p) {
            var nom = p.nom || 'Terril (zone tampon)';
            if (p.nom_usuel) nom += ' (' + p.nom_usuel + ')';
            return buildDetail(nom, 'zt-terrils', [
                {
                    label: 'Localisation', rows: [
                        p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2, p.commune_3])]
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
                }
            ]);
        },
        'zt-parvis-agricoles': function (p) {
            return buildDetail('Parvis agricole', 'zt-parvis-agricoles', [
                {
                    label: 'Identification', rows: [
                        p.id && ['ID', p.id]
                    ]
                },
                {
                    label: 'Caracteristiques', rows: [
                        p.qualite_vue && ['Qualite de vue', p.qualite_vue],
                        p.vue_sur && ['Vue sur', p.vue_sur]
                    ]
                }
            ]);
        },
        'puits-de-mines': function (p) {
            var title = 'Puits';
            if (p.fosse) {
                title = 'Fosse ' + p.fosse;
                if (p.fosse_alias) title += ' (' + p.fosse_alias + ')';
            }
            return buildDetail(title, 'puits-de-mines', [
                {
                    label: 'Localisation', rows: [
                        p.commune && ['Commune', p.commune],
                        p.concession && ['Concession', p.concession]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.puits && ['Puits', p.puits],
                        p.compagnie && ['Compagnie', p.compagnie]
                    ]
                },
                {
                    label: 'Caracteristiques', rows: [
                        p.profondeur && ['Profondeur', Math.round(p.profondeur) + ' m'],
                        p.cote && ['Cote', Math.round(p.cote) + ' m']
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
                        p.brgm && ['Fiche BRGM', rawHtml('<a href="' + encodeURI(p.brgm) + '" target="_blank" rel="noopener">Voir</a>')]
                    ]
                }
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

    function buildDetail(title, layerId, groups) {
        var color = styles[layerId] ? (styles[layerId].fillColor || styles[layerId].color) : '#888';
        var html = '<h3><span class="detail-layer-badge" style="background:' + color + '"></span>' + escapeHtml(title) + '</h3>';
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
            group: 'Zone tampon', layers: [
                { id: 'zt-cavaliers', label: 'Cavaliers', file: 'data/zt-cavaliers.geojson', active: false },
                { id: 'zt-cites-minieres', label: 'Cites minieres', file: 'data/zt-cites-minieres.geojson', active: false },
                { id: 'zt-espaces-neonaturels', label: 'Espaces neo-naturels', file: 'data/zt-espaces-neonaturels.geojson', active: false },
                { id: 'zt-terrils', label: 'Terrils', file: 'data/zt-terrils.geojson', active: false },
                { id: 'zt-parvis-agricoles', label: 'Parvis agricoles', file: 'data/zt-parvis-agricoles.geojson', active: false }
            ]
        },
        {
            group: 'Inventaire minier', layers: [
                { id: 'puits-de-mines', label: 'Puits de mines', file: 'data/puits-de-mines.geojson', active: false }
            ]
        },
    ];

    // Context layers displayed in a separate picker (like fond de carte)
    var contextLayers = [
        { id: 'bassin-minier', label: 'Bassin minier (ERBM)', file: 'data/bassin-minier.geojson', active: true },
        { id: 'communes-mbm', label: 'Communes', file: 'data/communes-mbm.geojson', active: false }
    ];

    // Flatten for loading
    var allLayerDefs = [];
    layerGroups.forEach(function (g) {
        g.layers.forEach(function (def) { allLayerDefs.push(def); });
    });
    contextLayers.forEach(function (def) { allLayerDefs.push(def); });

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

    // Context layer picker (bottom-left, next to base layer picker)
    var ContextLayerPicker = L.Control.extend({
        options: { position: 'bottomleft' },
        initialize: function (layers, options) {
            L.Util.setOptions(this, options);
            this._layers = layers;
        },
        onAdd: function () {
            var wrapper = L.DomUtil.create('div', 'context-layer-picker');
            L.DomEvent.disableClickPropagation(wrapper);
            L.DomEvent.disableScrollPropagation(wrapper);
            var self = this;

            // Toggle button with layers icon
            var toggle = L.DomUtil.create('button', 'context-layer-toggle', wrapper);
            toggle.type = 'button';
            toggle.title = 'Couches de contexte';
            toggle.setAttribute('aria-label', 'Couches de contexte');
            toggle.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';

            // Popup panel
            var panel = L.DomUtil.create('div', 'context-layer-panel', wrapper);
            var panelTitle = L.DomUtil.create('div', 'context-layer-panel-title', panel);
            panelTitle.textContent = 'Couches de contexte';
            var list = L.DomUtil.create('div', 'context-layer-list', panel);

            this._layers.forEach(function (def) {
                var item = L.DomUtil.create('label', 'context-layer-item', list);
                var color = styles[def.id].fillColor || styles[def.id].color;

                var cb = L.DomUtil.create('input', 'context-layer-checkbox', item);
                cb.type = 'checkbox';
                cb.checked = def.active !== false;
                item.style.setProperty('--layer-color', color);

                var swatch = L.DomUtil.create('span', 'context-layer-swatch', item);
                swatch.style.background = color;

                var labelText = L.DomUtil.create('span', 'context-layer-label', item);
                labelText.textContent = def.label;

                cb.addEventListener('change', function () {
                    if (!def._leafletLayer) return;
                    if (cb.checked) {
                        def._leafletLayer.addTo(self._map);
                    } else {
                        self._map.removeLayer(def._leafletLayer);
                    }
                    // Sync bassin-minier mask
                    if (def.id === 'bassin-minier' && bassinMask) {
                        if (cb.checked) {
                            bassinMask.addTo(self._map);
                        } else {
                            self._map.removeLayer(bassinMask);
                        }
                    }
                });
            });

            toggle.addEventListener('click', function () {
                panel.classList.toggle('open');
            });

            this._map.on('click', function () {
                panel.classList.remove('open');
            });

            return wrapper;
        }
    });

    // Grouped layer control (overlays only) with collapsible groups and feature counts
    var GroupedLayerControl = L.Control.extend({
        options: { position: 'topright', collapsed: false },
        initialize: function (layerGroups, options) {
            L.Util.setOptions(this, options);
            this._layerGroups = layerGroups;
            this._layerMap = {};
            this._countSpans = {};
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

                // Collapse/expand toggle arrow
                var toggleArrow = L.DomUtil.create('span', 'group-toggle', groupLabel);
                toggleArrow.textContent = '\u25BC';

                var groupSpan = L.DomUtil.create('span', '', groupLabel);
                groupSpan.textContent = ' ' + g.group;

                var groupList = L.DomUtil.create('div', 'grouped-layers-list', container);
                // Calculate natural height for animation
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

                    // Feature count badge
                    var countSpan = L.DomUtil.create('span', 'layer-count', label);
                    self._countSpans[def.id] = countSpan;

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

                // Collapse/expand behavior
                // Start inactive groups collapsed
                var isCollapsed = !g.layers.some(function (d) { return d.active !== false; });
                if (isCollapsed) {
                    groupList.classList.add('collapsed');
                    toggleArrow.classList.add('collapsed');
                }
                // Set initial max-height for animation
                requestAnimationFrame(function () {
                    if (!groupList.classList.contains('collapsed')) {
                        groupList.style.maxHeight = groupList.scrollHeight + 'px';
                    }
                });

                toggleArrow.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (groupList.classList.contains('collapsed')) {
                        groupList.classList.remove('collapsed');
                        toggleArrow.classList.remove('collapsed');
                        groupList.style.maxHeight = groupList.scrollHeight + 'px';
                    } else {
                        groupList.style.maxHeight = groupList.scrollHeight + 'px';
                        // Force reflow
                        groupList.offsetHeight; // eslint-disable-line no-unused-expressions
                        groupList.classList.add('collapsed');
                        toggleArrow.classList.add('collapsed');
                    }
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
        },
        updateCount: function (layerId, count) {
            if (this._countSpans[layerId]) {
                this._countSpans[layerId].textContent = '(' + count + ')';
            }
        }
    });

    // Search control with clear button
    var searchableProps = {
        'bassin-minier': { title: function (p) { return p.nom; }, meta: function () { return 'Perimetre'; }, text: ['nom'] },
        'bien-inscrit': { title: function (p) { return p.nom; }, meta: function (p) { return 'Bien inscrit' + (p.section ? ' - ' + p.section : ''); }, text: ['nom', 'section'] },
        'zone-tampon': { title: function (p) { return 'Zone tampon ' + (p.id || ''); }, meta: function () { return 'Zone tampon'; }, text: ['id'] },
        'cites-minieres': { title: function (p) { return p.nom; }, meta: function (p) { return joinNotNull([p.commune_1, p.commune_2, p.commune_3]) || 'Cite miniere'; }, text: ['nom', 'nom_2', 'commune_1', 'commune_2', 'commune_3', 'compagnie', 'proprietaire'] },
        'batis': { title: function (p) { return p.denomination || p.nom; }, meta: function (p) { return joinNotNull([p.commune_1, p.commune_2]) || 'Bati minier'; }, text: ['denomination', 'nom', 'commune_1', 'commune_2', 'typologie', 'compagnie', 'proprietaire'] },
        'cavaliers': { title: function (p) { return 'Cavalier' + (p.id_unesco ? ' ' + p.id_unesco : ''); }, meta: function (p) { return joinNotNull([p.commune_1, p.commune_2, p.commune_3]) || 'Cavalier'; }, text: ['commune_1', 'commune_2', 'commune_3', 'commune_4', 'commune_5', 'commune_6', 'id_unesco'] },
        'espace-neonaturel': { title: function (p) { return p.nom; }, meta: function (p) { return joinNotNull([p.commune_1, p.commune_2]) || 'Espace neo-naturel'; }, text: ['nom', 'commune_1', 'commune_2'] },
        'terrils': { title: function (p) { return p.nom || 'Terril ' + (p.no_terril || ''); }, meta: function (p) { return joinNotNull([p.commune_1, p.commune_2]) || 'Terril'; }, text: ['nom', 'no_terril', 'commune_1', 'commune_2', 'compagnie'] },
        'puits-de-mines': { title: function (p) { return p.fosse ? 'Fosse ' + p.fosse + (p.fosse_alias ? ' (' + p.fosse_alias + ')' : '') : 'Puits'; }, meta: function (p) { return p.commune || 'Puits de mine'; }, text: ['fosse', 'fosse_alias', 'puits', 'commune', 'compagnie', 'concession'] },
        'communes-mbm': { title: function (p) { return p.nom; }, meta: function (p) { return 'Commune' + (p.population ? ' - pop. ' + Number(p.population).toLocaleString('fr-FR') : ''); }, text: ['nom', 'insee'] },
        'zt-cavaliers': { title: function (p) { return p.nom || 'Cavalier (ZT)'; }, meta: function (p) { return joinNotNull([p.commune_1, p.commune_2]) || 'Cavalier (zone tampon)'; }, text: ['nom', 'commune_1', 'commune_2', 'commune_3', 'commune_4', 'id_troncon'] },
        'zt-cites-minieres': { title: function (p) { return p.nom; }, meta: function (p) { return joinNotNull([p.commune_1, p.commune_2]) || 'Cite miniere (zone tampon)'; }, text: ['nom', 'nom_2', 'commune_1', 'commune_2', 'compagnie'] },
        'zt-espaces-neonaturels': { title: function (p) { return p.nom; }, meta: function (p) { return joinNotNull([p.commune_1, p.commune_2]) || 'Espace neo-naturel (zone tampon)'; }, text: ['nom', 'commune_1', 'commune_2'] },
        'zt-terrils': { title: function (p) { return p.nom || 'Terril (ZT)'; }, meta: function (p) { return joinNotNull([p.commune_1, p.commune_2]) || 'Terril (zone tampon)'; }, text: ['nom', 'nom_usuel', 'commune_1', 'commune_2'] },
        'zt-parvis-agricoles': { title: function (p) { return 'Parvis agricole ' + (p.id || ''); }, meta: function (p) { return p.qualite_vue || 'Parvis agricole'; }, text: ['id', 'qualite_vue', 'vue_sur'] }
    };

    // Build search index after all layers loaded
    var searchIndex = [];

    function buildSearchIndex() {
        allLayerDefs.forEach(function (def) {
            if (!def._leafletLayer) return;
            var config = searchableProps[def.id];
            if (!config) return;
            def._leafletLayer.eachLayer(function (layer) {
                var props = layer.feature.properties;
                var title = config.title(props) || '';
                if (!title) return;
                var searchText = config.text.map(function (key) {
                    return props[key] ? String(props[key]) : '';
                }).join(' ').toLowerCase();
                searchIndex.push({
                    title: title,
                    meta: config.meta(props),
                    searchText: searchText,
                    layer: layer,
                    layerId: def.id,
                    def: def
                });
            });
        });
    }

    var SearchControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function () {
            var container = L.DomUtil.create('div', 'search-control');
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            var inputWrapper = L.DomUtil.create('div', 'search-input-wrapper', container);
            var input = L.DomUtil.create('input', '', inputWrapper);
            input.type = 'text';
            input.placeholder = 'Rechercher un lieu...';
            input.setAttribute('aria-label', 'Rechercher');

            // Clear button
            var clearBtn = L.DomUtil.create('button', 'search-clear', inputWrapper);
            clearBtn.type = 'button';
            clearBtn.innerHTML = '&times;';
            clearBtn.title = 'Effacer';
            clearBtn.setAttribute('aria-label', 'Effacer la recherche');

            var results = L.DomUtil.create('div', 'search-results', container);
            var activeIndex = -1;
            var previewLayer = null;
            var previewLayerId = null;

            function previewHighlight(item) {
                previewUnhighlight();
                if (item && item.layer) {
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
            }

            function previewUnhighlight() {
                if (previewLayer) {
                    if (previewLayer.setStyle && previewLayerId) {
                        previewLayer.setStyle(styles[previewLayerId]);
                    }
                    if (previewLayer.getTooltip && previewLayer.getTooltip()) {
                        previewLayer.closeTooltip();
                    }
                    previewLayer = null;
                    previewLayerId = null;
                }
            }

            function updateClearBtn() {
                if (input.value.length > 0) {
                    clearBtn.classList.add('visible');
                    input.classList.add('expanded');
                } else {
                    clearBtn.classList.remove('visible');
                }
            }

            input.addEventListener('focus', function () {
                input.classList.add('expanded');
            });

            input.addEventListener('blur', function () {
                if (input.value.length === 0) {
                    input.classList.remove('expanded');
                }
            });

            function clearResults() {
                previewUnhighlight();
                results.innerHTML = '';
                results.classList.remove('open');
                activeIndex = -1;
            }

            function showResults(items) {
                results.innerHTML = '';
                activeIndex = -1;
                if (items.length === 0) {
                    if (input.value.trim().length >= 2) {
                        results.innerHTML = '<div class="search-no-results">Aucun resultat</div>';
                        results.classList.add('open');
                    } else {
                        results.classList.remove('open');
                    }
                    return;
                }
                items.forEach(function (item, idx) {
                    var div = L.DomUtil.create('div', 'search-result-item', results);
                    var color = styles[item.layerId].fillColor || styles[item.layerId].color;
                    div.innerHTML = '<div class="search-result-title"><span class="search-result-layer" style="background:' + color + '"></span>' + escapeHtml(item.title) + '</div>'
                        + '<div class="search-result-meta">' + escapeHtml(item.meta) + '</div>';
                    div.addEventListener('click', function () {
                        selectResult(item);
                    });
                    div.addEventListener('mouseenter', function () {
                        setActive(idx);
                        previewHighlight(item);
                    });
                    div.addEventListener('mouseleave', function () {
                        previewUnhighlight();
                    });
                });
                results.classList.add('open');
            }

            function setActive(idx) {
                var items = results.querySelectorAll('.search-result-item');
                items.forEach(function (el) { el.classList.remove('active'); });
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
                if (!map.hasLayer(item.def._leafletLayer)) {
                    item.def._leafletLayer.addTo(map);
                }

                // Zoom to feature
                if (item.layer.getBounds) {
                    map.fitBounds(item.layer.getBounds(), { padding: [50, 50], maxZoom: 16 });
                } else if (item.layer.getLatLng) {
                    map.setView(item.layer.getLatLng(), 16);
                }

                // Open detail panel
                var builder = detailBuilders[item.layerId];
                if (builder) {
                    showDetail(builder(item.layer.feature.properties));
                }

                // Highlight briefly
                if (item.layer.setStyle) {
                    var origStyle = styles[item.layerId];
                    item.layer.setStyle({ weight: 4, fillOpacity: 0.6 });
                    setTimeout(function () {
                        item.layer.setStyle(origStyle);
                    }, 2000);
                }

                input.blur();
            }

            clearBtn.addEventListener('click', function () {
                input.value = '';
                clearResults();
                updateClearBtn();
                input.focus();
            });

            var debounceTimer;
            input.addEventListener('input', function () {
                clearTimeout(debounceTimer);
                updateClearBtn();
                var query = input.value.trim().toLowerCase();
                if (query.length < 2) {
                    clearResults();
                    return;
                }
                debounceTimer = setTimeout(function () {
                    var terms = query.split(/\s+/);
                    var matches = searchIndex.filter(function (entry) {
                        return terms.every(function (term) {
                            return entry.searchText.indexOf(term) !== -1 || entry.title.toLowerCase().indexOf(term) !== -1;
                        });
                    }).slice(0, 20);
                    showResults(matches);
                }, 150);
            });

            input.addEventListener('keydown', function (e) {
                var items = results.querySelectorAll('.search-result-item');
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActive(Math.min(activeIndex + 1, items.length - 1));
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActive(Math.max(activeIndex - 1, 0));
                } else if (e.key === 'Enter' && activeIndex >= 0) {
                    e.preventDefault();
                    var filtered = searchIndex.filter(function (entry) {
                        var terms = input.value.trim().toLowerCase().split(/\s+/);
                        return terms.every(function (term) {
                            return entry.searchText.indexOf(term) !== -1 || entry.title.toLowerCase().indexOf(term) !== -1;
                        });
                    }).slice(0, 20);
                    if (filtered[activeIndex]) selectResult(filtered[activeIndex]);
                } else if (e.key === 'Escape') {
                    clearResults();
                    input.blur();
                }
            });

            // Close results when clicking elsewhere
            map.on('click', function () {
                clearResults();
            });

            return container;
        }
    });

    // Bottom bar: base layer picker + context layer picker + unified zoom — all side by side
    var BottomBarControl = L.Control.extend({
        options: { position: 'bottomleft' },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'bottom-pickers-bar');
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);

            // Base layer picker
            var blp = new BaseLayerPicker(baseLayers);
            blp._map = map;
            container.appendChild(blp.onAdd(map));

            // Context layer picker
            var clp = new ContextLayerPicker(contextLayers);
            clp._map = map;
            container.appendChild(clp.onAdd(map));

            // Search control
            var sc = new SearchControl();
            sc._map = map;
            container.appendChild(sc.onAdd(map));

            // Unified zoom (zoom in + full extent + zoom out)
            var zoomBar = L.DomUtil.create('div', 'leaflet-bar leaflet-control-zoom unified-zoom', container);

            var zoomIn = L.DomUtil.create('a', 'leaflet-control-zoom-in', zoomBar);
            zoomIn.href = '#';
            zoomIn.title = 'Zoom avant';
            zoomIn.setAttribute('role', 'button');
            zoomIn.setAttribute('aria-label', 'Zoom avant');
            zoomIn.innerHTML = '+';

            var fullExtent = L.DomUtil.create('a', 'leaflet-control-full-extent', zoomBar);
            fullExtent.href = '#';
            fullExtent.title = 'Vue d\'ensemble';
            fullExtent.setAttribute('role', 'button');
            fullExtent.setAttribute('aria-label', 'Vue d\'ensemble');
            fullExtent.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';

            var zoomOut = L.DomUtil.create('a', 'leaflet-control-zoom-out', zoomBar);
            zoomOut.href = '#';
            zoomOut.title = 'Zoom arrière';
            zoomOut.setAttribute('role', 'button');
            zoomOut.setAttribute('aria-label', 'Zoom arrière');
            zoomOut.innerHTML = '&#x2212;';

            L.DomEvent.on(zoomIn, 'click', function (e) {
                L.DomEvent.preventDefault(e);
                map.zoomIn();
            });
            L.DomEvent.on(fullExtent, 'click', function (e) {
                L.DomEvent.preventDefault(e);
                if (boundsGroup.getBounds().isValid()) {
                    map.fitBounds(boundsGroup.getBounds(), { padding: [20, 20] });
                } else {
                    map.setView([50.35, 2.8], 10);
                }
            });
            L.DomEvent.on(zoomOut, 'click', function (e) {
                L.DomEvent.preventDefault(e);
                map.zoomOut();
            });

            return container;
        }
    });
    new BottomBarControl().addTo(map);

    var overlayControl = new GroupedLayerControl(layerGroups);

    var boundsGroup = L.featureGroup();
    var loadedCount = 0;
    var bassinMask = null; // Inverted mask layer for bassin-minier

    // Loading overlay
    var loadingOverlay = document.getElementById('loading-overlay');

    // Dedicated pane for bassin-minier so it renders below other overlays
    var bassinPane = map.createPane('bassinPane');
    bassinPane.style.zIndex = 350; // above tilePane (200) but below overlayPane (400)

    // Dedicated pane for the mask so it never intercepts clicks
    var maskPane = map.createPane('maskPane');
    maskPane.style.zIndex = 360; // just above bassinPane, below overlayPane
    maskPane.style.pointerEvents = 'none';

    // Build an inverted polygon (world exterior with hole cut for the given coordinates)
    function createMaskLayer(coordinates) {
        var world = [
            [-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]
        ];
        // Leaflet expects [lat, lng], GeoJSON gives [lng, lat]
        var worldLatLng = world.map(function (c) { return [c[0], c[1]]; });
        var holeLatLng = coordinates[0].map(function (c) { return [c[1], c[0]]; });
        return L.polygon([worldLatLng, holeLatLng], {
            color: 'none',
            fillColor: '#000',
            fillOpacity: 0.3,
            stroke: false,
            interactive: false,
            pane: 'maskPane'
        });
    }

    // Track currently highlighted layer for hover reset
    var hoveredLayer = null;

    function onLayerLoaded() {
        loadedCount++;
        if (loadedCount === allLayerDefs.length) {
            overlayControl.addTo(map);
            buildSearchIndex();
            if (boundsGroup.getBounds().isValid()) {
                map.fitBounds(boundsGroup.getBounds(), { padding: [20, 20] });
            }
            // Dismiss loading overlay
            if (loadingOverlay) {
                loadingOverlay.classList.add('fade-out');
                setTimeout(function () {
                    loadingOverlay.style.display = 'none';
                    map.invalidateSize();
                }, 400);
            }
        }
    }

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

                        // Hover tooltip
                        var ttFn = tooltipText[def.id];
                        if (ttFn) {
                            var text = ttFn(feature.properties);
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
                        layer.on('mouseover', function () {
                            if (hoveredLayer && hoveredLayer !== layer && hoveredLayer.setStyle) {
                                // reset previous
                            }
                            hoveredLayer = layer;
                            if (layer.setStyle) {
                                layer.setStyle(getHoverStyle(def.id));
                            }
                            if (layer.bringToFront && def.id !== 'bassin-minier' && def.id !== 'communes-mbm') {
                                layer.bringToFront();
                            }
                        });
                        layer.on('mouseout', function () {
                            if (layer.setStyle) {
                                layer.setStyle(styles[def.id]);
                            }
                            hoveredLayer = null;
                        });
                    }
                };
                if (styles[def.id] && styles[def.id].radius) {
                    layerOpts.pointToLayer = function (feature, latlng) {
                        return L.circleMarker(latlng, styles[def.id]);
                    };
                }
                var layer = L.geoJSON(geojson, layerOpts);
                def._leafletLayer = layer;

                // Update feature count in control
                var featureCount = geojson.features ? geojson.features.length : 0;
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

                // Update count after control is added
                setTimeout(function () {
                    overlayControl.updateCount(def.id, featureCount);
                }, 0);
            })
            .catch(function (err) {
                console.warn('Failed to load ' + def.file + ':', err);
                onLayerLoaded();
            });
    });

    // Add drag handle for mobile bottom sheet
    var dragHandle = document.createElement('div');
    dragHandle.className = 'detail-drag-handle';
    detailPanel.insertBefore(dragHandle, detailPanel.firstChild);
})();
