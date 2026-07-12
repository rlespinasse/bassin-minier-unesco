import { MILLESIMES_HISTORIQUES, createOrthoHistoriqueLayer, buildThumbnailUrl } from './orthophotos-historiques.js';

/**
 * Injecte un sélecteur de millésime d'orthophoto historique dans l'onglet
 * "Fond de carte" du drawer leaflet-atlas, sous forme de cartes miniatures
 * — mêmes classes CSS (`drawer-base-card*`) que les cartes IGN/Clair/
 * Satellite, pour un rendu visuellement identique. Une carte "Aucune"
 * permet de désactiver l'orthophoto ; les autres cartes sont mutuellement
 * exclusives, comme pour un vrai fond de carte.
 */
export function initOrthophotosHistoriques(app) {
  const map = app.getMap();
  let currentLayer = null;

  const contentFond = map
    .getContainer()
    .parentElement.querySelector('.drawer-base-cards')
    ?.closest('.layers-drawer-tab-content');

  if (!contentFond) {
    console.warn('[orthophotos-historiques] onglet "Fond de carte" introuvable, contrôle non injecté.');
    return;
  }

  const section = document.createElement('div');
  section.className = 'orthophoto-historique-section';

  const heading = document.createElement('div');
  heading.className = 'drawer-group-header';
  heading.textContent = 'Orthophoto historique';
  section.appendChild(heading);

  const cardList = document.createElement('div');
  cardList.className = 'drawer-base-cards';
  section.appendChild(cardList);

  contentFond.appendChild(section);

  const cards = [];

  const setActiveCard = (activeCard) => {
    for (const card of cards) {
      const isActive = card === activeCard;
      card.classList.toggle('active', isActive);
      card.setAttribute('aria-pressed', String(isActive));
    }
  };

  const noneCard = document.createElement('button');
  noneCard.type = 'button';
  noneCard.className = 'drawer-base-card active';
  noneCard.setAttribute('aria-pressed', 'true');
  const noneLabel = document.createElement('span');
  noneLabel.className = 'drawer-base-card-label';
  noneLabel.textContent = 'Aucune';
  noneCard.appendChild(noneLabel);
  noneCard.addEventListener('click', () => {
    if (currentLayer) {
      map.removeLayer(currentLayer);
      currentLayer = null;
    }
    setActiveCard(noneCard);
  });
  cardList.appendChild(noneCard);
  cards.push(noneCard);

  for (const millesime of MILLESIMES_HISTORIQUES) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'drawer-base-card';
    card.setAttribute('aria-pressed', 'false');

    const thumb = document.createElement('img');
    thumb.className = 'drawer-base-card-thumb';
    thumb.src = buildThumbnailUrl(millesime.layer);
    thumb.alt = millesime.libelle;
    thumb.loading = 'lazy';
    card.appendChild(thumb);

    const label = document.createElement('span');
    label.className = 'drawer-base-card-label';
    label.textContent = millesime.libelle;
    card.appendChild(label);

    card.addEventListener('click', () => {
      if (currentLayer) map.removeLayer(currentLayer);
      currentLayer = createOrthoHistoriqueLayer(millesime);
      currentLayer.addTo(map);
      setActiveCard(card);
    });

    cardList.appendChild(card);
    cards.push(card);
  }
}
