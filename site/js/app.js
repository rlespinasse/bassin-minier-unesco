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

    // Data source attribution
    map.attributionControl.addAttribution(
        'Données <a href="https://www.missionbassinminier.org">Mission Bassin Minier</a> — <a href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/">Licence ETALAB v2.0</a>'
    );

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

    function showDetail(html) {
        // Mobile: close layers drawer (mutual exclusion)
        if (window.innerWidth <= 600 && layersDrawer && layersDrawer.isOpen()) {
            layersDrawer.close();
        }
        detailContent.innerHTML = html;
        detailPanel.classList.add('open');
        map.invalidateSize();
    }

    function hideDetail() {
        detailPanel.classList.remove('open');
        map.invalidateSize();
    }

    detailClose.addEventListener('click', hideDetail);

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
        return ['Sources', rawHtml(`<a href="${source.url}" target="_blank" rel="noopener">${source.name}</a>`)];
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
                        p.element && ['Element', p.element],
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
                    p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2])]
                ]
            },
            {
                label: 'Identification', rows: [
                    p.typologie && ['Typologie', p.typologie],
                    p.compagnie && ['Compagnie', p.compagnie],
                    p.periode && ['Periode', p.periode],
                    p.proprietaire && ['Proprietaire', p.proprietaire],
                    p.id_unesco && ['ID UNESCO', p.id_unesco],
                    p.element && ['Element', p.element],
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
            const communes = joinNotNull([
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
                        p.longueur_m && ['Longueur', `${Math.round(p.longueur_m)} m`]
                    ]
                },
                {
                    label: 'Identification', rows: [
                        p.id_unesco && ['ID UNESCO', p.id_unesco],
                        p.element && ['Element', p.element],
                        p.objet && ['Objet', p.objet]
                    ]
                },
                { label: 'Liens', rows: [sourceRow(dataGouvSources.patrimoine)] }
            ]);
        },
        'espace-neonaturel': p => buildDetail(p.nom || 'Espace neo-naturel', 'espace-neonaturel', [
            {
                label: 'Localisation', rows: [
                    p.commune_1 && ['Commune', joinNotNull([p.commune_1, p.commune_2])]
                ]
            },
            {
                label: 'Identification', rows: [
                    p.id_unesco && ['ID UNESCO', p.id_unesco],
                    p.element && ['Element', p.element],
                    p.objet && ['Objet', p.objet]
                ]
            },
            { label: 'Liens', rows: [sourceRow(dataGouvSources.patrimoine)] }
        ]),
        'terrils': p => buildDetail(p.nom || 'Terril', 'terrils', [
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
                    p.id_unesco && ['ID UNESCO', p.id_unesco],
                    p.element && ['Element', p.element],
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
            const communes = joinNotNull([p.commune_1, p.commune_2, p.commune_3, p.commune_4]);
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
                },
                { label: 'Liens', rows: [sourceRow(dataGouvSources.mbm)] }
            ]);
        },
        'zt-espaces-neonaturels': p => buildDetail(p.nom || 'Espace neo-naturel (zone tampon)', 'zt-espaces-neonaturels', [
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
            { label: 'Liens', rows: [sourceRow(dataGouvSources.mbm)] }
        ]),
        'zt-terrils': p => {
            let nom = p.nom || 'Terril (zone tampon)';
            if (p.nom_usuel) nom += ` (${p.nom_usuel})`;
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
                    p.vue_sur && ['Vue sur', p.vue_sur]
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
                        p.commune && ['Commune', p.commune],
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
                        p.brgm && ['Fiche BRGM', rawHtml(`<a href="${encodeURI(p.brgm)}" target="_blank" rel="noopener">Voir</a>`)],
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
                const builder = detailBuilders[item.layerId];
                if (builder) {
                    showDetail(builder(item.layer.feature.properties));
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

    function onLayerLoaded() {
        loadedCount++;
        if (loadedCount < allLayerDefs.length) return;

        for (const d of allLayerDefs) {
            if (d._featureCount !== undefined) {
                layersDrawer.updateCount(d.id, d._featureCount);
            }
        }
        buildSearchIndex();
        if (boundsGroup.getBounds().isValid()) {
            map.fitBounds(boundsGroup.getBounds(), { padding: [20, 20] });
        }
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
                const layerOpts = {
                    style: () => styles[def.id],
                    onEachFeature: (feature, layer) => {
                        const builder = detailBuilders[def.id];
                        if (builder) {
                            layer.on('click', e => {
                                L.DomEvent.stopPropagation(e);
                                showDetail(builder(feature.properties));
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
                    layerOpts.pointToLayer = (_feature, latlng) => L.circleMarker(latlng, styles[def.id]);
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

    // Add drag handle for mobile bottom sheet
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    detailPanel.insertBefore(dragHandle, detailPanel.firstChild);
})();
