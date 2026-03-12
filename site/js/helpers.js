// --- Project-specific helpers ---

const { crossLink, rawHtml, normalizeText } = LeafletAtlas;

// --- Cross-link helpers ---

export function communeLink(name) {
    return crossLink('commune', name, name);
}

export function communeLinks(props, ...keys) {
    const links = keys
        .map(k => props[k])
        .filter(v => v && v !== 'None')
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
    const ids = vueStr.split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.length) return null;
    const links = ids.map(id => crossLink('terril', id, id));
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
