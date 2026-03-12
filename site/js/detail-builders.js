// --- Detail panel content builders ---

import { styles, allLayerDefs, dataGouvSources } from './config.js';
import {
    escapeHtml, rawHtml, renderValue, communeLink, communeLinks, epciLink, deptLink,
    terrilLinks, elementLink, featureLink, mhRows, normalizeText, deptNameFromInsee
} from './helpers.js';

export function sourceRow(source) {
    return ['Sources', rawHtml(`<a href="${source.url}" target="_blank" rel="noopener">${source.name}<span class="cross-link-icon"> \u2197</span></a>`)];
}

export function buildDetail(title, layerId, groups) {
    const color = styles[layerId] ? (styles[layerId].fillColor || styles[layerId].color) : '#888';
    const def = allLayerDefs.find(d => d.id === layerId);
    const layerLabel = def ? def.label : layerId;
    let html = `<div class="detail-header"><span class="detail-layer-type"><span class="detail-layer-badge" style="background:${color}"></span>${escapeHtml(layerLabel)}</span></div><h3>${escapeHtml(title)}</h3>`;
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

export function buildReverseLinksSection(data, sectionLabel) {
    if (!data) return null;
    const rows = [];
    for (const [layerId, items] of Object.entries(data)) {
        const def = allLayerDefs.find(d => d.id === layerId);
        const layerLabel = def ? def.label : layerId;
        const links = items.map(item => featureLink(layerId, item.index, item.label));
        rows.push([layerLabel, rawHtml(links.join('<br>'))]);
    }
    return rows.length ? { label: sectionLabel, rows } : null;
}

export function createDetailBuilders(getReverseLinks) {
    return {
        'bassin-minier': p => buildDetail(p.nom || 'Bassin minier', 'bassin-minier', [
            {
                label: 'Caracteristiques', rows: [
                    p.surface_km2 && ['Surface', `${p.surface_km2} km\u00b2`],
                    p.population && ['Population', p.population.toLocaleString('fr-FR')]
                ]
            },
            { label: 'Liens', rows: [sourceRow(dataGouvSources.mbm)] }
        ]),
        'bien-inscrit': p => {
            const reverseLinks = getReverseLinks();
            const groups = [
                {
                    label: 'Identification', rows: [
                        p.section && ['Section', p.section],
                        p.no_section && ['N\u00b0 Section', p.no_section],
                        p.no_element && ['Element', p.no_element]
                    ]
                },
                {
                    label: 'Caracteristiques', rows: [
                        p.surface_ha && ['Surface', `${p.surface_ha} ha`]
                    ]
                }
            ];
            const rl = reverseLinks && p.no_element ? buildReverseLinksSection(reverseLinks.elements[String(p.no_element)], 'Elements rattaches') : null;
            if (rl) groups.push(rl);
            groups.push({ label: 'Liens', rows: [sourceRow(dataGouvSources.patrimoine)] });
            return buildDetail(p.nom || 'Bien inscrit UNESCO', 'bien-inscrit', groups);
        },
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
        'terrils': p => {
            const reverseLinks = getReverseLinks();
            const groups = [
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
                }
            ];
            const rl = reverseLinks && p.no_terril ? buildReverseLinksSection(reverseLinks.terrils[p.no_terril], 'Vue depuis') : null;
            if (rl) groups.push(rl);
            groups.push({ label: 'Liens', rows: [sourceRow(dataGouvSources.patrimoine)] });
            return buildDetail(p.nom || 'Terril', 'terrils', groups);
        },
        'communes-mbm': p => {
            const reverseLinks = getReverseLinks();
            const groups = [
                {
                    label: 'Identification', rows: [
                        p.insee && ['INSEE', p.insee],
                        p.statut && ['Statut', p.statut],
                        p.epci_nom && ['EPCI', rawHtml(epciLink(p.epci_nom))],
                        p.insee && deptNameFromInsee(p.insee) && ['D\u00e9partement', rawHtml(deptLink(deptNameFromInsee(p.insee)))]
                    ]
                },
                {
                    label: 'Caracteristiques', rows: [
                        p.population && ['Population', Number(p.population).toLocaleString('fr-FR')],
                        p.surface_km2 && ['Surface', `${Number(p.surface_km2).toFixed(1)} km\u00b2`]
                    ]
                }
            ];
            const rl = reverseLinks && p.nom ? buildReverseLinksSection(reverseLinks.communes[normalizeText(p.nom)], 'Patrimoine de la commune') : null;
            if (rl) groups.push(rl);
            groups.push({ label: 'Liens', rows: [sourceRow(dataGouvSources.mbm)] });
            return buildDetail(p.nom || 'Commune', 'communes-mbm', groups);
        },
        'epci': p => {
            const reverseLinks = getReverseLinks();
            const deptSet = new Set();
            if (reverseLinks && reverseLinks.epcis) {
                const members = reverseLinks.epcis[normalizeText(p.nom)];
                if (members && members['communes-mbm']) {
                    const communesDef = allLayerDefs.find(d => d.id === 'communes-mbm');
                    if (communesDef && communesDef._leafletLayer) {
                        const communeLayers = [];
                        communesDef._leafletLayer.eachLayer(lyr => communeLayers.push(lyr));
                        for (const item of members['communes-mbm']) {
                            const lyr = communeLayers[item.index];
                            if (lyr) {
                                const name = deptNameFromInsee(lyr.feature.properties.insee);
                                if (name) deptSet.add(name);
                            }
                        }
                    }
                }
            }
            const deptNames = [...deptSet].sort();
            const groups = [
                {
                    label: 'Identification', rows: [
                        p.code_siren && ['Code SIREN', p.code_siren],
                        deptNames.length && ['D\u00e9partement(s)', rawHtml(deptNames.map(n => deptLink(n)).join(', '))]
                    ]
                }
            ];
            const rl = reverseLinks && p.nom ? buildReverseLinksSection(reverseLinks.epcis[normalizeText(p.nom)], 'Communes membres') : null;
            if (rl) groups.push(rl);
            groups.push({ label: 'Liens', rows: [sourceRow(dataGouvSources.geoApi)] });
            return buildDetail(p.nom || 'EPCI', 'epci', groups);
        },
        'departements': p => {
            const reverseLinks = getReverseLinks();
            const groups = [
                {
                    label: 'Identification', rows: [
                        p.code && ['Code', p.code]
                    ]
                }
            ];
            const rlEpci = reverseLinks && p.nom ? buildReverseLinksSection(reverseLinks.departements[normalizeText(p.nom)], 'Contenu') : null;
            if (rlEpci) groups.push(rlEpci);
            groups.push({ label: 'Liens', rows: [sourceRow(dataGouvSources.geoApi)] });
            return buildDetail(p.nom || 'D\u00e9partement', 'departements', groups);
        },
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
            const reverseLinks = getReverseLinks();
            let nom = p.nom || 'Terril (zone tampon)';
            if (p.nom_usuel) nom += ` (${p.nom_usuel})`;
            const groups = [
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
                }
            ];
            const rl = reverseLinks && p.id ? buildReverseLinksSection(reverseLinks.terrils[String(p.id)], 'Vue depuis') : null;
            if (rl) groups.push(rl);
            groups.push({ label: 'Liens', rows: [sourceRow(dataGouvSources.mbm)] });
            return buildDetail(nom, 'zt-terrils', groups);
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
}
