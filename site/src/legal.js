// --- Legal pages content ---

export function buildLegalPages(dataGouvSources) {
  return [
    {
      id: 'a-propos',
      label: 'À propos',
      content: `
                <p class="sr-only">Tous les liens de cette page s'ouvrent dans un nouvel onglet.</p>
                <h3>Le projet</h3>
                <p>
                    Cet atlas cartographique présente le patrimoine minier du Bassin Minier du
                    Nord-Pas-de-Calais, inscrit au patrimoine mondial de l'UNESCO en 2012 en tant
                    que « paysage culturel évolutif vivant ». Il rassemble en un seul endroit les
                    périmètres officiels de l'inscription (bien inscrit, zone tampon), ainsi que
                    les éléments emblématiques du bassin minier : terrils, cités minières,
                    cavaliers, bâtis industriels, espaces néo-naturels et puits de mines.
                </p>

                <h3>Orthophotos historiques</h3>
                <p>
                    La carte permet de superposer des orthophotographies historiques du territoire
                    (1949-1955, 1998, 2005, 2009, 2012-2013, 2015), pour observer l'évolution du
                    paysage minier au fil des décennies : exploitation, affaissements,
                    reconversion des friches en espaces naturels.
                </p>

                <h3>Des données à jour</h3>
                <p>
                    Les données affichées proviennent de sources publiques ouvertes (data.gouv.fr,
                    Géo2France, API Géo) et sont actualisées automatiquement chaque semaine par un
                    pipeline de mise à jour, afin de rester fidèles aux jeux de données sources.
                </p>

                <h3>Technologie</h3>
                <p>
                    La carte interactive est construite avec <a href="https://leafletjs.com/" target="_blank" rel="noopener">Leaflet</a>,
                    via la bibliothèque <a href="https://github.com/rlespinasse/leaflet-atlas" target="_blank" rel="noopener">leaflet-atlas</a>.
                    Le site est un site statique, sans backend, hébergé sur GitHub Pages.
                </p>

                <h3>Code source</h3>
                <p><a href="https://github.com/rlespinasse/bassin-minier-unesco" target="_blank" rel="noopener">github.com/rlespinasse/bassin-minier-unesco</a></p>
            `,
    },
    {
      id: 'mentions-legales',
      label: 'Mentions légales',
      content: `
                <p class="sr-only">Tous les liens de cette page s'ouvrent dans un nouvel onglet.</p>
                <h3>Éditeur / Directeur de la publication</h3>
                <p>Romain Lespinasse</p>

                <h3>Contact</h3>
                <p><a href="https://github.com/rlespinasse" target="_blank" rel="noopener">Profil GitHub</a></p>

                <h3>Hébergeur</h3>
                <p>GitHub Pages — GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA</p>

                <h3>Nature du site</h3>
                <p>Site informatif, non commercial.</p>
            `,
    },
    {
      id: 'confidentialite',
      label: 'Confidentialité',
      content: `
                <p class="sr-only">Tous les liens de cette page s'ouvrent dans un nouvel onglet.</p>
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
            `,
    },
    {
      id: 'credits',
      label: 'Crédits',
      content: `
                <p class="sr-only">Tous les liens de cette page s'ouvrent dans un nouvel onglet.</p>
                <h3>Sources de données</h3>
                <ul>
                    ${Object.values(dataGouvSources)
                      .map(
                        (s) =>
                          `<li><a href="${s.url}" target="_blank" rel="noopener">${s.name}</a></li>`
                      )
                      .join('\n                    ')}
                </ul>
                <p>
                    Données publiées par des organismes publics (data.gouv.fr, Géo2France,
                    geo.api.gouv.fr) sous
                    <a href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/" target="_blank" rel="noopener">Licence Ouverte / Open Licence Etalab v2.0</a>.
                </p>
                <p>
                    Les données sont actualisées automatiquement chaque semaine (tous les lundis)
                    par un pipeline de mise à jour qui re-télécharge, convertit et enrichit les
                    jeux de données sources.
                </p>

                <h3>Fonds de carte</h3>
                <ul>
                    <li>
                        <a href="https://www.ign.fr/" target="_blank" rel="noopener">IGN</a> —
                        Géoportail de l'urbanisme / Géoplateforme, sous
                        <a href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/" target="_blank" rel="noopener">Licence Ouverte / Open Licence Etalab</a>
                    </li>
                    <li>
                        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>
                        (contributeurs, sous <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener">licence ODbL</a>)
                        / <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a> (habillage cartographique « Clair »)
                    </li>
                    <li><a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a>, Maxar, Earthstar Geographics (imagerie satellite « World Imagery »)</li>
                </ul>

                <h3>Orthophotographies historiques</h3>
                <p>
                    Couche optionnelle diffusée en direct par le service WMS de
                    <a href="https://www.geo2france.fr/" target="_blank" rel="noopener">Géo2France</a>
                    (partenariat régional Hauts-de-France) et l'IGN — voir les jeux de données
                    correspondants ci-dessus (1949-1955, 1998, 2005, 2009, 2012-2013, 2015).
                    Millésimes également sous Licence Ouverte / Open Licence Etalab.
                </p>

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
            `,
    },
  ];
}
