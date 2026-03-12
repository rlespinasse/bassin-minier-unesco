// --- Legal pages content ---

export function buildLegalPages(dataGouvSources) {
    return [
        {
            id: 'mentions-legales',
            label: 'Mentions légales',
            content: `
                <h3>Éditeur / Directeur de la publication</h3>
                <p>Romain Lespinasse</p>

                <h3>Contact</h3>
                <p><a href="https://github.com/rlespinasse" target="_blank" rel="noopener">Profil GitHub</a></p>

                <h3>Hébergeur</h3>
                <p>GitHub Pages — GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA</p>

                <h3>Nature du site</h3>
                <p>Site informatif, non commercial.</p>
            `
        },
        {
            id: 'confidentialite',
            label: 'Confidentialité',
            content: `
                <h3>Mesure d'audience</h3>
                <p><a href="https://www.goatcounter.com/" target="_blank" rel="noopener">GoatCounter</a> (open source, respectueux de la vie privée).</p>

                <h3>Cookies</h3>
                <p>Aucun cookie n'est utilisé sur ce site.</p>

                <h3>Données personnelles</h3>
                <p>Aucune donnée personnelle n'est collectée ni stockée.</p>

                <h3>Données collectées par GoatCounter</h3>
                <ul>
                    <li>Pages vues</li>
                    <li>Référent (page d'origine)</li>
                    <li>Navigateur et système d'exploitation (anonymisé)</li>
                    <li>Pays (déduit de l'adresse IP, l'IP n'est pas stockée)</li>
                </ul>

                <h3>Droits RGPD</h3>
                <p>Aucune donnée personnelle n'étant collectée, aucune demande d'accès ou de suppression n'est applicable.</p>

                <h3>Contact</h3>
                <p><a href="https://github.com/rlespinasse" target="_blank" rel="noopener">Profil GitHub</a></p>
            `
        },
        {
            id: 'credits',
            label: 'Crédits',
            content: `
                <h3>Sources de données</h3>
                <ul>
                    ${Object.values(dataGouvSources).map(s =>
                        `<li><a href="${s.url}" target="_blank" rel="noopener">${s.name}</a></li>`
                    ).join('\n                    ')}
                </ul>
                <p>Données sous <a href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/" target="_blank" rel="noopener">Licence Ouverte ETALAB v2.0</a>.</p>

                <h3>Fonds de carte</h3>
                <ul>
                    <li><a href="https://www.ign.fr/" target="_blank" rel="noopener">IGN</a></li>
                    <li><a href="https://www.openstreetmap.org/" target="_blank" rel="noopener">OpenStreetMap</a> / <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a></li>
                    <li><a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a></li>
                </ul>

                <h3>Bibliothèques</h3>
                <ul>
                    <li><a href="https://github.com/rlespinasse/leaflet-atlas" target="_blank" rel="noopener">leaflet-atlas</a> (basé sur <a href="https://leafletjs.com/" target="_blank" rel="noopener">Leaflet</a>)</li>
                </ul>

                <h3>Analyse d'audience</h3>
                <p><a href="https://www.goatcounter.com/" target="_blank" rel="noopener">GoatCounter</a></p>

                <h3>Hébergement</h3>
                <p><a href="https://pages.github.com/" target="_blank" rel="noopener">GitHub Pages</a></p>

                <h3>Code source</h3>
                <p><a href="https://github.com/rlespinasse/bassin-minier-unesco" target="_blank" rel="noopener">github.com/rlespinasse/bassin-minier-unesco</a></p>
            `
        }
    ];
}
