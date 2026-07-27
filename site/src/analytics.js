// --- Site-level analytics helper (GoatCounter) ---
//
// leaflet-atlas already wires up GoatCounter internally for its own tracked
// events (legal pages, search, ...) via the `analytics` option in
// `main.js`. This module is a thin, site-specific helper for custom events
// that live outside the library (e.g. the orthophoto historique control in
// `orthophoto-control.js`), so calling code never touches
// `window.goatcounter` directly.

export const analyticsConfig = {
  account: 'rlespinasse',
  basePath: '/bassin-minier-unesco/',
  endpoint: 'https://rlespinasse.goatcounter.com/count',
};

function isLocalhost() {
  return (
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.hostname === '0.0.0.0'
  );
}

/**
 * Initialise le suivi d'audience côté site. Le script GoatCounter est chargé
 * via la balise `<script data-goatcounter>` dans `index.html` ; cette
 * fonction se contente de vérifier le contexte d'exécution (désactivation
 * en local) et sert de point d'entrée explicite, appelé depuis `main.js`.
 */
export function initAnalytics() {
  if (isLocalhost()) {
    console.info('[analytics] GoatCounter désactivé en local (localhost).');
  }
}

/**
 * Enregistre un événement personnalisé auprès de GoatCounter.
 *
 * @param {string} name - Chemin de l'événement, relatif à `basePath` (ex. `orthophoto/2015`).
 * @param {string} [value] - Titre/valeur associé à l'événement, affiché dans le tableau de bord GoatCounter.
 */
export function trackEvent(name, value) {
  if (isLocalhost() || !window.goatcounter?.count) {
    return;
  }
  window.goatcounter.count({
    path: `${analyticsConfig.basePath}${name}`,
    title: value,
    event: true,
  });
}
