// --- Detail panel content builders (project-specific) ---

import { dataGouvSources } from './config.js';
import { communeLink, communeLinks, epciLink, deptLink, terrilLinks, elementLink, mhRows, deptNameFromInsee } from './helpers.js';
const { rawHtml, normalizeText } = LeafletAtlas;

export function createDetailBuilders(helpers) {
    const { buildDetail, buildReverseLinksSection, sourceRow, getReverseLinks, eachLayerFeature } = helpers;

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
            const deptName = (() => {
                if (!p.insee || p.insee.length < 2) return null;
                const prefix = p.insee.substring(0, 2);
                let name = null;
                eachLayerFeature('departements', lyr => {
                    if (!name && lyr.feature.properties.code === prefix) {
                        name = lyr.feature.properties.nom;
                    }
                });
                return name;
            })();
            const groups = [
                {
                    label: 'Identification', rows: [
                        p.insee && ['INSEE', p.insee],
                        p.statut && ['Statut', p.statut],
                        p.epci_nom && ['EPCI', rawHtml(epciLink(p.epci_nom))],
                        deptName && ['D\u00e9partement', rawHtml(deptLink(deptName))]
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
                    const communeLayers = [];
                    eachLayerFeature('communes-mbm', lyr => communeLayers.push(lyr));
                    for (const item of members['communes-mbm']) {
                        const lyr = communeLayers[item.index];
                        if (lyr) {
                            const insee = lyr.feature.properties.insee;
                            if (insee && insee.length >= 2) {
                                const prefix = insee.substring(0, 2);
                                let name = null;
                                eachLayerFeature('departements', dlyr => {
                                    if (!name && dlyr.feature.properties.code === prefix) {
                                        name = dlyr.feature.properties.nom;
                                    }
                                });
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
