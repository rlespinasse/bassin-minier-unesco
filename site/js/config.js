// --- Static configuration ---

export const styles = {
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
    'epci': {
        color: '#7E57C2',
        weight: 2,
        dashArray: '8 6',
        fillColor: '#7E57C2',
        fillOpacity: 0.03,
        opacity: 0.7
    },
    'departements': {
        color: '#FF8F00',
        weight: 2,
        dashArray: '10 5',
        fillColor: '#FF8F00',
        fillOpacity: 0.02,
        opacity: 0.7
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

export const layerPatterns = {
    'batis': { type: 'crosshatch', size: 8, strokeWidth: 1.5 },
    'cavaliers': { type: 'diagonal', size: 8, strokeWidth: 2 },
    'cites-minieres': { type: 'dots', size: 8, radius: 1.5 },
    'espace-neonaturel': { type: 'circles', size: 12, radius: 4, strokeWidth: 1 },
    'terrils': { type: 'stipple', size: 10, radius: 1 },
    'bien-inscrit': { type: 'horizontal', size: 6, strokeWidth: 1.5 },
    'zone-tampon': { type: 'diagonal', size: 10, strokeWidth: 1 },
    'zt-cavaliers': { type: 'diagonal', size: 10, strokeWidth: 1 },
    'zt-cites-minieres': { type: 'dots', size: 10, radius: 1 },
    'zt-espaces-neonaturels': { type: 'circles', size: 14, radius: 4, strokeWidth: 0.8 },
    'zt-terrils': { type: 'stipple', size: 12, radius: 0.8 },
    'zt-parvis-agricoles': { type: 'diagonal', size: 12, strokeWidth: 1 },
};

export const tooltipText = {
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
    'epci': p => p.nom,
    'departements': p => p.nom,
    'zt-cavaliers': p => p.nom || 'Cavalier (ZT)',
    'zt-cites-minieres': p => p.nom,
    'zt-espaces-neonaturels': p => p.nom,
    'zt-terrils': p => p.nom || 'Terril (ZT)',
    'zt-parvis-agricoles': p => 'Parvis agricole' + (p.id ? ` ${p.id}` : '')
};

export const layerGroups = [
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
        group: 'Autres \u00e9l\u00e9ments du bassin minier', layers: [
            { id: 'zt-cavaliers', label: 'Cavaliers (zone tampon)', file: 'data/zt-cavaliers.geojson', active: false },
            { id: 'zt-cites-minieres', label: 'Cites minieres (zone tampon)', file: 'data/zt-cites-minieres.geojson', active: false },
            { id: 'zt-espaces-neonaturels', label: 'Espaces neo-naturels (zone tampon)', file: 'data/zt-espaces-neonaturels.geojson', active: false },
            { id: 'zt-terrils', label: 'Terrils (zone tampon)', file: 'data/zt-terrils.geojson', active: false },
            { id: 'zt-parvis-agricoles', label: 'Parvis agricoles (zone tampon)', file: 'data/zt-parvis-agricoles.geojson', active: false },
            { id: 'puits-de-mines', label: 'Puits de mines', file: 'data/puits-de-mines.geojson', active: false }
        ]
    },
];

export const contextLayers = [
    { id: 'bassin-minier', label: 'Bassin minier (ERBM)', file: 'data/bassin-minier.geojson', active: true },
    { id: 'communes-mbm', label: 'Communes', file: 'data/communes-mbm.geojson', active: false },
    { id: 'epci', label: 'Intercommunalites (EPCI)', file: 'data/epci.geojson', active: false },
    { id: 'departements', label: 'D\u00e9partements', file: 'data/departements.geojson', active: false }
];

export const layerPanes = {
    'zone-tampon': 'largeFeaturesPane',
    'bien-inscrit': 'largeFeaturesPane',
    'communes-mbm': 'largeFeaturesPane',
    'epci': 'largeFeaturesPane',
    'departements': 'largeFeaturesPane',
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

export const borderClickLayers = {
    'departements': 'deptBorderPane',
    'epci': 'epciBorderPane',
    'communes-mbm': 'communeBorderPane'
};

export const dataGouvSources = {
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
    },
    geoApi: {
        name: 'API D\u00e9coupage Administratif (API Geo)',
        url: 'https://geo.api.gouv.fr'
    }
};

export const searchableProps = {
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
    'epci': { title: p => p.nom, meta: p => 'EPCI', text: ['nom', 'code_siren'] },
    'departements': { title: p => p.nom, meta: p => 'D\u00e9partement', text: ['nom', 'code'] },
    'zt-cavaliers': { title: p => p.nom || 'Cavalier (ZT)', meta: p => joinNotNull([p.commune_1, p.commune_2]) || 'Cavalier (zone tampon)', text: ['nom', 'commune_1', 'commune_2', 'commune_3', 'commune_4', 'id_troncon'] },
    'zt-cites-minieres': { title: p => p.nom, meta: p => joinNotNull([p.commune_1, p.commune_2]) || 'Cite miniere (zone tampon)', text: ['nom', 'nom_2', 'commune_1', 'commune_2', 'compagnie'] },
    'zt-espaces-neonaturels': { title: p => p.nom, meta: p => joinNotNull([p.commune_1, p.commune_2]) || 'Espace neo-naturel (zone tampon)', text: ['nom', 'commune_1', 'commune_2'] },
    'zt-terrils': { title: p => p.nom || 'Terril (ZT)', meta: p => joinNotNull([p.commune_1, p.commune_2]) || 'Terril (zone tampon)', text: ['nom', 'nom_usuel', 'commune_1', 'commune_2'] },
    'zt-parvis-agricoles': { title: p => `Parvis agricole ${p.id || ''}`, meta: p => p.qualite_vue || 'Parvis agricole', text: ['id', 'qualite_vue', 'vue_sur'] }
};

function joinNotNull(arr) {
    return arr.filter(v => v && v !== 'None').join(', ');
}
