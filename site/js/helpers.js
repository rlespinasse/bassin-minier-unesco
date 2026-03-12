// --- Project-specific helpers ---

const { crossLink, escapeHtml, rawHtml, normalizeText } = LeafletAtlas;

// --- Cross-link helpers ---

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

// --- MH protection rows ---

export function mhRows(p) {
    const rows = [];
    if (p.inscrit_mh && String(p.inscrit_mh).toLowerCase() !== 'false' && String(p.inscrit_mh).toLowerCase() !== 'non')
        rows.push(['Inscrit MH', 'Oui']);
    if (p.classe_mh && String(p.classe_mh).toLowerCase() !== 'false' && String(p.classe_mh).toLowerCase() !== 'non')
        rows.push(['Classe MH', 'Oui']);
    return rows;
}

// --- Department name lookup ---

export function deptNameFromInsee(insee, app) {
    if (!insee || insee.length < 2) return null;
    const prefix = insee.substring(0, 2);
    let name = null;
    app.eachLayerFeature('departements', lyr => {
        if (!name && lyr.feature.properties.code === prefix) {
            name = lyr.feature.properties.nom;
        }
    });
    return name;
}
