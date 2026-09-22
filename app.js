const remote = window.pokeBinderRemote;
let remoteUser = null;
let remoteTimer;
const demoAlbumNames = new Set(['Mis favoritos', 'Kanto clásico', 'Cartas doradas']);
let cards = [];
let albums = (JSON.parse(localStorage.getItem('pokebinder-albums')) || []).filter(album => !demoAlbumNames.has(album.name));
let catalogCards = [];
let allCatalogCards = [];
let ownedCards = new Map();
let variantsByCard = new Map();
let variantMigrationReady = true;
let activeSetCode = 'xy1';
let setDefinitions = {};
let catalogEras = [];
let friendships = [];
let activeFriendProfile = null;
let featuredCardIds = JSON.parse(localStorage.getItem('pokebinder-featured-cards') || '[]').slice(0, 3);
function applyIdentity(name = null) {
  const displayName = name || 'Sin sesión';
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';
  el('sidebar-name').textContent = displayName;
  el('sidebar-status').textContent = name ? 'Entrenador' : 'Acceso privado';
  el('sidebar-avatar').textContent = initial;
  el('top-avatar').textContent = initial;
  el('welcome-name').textContent = name ? name.toUpperCase() : 'ENTRENADOR';
}
const save = () => {
  localStorage.setItem('pokebinder-cards', JSON.stringify(cards));
  localStorage.setItem('pokebinder-albums', JSON.stringify(albums));
  if (remoteUser) { clearTimeout(remoteTimer); remoteTimer = setTimeout(syncToCloud, 450); }
};
const el = (id) => document.getElementById(id);
el('available-sets-count').textContent = Object.keys(setDefinitions).length;
el('available-sets-label').textContent = Object.keys(setDefinitions).length === 1 ? 'Set disponible' : 'Sets disponibles';
let toastTimer;
function showToast(message, isError = false) {
  const toast = el('toast');
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
}

function renderCards() {
  const q = el('card-search').value.trim().toLowerCase();
  const set = activeSetCode, rarity = el('rarity-filter').value;
  const setDefinition = setDefinitions[set] || { name: 'este set', cards: catalogCards.length, variants: 0 };
  const source = catalogCards.length ? catalogCards : (remote ? [] : cards);
  const filtered = source.filter(c => {
    const name = c.name;
    const cardSet = c.set_code || c.set;
    return (!q || `${name} ${cardSet}`.toLowerCase().includes(q)) && (set === 'all' || cardSet === set) && (rarity === 'all' || c.rarity === rarity);
  });
  el('card-grid').innerHTML = filtered.map(c => {
    if (catalogCards.length) {
      const variants = variantsByCard.get(c.id) || [];
      const ownedVariantCount = variants.filter(variant => ownedCards.has(`${c.id}:${variant.variant_code}`)).length;
      const variantButtons = variants.map(variant => {
        const owned = ownedCards.get(`${c.id}:${variant.variant_code}`);
        const quantityControls = owned ? `<div class="quantity-stepper"><button type="button" data-quantity-action="decrease" data-card-id="${c.id}" data-variant-code="${variant.variant_code}" aria-label="Quitar una copia">−</button><strong aria-label="${owned.quantity} copias">×${owned.quantity}</strong><button type="button" data-quantity-action="increase" data-card-id="${c.id}" data-variant-code="${variant.variant_code}" aria-label="Añadir otra copia" ${Number(owned.quantity) >= 999 ? 'disabled' : ''}>+</button></div>` : '';
        return `<div class="variant-control"><button class="variant-toggle ${owned ? 'owned' : ''}" data-card-id="${c.id}" data-variant-code="${variant.variant_code}" aria-pressed="${Boolean(owned)}" ${variantMigrationReady ? '' : 'disabled'}><span class="check">${owned ? '✓' : ''}</span><span>${variant.label}</span></button>${quantityControls}</div>`;
      }).join('');
      return `<article class="pokemon-card catalog-card ${ownedVariantCount ? 'owned-card' : ''}"><div class="card-art catalog-art"><img src="${c.image_small_url}" alt="${c.name}" loading="lazy" /></div><div class="card-info"><div class="card-name"><strong>${c.name}</strong><span>${c.card_number}/${setDefinition.printedTotal || setDefinition.cards}</span></div><p class="card-meta"><span>${c.set_name}</span><span>${c.rarity || 'Unknown'}</span></p><div class="variant-list">${variantButtons}</div></div></article>`;
    }
    return `<article class="pokemon-card"><div class="card-art art-${c.art}">${c.icon}</div><div class="card-info"><div class="card-name"><strong>${c.name}</strong><span>${c.number}</span></div><p>${c.set}</p><div class="card-bottom"><span class="rarity">${c.rarity}</span><span class="quantity">×${c.quantity}</span></div></div></article>`;
  }).join('') || `<p>${remoteUser ? `No hemos podido cargar el catálogo de ${setDefinition.name}. Comprueba que su migración esté aplicada en Supabase.` : 'Inicia sesión para consultar y marcar tu colección.'}</p>`;
  const activeCardIds = new Set(catalogCards.map(card => card.id));
  const activeOwnedCards = [...ownedCards.values()].filter(card => activeCardIds.has(card.card_id));
  const ownedVariantTotal = catalogCards.length ? activeOwnedCards.length : 0;
  const ownedBaseTotal = new Set(activeOwnedCards.map(card => card.card_id)).size;
  const totalCopies = catalogCards.length ? activeOwnedCards.reduce((n, c) => n + Number(c.quantity), 0) : 0;
  const duplicates = totalCopies - ownedVariantTotal;
  const availableVariants = catalogCards.reduce((sum, card) => sum + (variantsByCard.get(card.id)?.length || 0), 0);
  el('collection-count').textContent = ownedVariantTotal; el('duplicates-count').textContent = duplicates;
  el('base-owned-count').textContent = ownedBaseTotal;
  el('base-total').textContent = catalogCards.length;
  const allOwnedValues = [...ownedCards.values()];
  const allUniqueTotal = new Set(allOwnedValues.map(card => card.card_id)).size;
  const allCopiesTotal = allOwnedValues.reduce((sum, card) => sum + Number(card.quantity), 0);
  el('unique-cards').textContent = allUniqueTotal;
  el('total-cards').textContent = allCopiesTotal;
  el('hero-unique-cards').textContent = allUniqueTotal;
  el('hero-total-cards').textContent = allCopiesTotal;
  el('hero-set-count').textContent = Object.keys(setDefinitions).length;
  if (el('set-total')) el('set-total').textContent = availableVariants;
  const baseProgress = catalogCards.length ? Math.round((ownedBaseTotal / catalogCards.length) * 100) : 0;
  const variantProgress = availableVariants ? Math.round((ownedVariantTotal / availableVariants) * 100) : 0;
  const xy1Ids = new Set(allCatalogCards.filter(card => card.set_code === 'xy1').map(card => card.id));
  const xy1Owned = allOwnedValues.filter(card => xy1Ids.has(card.card_id));
  const xy1BaseOwned = new Set(xy1Owned.map(card => card.card_id)).size;
  const xy1Definition = setDefinitions.xy1 || { cards: 146, variants: 269 };
  const xy1BaseProgress = Math.round(xy1BaseOwned / xy1Definition.cards * 100);
  const xy1VariantProgress = Math.round(xy1Owned.length / xy1Definition.variants * 100);
  el('base-progress-count').textContent = xy1BaseOwned;
  el('base-progress-percent').textContent = `${xy1BaseProgress}%`;
  el('base-progress-bar').style.width = `${xy1BaseProgress}%`;
  el('variant-progress-count').textContent = xy1Owned.length;
  el('variant-progress-total').textContent = xy1Definition.variants;
  el('variant-progress-percent').textContent = `${xy1VariantProgress}%`;
  el('variant-progress-bar').style.width = `${xy1VariantProgress}%`;
  updateLibraryProgress();
  renderFeaturedCards();
}
function renderFeaturedCards() {
  const ownedIds = new Set([...ownedCards.values()].map(card => card.card_id));
  const selectedCards = featuredCardIds.map(id => allCatalogCards.find(card => card.id === id)).filter(card => card && ownedIds.has(card.id));
  const slots = Array.from({ length: 3 }, (_, index) => {
    const card = selectedCards[index];
    return card
      ? `<figure class="featured-card"><img src="${card.image_large_url || card.image_small_url}" alt="${card.name}" loading="lazy" /></figure>`
      : '<div class="featured-empty" aria-label="Hueco de carta destacado vacío">＋</div>';
  });
  el('featured-cards').innerHTML = slots.join('');
}
function openFeaturedEditor() {
  if (!remoteUser) { el('auth-modal').showModal(); return; }
  const ownedIds = new Set([...ownedCards.values()].map(card => card.card_id));
  const availableCards = allCatalogCards.filter(card => ownedIds.has(card.id));
  const options = availableCards.map(card => `<option value="${card.id}">${card.name} · ${card.set_name} #${card.card_number}</option>`).join('');
  el('featured-selects').innerHTML = Array.from({ length: 3 }, (_, index) => `<label>Hueco ${index + 1}<select data-featured-slot="${index}"><option value="">Sin carta</option>${options}</select></label>`).join('');
  document.querySelectorAll('[data-featured-slot]').forEach((select, index) => { select.value = featuredCardIds[index] || ''; });
  el('featured-message').textContent = availableCards.length ? '' : 'Primero añade alguna carta a tu colección.';
  el('featured-modal').showModal();
}
function updateLibraryProgress() {
  renderSetLibrary();
}
function renderSetLibrary() {
  if (!catalogEras.length) {
    el('set-library-root').innerHTML = '<div class="clean-placeholder"><span>◎</span><p>Inicia sesión para cargar el catálogo de sets.</p></div>';
    return;
  }
  const ownedValues = [...ownedCards.values()];
  el('set-library-root').innerHTML = catalogEras.map(era => {
    const sets = Object.entries(setDefinitions).filter(([, definition]) => definition.eraId === era.id).sort(([, first], [, second]) => first.sortOrder - second.sortOrder);
    if (!sets.length) return '';
    const years = sets.map(([, definition]) => definition.releaseDate?.slice(0, 4)).filter(Boolean);
    const yearLabel = years.length ? (years[0] === years.at(-1) ? years[0] : `${years[0]}–${years.at(-1)}`) : '';
    const setCards = sets.map(([setCode, definition]) => {
      const cardsInSet = allCatalogCards.filter(card => card.set_code === setCode);
      const ids = new Set(cardsInSet.map(card => card.id));
      const owned = ownedValues.filter(card => ids.has(card.card_id));
      const baseOwned = new Set(owned.map(card => card.card_id)).size;
      const variantTotal = cardsInSet.reduce((total, card) => total + (variantsByCard.get(card.id)?.length || 0), 0) || definition.variants;
      const basePercent = definition.cards ? Math.round(baseOwned / definition.cards * 100) : 0;
      const variantPercent = variantTotal ? Math.round(owned.length / variantTotal * 100) : 0;
      const releaseLabel = definition.releaseDate ? new Date(`${definition.releaseDate}T00:00:00`).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).replace('.', '').toUpperCase() : '';
      return `<button class="set-library-card" data-open-set="${setCode}"><div class="set-logo"><img src="${definition.logoUrl || 'icon.svg'}" alt="Logo de ${definition.name}" /></div><div class="set-library-info"><p class="eyebrow">${releaseLabel}</p><h3>${definition.name}</h3><p>${definition.cards} cartas · ${variantTotal} variantes</p><div class="library-metric"><div class="library-progress-label"><span>Set completo</span><b>${baseOwned}/${definition.cards} · ${basePercent}%</b></div><div class="library-progress"><span style="width:${basePercent}%"></span></div></div><div class="library-metric"><div class="library-progress-label"><span>Todas las variantes</span><b>${owned.length}/${variantTotal} · ${variantPercent}%</b></div><div class="library-progress variant"><span style="width:${variantPercent}%"></span></div></div></div><span class="set-arrow">→</span></button>`;
    }).join('');
    return `<section class="era-section"><div class="era-heading"><div><span class="era-mark">${era.name}</span><div><h2>Era ${era.name}</h2><p>${yearLabel}</p></div></div><span>${sets.length} ${sets.length === 1 ? 'set' : 'sets'}</span></div><div class="set-library">${setCards}</div></section>`;
  }).join('');
}
function renderAlbums() {
  el('album-grid').innerHTML = albums.map(a => `<article class="album-card"><div class="album-cover ${a.style}"><b>${a.name}</b><span>${a.cards} cartas</span></div><div class="album-body"><h3>${a.name}</h3><p>${a.description || 'Un álbum de tu colección.'}</p><div class="album-footer"><span>${a.visibility === 'Solo yo' ? '◉ Privado' : '♧ Amigos'}</span><button class="text-button">Ver álbum →</button></div></div></article>`).join('') || '<div class="clean-empty"><span>▤</span><h3>No tienes álbumes todavía</h3><p>Crea el primero cuando quieras organizar una selección de cartas.</p></div>';
}
const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const profileAvatar = profile => {
  const color = /^#[0-9a-f]{6}$/i.test(profile?.avatar_color || '') ? profile.avatar_color : '#ffd255';
  return `<div class="avatar" style="background:${color}">${escapeHTML(profile?.display_name?.trim().charAt(0).toUpperCase() || '?')}</div>`;
};
function friendshipForUser(userId) {
  return friendships.find(friendship => friendship.requester_id === userId || friendship.addressee_id === userId);
}
function renderFriendships() {
  if (!remoteUser) {
    el('friend-requests').innerHTML = '<div class="friends-empty">Inicia sesión para gestionar solicitudes.</div>';
    el('friends-list').innerHTML = '<div class="friends-empty">Tus amigos aparecerán aquí.</div>';
    return;
  }
  const pending = friendships.filter(friendship => friendship.status === 'pending');
  el('friend-requests-section').hidden = !pending.length;
  el('friend-requests').innerHTML = pending.map(friendship => {
    const incoming = friendship.addressee_id === remoteUser.id;
    const profile = incoming ? friendship.requester : friendship.addressee;
    return `<article class="friend-row">${profileAvatar(profile)}<div class="friend-row-info"><strong>${escapeHTML(profile.display_name)}</strong><small>${incoming ? 'Quiere añadirte como amigo' : 'Solicitud enviada'}</small></div><div class="friend-row-actions">${incoming ? `<button class="friend-action" data-friend-action="accept" data-friendship-id="${friendship.id}">Aceptar</button><button class="friend-action secondary" data-friend-action="delete" data-friendship-id="${friendship.id}">Rechazar</button>` : `<button class="friend-action secondary" data-friend-action="delete" data-friendship-id="${friendship.id}">Cancelar</button>`}</div></article>`;
  }).join('');
  const accepted = friendships.filter(friendship => friendship.status === 'accepted');
  el('friends-list').innerHTML = accepted.map(friendship => {
    const profile = friendship.requester_id === remoteUser.id ? friendship.addressee : friendship.requester;
    return `<article class="friend-card">${profileAvatar(profile)}<h3>${escapeHTML(profile.display_name)}</h3><p>Ya podéis compartir vuestra colección.</p><span class="friend-state">Amigos</span><button class="friend-profile-button" data-view-friend="${profile.id}">Ver perfil →</button></article>`;
  }).join('') || '<div class="friends-empty"><span>♧</span><p>Aún no tienes amigos. Busca un entrenador por su nombre.</p></div>';
}
async function loadFriends() {
  if (!remoteUser) { friendships = []; renderFriendships(); return; }
  friendships = await remote.loadFriendships(remoteUser.id);
  renderFriendships();
}
async function searchFriends() {
  if (!remoteUser) { el('auth-modal').showModal(); return; }
  const query = el('friend-search-input').value.trim();
  if (query.length < 2) { el('friend-search-results').innerHTML = '<div class="friends-empty">Escribe al menos dos caracteres.</div>'; return; }
  el('friend-search-results').innerHTML = '<div class="friends-empty">Buscando…</div>';
  try {
    const profiles = await remote.searchProfiles(query, remoteUser.id);
    el('friend-search-results').innerHTML = profiles.map(profile => {
      const existing = friendshipForUser(profile.id);
      const label = existing?.status === 'accepted' ? 'Ya sois amigos' : existing ? 'Solicitud pendiente' : 'Añadir';
      return `<article class="friend-row">${profileAvatar(profile)}<div class="friend-row-info"><strong>${escapeHTML(profile.display_name)}</strong><small>Entrenador PokéBinder</small></div><button class="friend-action" data-add-friend="${profile.id}" ${existing ? 'disabled' : ''}>${label}</button></article>`;
    }).join('') || '<div class="friends-empty">No hemos encontrado ningún entrenador con ese nombre.</div>';
  } catch (error) {
    el('friend-search-results').innerHTML = `<div class="friends-empty">No se pudo buscar: ${escapeHTML(error.message)}</div>`;
  }
}
function showFriendsOverview() {
  el('friends-overview').hidden = false;
  el('friend-profile').hidden = true;
}
async function openFriendProfile(userId) {
  el('friends-overview').hidden = true;
  el('friend-profile').hidden = false;
  el('friend-profile-content').innerHTML = '<div class="friends-empty">Cargando perfil…</div>';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  try {
    const [profile, collection, sharedAlbums] = await Promise.all([
      remote.loadPublicProfile(userId),
      remote.loadOwnedCards(userId),
      remote.loadAlbums(userId)
    ]);
    activeFriendProfile = { profile, collection, sharedAlbums: sharedAlbums.filter(album => album.visibility !== 'private') };
    renderFriendProfile();
  } catch (error) {
    el('friend-profile-content').innerHTML = `<div class="friends-empty">No se pudo cargar el perfil: ${escapeHTML(error.message)}</div>`;
  }
}
function renderFriendProfile() {
    const { profile, collection, sharedAlbums } = activeFriendProfile;
    const ownedCardIds = new Set(collection.map(item => item.card_id));
    const featured = (profile.featured_card_ids || []).map(id => allCatalogCards.find(card => card.id === id)).filter(card => card && ownedCardIds.has(card.id));
    const featuredMarkup = Array.from({ length: 3 }, (_, index) => {
      const card = featured[index];
      return card ? `<figure class="friend-featured-card"><img src="${card.image_large_url || card.image_small_url}" alt="${escapeHTML(card.name)}" loading="lazy" /></figure>` : '<div class="friend-featured-empty">＋</div>';
    }).join('');
    const groupedCollection = new Map();
    collection.forEach(item => {
      if (!groupedCollection.has(item.card_id)) groupedCollection.set(item.card_id, []);
      groupedCollection.get(item.card_id).push(item);
    });
    const progressMarkup = Object.entries(setDefinitions).map(([setCode, definition]) => {
      const ids = new Set(allCatalogCards.filter(card => card.set_code === setCode).map(card => card.id));
      const setCollection = collection.filter(item => ids.has(item.card_id));
      const baseOwned = new Set(setCollection.map(item => item.card_id)).size;
      const basePercent = definition.cards ? Math.round(baseOwned / definition.cards * 100) : 0;
      const variantPercent = definition.variants ? Math.round(setCollection.length / definition.variants * 100) : 0;
      return `<button class="friend-set-progress" data-open-friend-set="${setCode}"><div class="friend-set-title"><div><strong>${escapeHTML(definition.name)}</strong><small>${baseOwned}/${definition.cards} cartas</small></div><span>Ver cartas →</span></div><div class="friend-progress-line"><span>Set completo</span><b>${basePercent}%</b></div><div class="progress"><span style="width:${basePercent}%"></span></div><div class="friend-progress-line"><span>Variantes</span><b>${variantPercent}%</b></div><div class="progress variant-progress"><span style="width:${variantPercent}%"></span></div></button>`;
    }).join('');
    const albumMarkup = sharedAlbums.map(album => `<article class="friend-shared-album"><div class="album-cover ${album.cover_style === 'teal' ? 'alt' : album.cover_style === 'gold' ? 'gold' : ''}"><b>${escapeHTML(album.title)}</b><span>Álbum compartido</span></div><div><strong>${escapeHTML(album.title)}</strong><p>${escapeHTML(album.description || 'Sin descripción.')}</p></div></article>`).join('') || '<div class="friends-empty">No ha compartido ningún álbum.</div>';
    const cardById = new Map(allCatalogCards.map(card => [card.id, card]));
    const tradeCandidates = collection.filter(item => Number(item.quantity) > 1 && !ownedCards.has(`${item.card_id}:${item.variant_code}`)).sort((first, second) => {
      const firstCard = cardById.get(first.card_id);
      const secondCard = cardById.get(second.card_id);
      return (setDefinitions[firstCard?.set_code]?.sortOrder || 0) - (setDefinitions[secondCard?.set_code]?.sortOrder || 0) || Number(firstCard?.card_number || 0) - Number(secondCard?.card_number || 0);
    });
    const tradeMarkup = tradeCandidates.map(item => {
      const card = cardById.get(item.card_id);
      if (!card) return '';
      const variant = variantsByCard.get(card.id)?.find(entry => entry.variant_code === item.variant_code);
      const spareCopies = Number(item.quantity) - 1;
      return `<button class="friend-trade-card" data-open-friend-set="${escapeHTML(card.set_code)}"><img src="${card.image_small_url}" alt="${escapeHTML(card.name)}" loading="lazy" /><div><strong>${escapeHTML(card.name)}</strong><small>${escapeHTML(card.set_name)} · #${escapeHTML(card.card_number)}</small><span>${escapeHTML(variant?.label || item.variant_code)}</span><b>${spareCopies} ${spareCopies === 1 ? 'copia disponible' : 'copias disponibles'} · Ver set →</b></div></button>`;
    }).join('') || '<div class="friends-empty">Ahora mismo no tiene repetidas que te falten.</div>';
    const totalCopies = collection.reduce((sum, item) => sum + Number(item.quantity), 0);
    const startedSets = Object.keys(setDefinitions).filter(setCode => collection.some(item => item.card_id.startsWith(`${setCode}-`))).length;
    const safeColor = /^#[0-9a-f]{6}$/i.test(profile.avatar_color || '') ? profile.avatar_color : '#ffd255';
    el('friend-profile-content').innerHTML = `<header class="friend-profile-header"><div class="avatar large" style="background:${safeColor}">${escapeHTML(profile.display_name.trim().charAt(0).toUpperCase())}</div><div><p class="eyebrow">PERFIL DE ENTRENADOR</p><h1>${escapeHTML(profile.display_name)}</h1><p>${totalCopies} copias · ${groupedCollection.size} cartas distintas · ${startedSets} sets iniciados</p></div></header><section class="friend-profile-section"><div class="section-heading"><div><h2>Escaparate</h2><p>Sus cartas destacadas.</p></div></div><div class="friend-featured-grid">${featuredMarkup}</div></section><section class="friend-profile-section"><div class="section-heading"><div><h2>Repetidas que no tengo</h2><p>Posibles intercambios: le sobra esa variante y a ti te falta.</p></div><span class="friend-trade-count">${tradeCandidates.length}</span></div><div class="friend-trade-grid">${tradeMarkup}</div></section><section class="friend-profile-section"><div class="section-heading"><div><h2>Sets</h2><p>Pulsa en uno para ver qué cartas tiene y cuáles le faltan.</p></div></div><div class="friend-progress-grid">${progressMarkup}</div></section><section class="friend-profile-section"><div class="section-heading"><div><h2>Colección</h2><p>Álbumes que ha compartido con sus amigos.</p></div></div><div class="friend-album-grid">${albumMarkup}</div></section>`;
}
function renderFriendSetDetail(setCode) {
  if (!activeFriendProfile || !setDefinitions[setCode]) return;
  const { profile, collection } = activeFriendProfile;
  const definition = setDefinitions[setCode];
  const cardsInSet = allCatalogCards.filter(card => card.set_code === setCode);
  const groupedCollection = new Map();
  collection.forEach(item => {
    if (!groupedCollection.has(item.card_id)) groupedCollection.set(item.card_id, []);
    groupedCollection.get(item.card_id).push(item);
  });
  const ownedBase = cardsInSet.filter(card => groupedCollection.has(card.id)).length;
  const cardsMarkup = cardsInSet.map(card => {
    const ownedVariants = groupedCollection.get(card.id) || [];
    const availableVariants = variantsByCard.get(card.id) || [];
    const variantMarkup = availableVariants.map(variant => {
      const owned = ownedVariants.find(item => item.variant_code === variant.variant_code);
      const availableTrade = owned && Number(owned.quantity) > 1 && !ownedCards.has(`${card.id}:${variant.variant_code}`);
      return `<span class="friend-variant-state ${owned ? 'owned' : 'missing'} ${availableTrade ? 'trade-match' : ''}"><i>${owned ? '✓' : '×'}</i>${escapeHTML(variant.label)}${owned ? ` · ${owned.quantity} ${Number(owned.quantity) === 1 ? 'copia' : 'copias'}` : ''}${availableTrade ? '<b>Te falta y le sobra</b>' : ''}</span>`;
    }).join('');
    return `<article class="friend-set-card ${ownedVariants.length ? 'owned' : 'missing'}"><div class="friend-card-image"><img src="${card.image_small_url}" alt="${escapeHTML(card.name)}" loading="lazy" /><span>${ownedVariants.length ? 'La tiene' : 'Le falta'}</span></div><div><strong>${escapeHTML(card.name)}</strong><small>#${escapeHTML(card.card_number)} · ${escapeHTML(card.rarity || 'Unknown')}</small><div class="friend-card-variants">${variantMarkup}</div></div></article>`;
  }).join('');
  el('friend-profile-content').innerHTML = `<button class="back-button friend-profile-back" data-back-friend-profile>← Perfil de ${escapeHTML(profile.display_name)}</button><div class="friend-set-detail-heading"><div><p class="eyebrow">COLECCIÓN DE ${escapeHTML(profile.display_name).toUpperCase()}</p><h1>${escapeHTML(definition.name)}</h1><p>${ownedBase}/${cardsInSet.length} cartas del set</p></div><div class="friend-set-legend"><span><i class="owned"></i>La tiene</span><span><i class="missing"></i>Le falta</span></div></div><div class="friend-set-card-grid">${cardsMarkup}</div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === id));
  document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.view === id));
  if (id === 'coleccion') showCollectionIndex();
  if (id === 'amigos') {
    showFriendsOverview();
    if (remoteUser) loadFriends().catch(error => showToast(`No se pudieron cargar los amigos: ${error.message}`, true));
  }
  document.querySelector('.sidebar').classList.remove('open'); window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showCollectionIndex() {
  el('collection-index').hidden = false;
  el('collection-detail').hidden = true;
}
function showCollectionDetail(setCode = activeSetCode) {
  activeSetCode = setCode;
  catalogCards = allCatalogCards.filter(card => card.set_code === setCode);
  const definition = setDefinitions[setCode];
  el('active-set-name').textContent = definition.name;
  el('active-set-badge').textContent = `${definition.cards} cartas · ${definition.variants} variantes`;
  el('card-search').value = '';
  el('rarity-filter').value = 'all';
  el('collection-index').hidden = true;
  el('collection-detail').hidden = false;
  renderCards();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
document.querySelector('.menu-button').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
['card-search', 'rarity-filter'].forEach(id => el(id).addEventListener('input', renderCards));
el('set-library-root').addEventListener('click', event => {
  const setButton = event.target.closest('[data-open-set]');
  if (setButton) showCollectionDetail(setButton.dataset.openSet);
});
el('back-to-sets').addEventListener('click', showCollectionIndex);
el('edit-featured-cards').addEventListener('click', openFeaturedEditor);
el('save-featured-cards').addEventListener('click', async () => {
  const selected = [...document.querySelectorAll('[data-featured-slot]')].map(select => select.value).filter(Boolean);
  if (new Set(selected).size !== selected.length) { el('featured-message').textContent = 'Elige una carta diferente para cada hueco.'; return; }
  featuredCardIds = selected;
  localStorage.setItem('pokebinder-featured-cards', JSON.stringify(featuredCardIds));
  renderFeaturedCards();
  try {
    const { error } = await remote.saveFeaturedCards(remoteUser.id, featuredCardIds);
    if (error) throw error;
    showToast('Escaparate guardado.');
  } catch (error) {
    showToast('Guardado en este dispositivo. Falta aplicar la migración del escaparate en Supabase.', true);
  }
  el('featured-modal').close();
});
el('friend-search-button').addEventListener('click', searchFriends);
el('friend-search-input').addEventListener('keydown', event => { if (event.key === 'Enter') searchFriends(); });
el('friend-search-results').addEventListener('click', async event => {
  const button = event.target.closest('[data-add-friend]');
  if (!button || button.disabled) return;
  button.disabled = true;
  const { error } = await remote.sendFriendRequest(remoteUser.id, button.dataset.addFriend);
  if (error) { showToast(`No se pudo enviar la solicitud: ${error.message}`, true); button.disabled = false; return; }
  showToast('Solicitud de amistad enviada.');
  await loadFriends();
  await searchFriends();
});
el('friend-requests').addEventListener('click', async event => {
  const button = event.target.closest('[data-friend-action]');
  if (!button || button.disabled) return;
  button.disabled = true;
  const action = button.dataset.friendAction;
  const result = action === 'accept' ? await remote.acceptFriendRequest(button.dataset.friendshipId) : await remote.deleteFriendship(button.dataset.friendshipId);
  if (result.error) { showToast(`No se pudo actualizar la solicitud: ${result.error.message}`, true); button.disabled = false; return; }
  showToast(action === 'accept' ? 'Ya sois amigos.' : 'Solicitud eliminada.');
  await loadFriends();
});
el('friends-list').addEventListener('click', event => {
  const button = event.target.closest('[data-view-friend]');
  if (button) openFriendProfile(button.dataset.viewFriend);
});
el('friend-profile-content').addEventListener('click', event => {
  const setButton = event.target.closest('[data-open-friend-set]');
  if (setButton) renderFriendSetDetail(setButton.dataset.openFriendSet);
  if (event.target.closest('[data-back-friend-profile]')) {
    renderFriendProfile();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
el('back-to-friends').addEventListener('click', showFriendsOverview);
el('open-card-modal')?.addEventListener('click', () => el('card-modal').showModal());
el('open-album-modal').addEventListener('click', () => el('album-modal').showModal());
el('save-card')?.addEventListener('click', (event) => { const form = event.target.closest('form'); if (!form.checkValidity()) return; cards.unshift({ name: el('new-card-name').value, set: el('new-card-set').value, number: el('new-card-number').value, quantity: +el('new-card-quantity').value, rarity: el('new-card-rarity').value, icon: '✦', art: 'yellow' }); save(); renderCards(); form.reset(); });
el('save-album').addEventListener('click', (event) => { const form = event.target.closest('form'); if (!form.checkValidity()) return; albums.unshift({ name: el('new-album-name').value, description: el('new-album-description').value, visibility: el('new-album-visibility').value, cards: 0, style: albums.length % 2 ? 'alt' : 'gold' }); save(); renderAlbums(); form.reset(); });
async function toggleOwnedCard(variantButton) {
  if (!variantButton || !remoteUser || !catalogCards.length || variantButton.disabled) return;
  const cardId = variantButton.dataset.cardId;
  const variantCode = variantButton.dataset.variantCode;
  const ownershipKey = `${cardId}:${variantCode}`;
  variantButton.disabled = true;
  try {
    if (ownedCards.has(ownershipKey)) {
      const { error } = await remote.removeOwnedCard(remoteUser.id, cardId, variantCode);
      if (error) throw error;
      ownedCards.delete(ownershipKey);
      showToast('Variante eliminada de tu colección.');
    } else {
      const { error } = await remote.setCardOwned(remoteUser.id, cardId, variantCode);
      if (error) throw error;
      ownedCards.set(ownershipKey, { card_id: cardId, variant_code: variantCode, quantity: 1 });
      showToast('Variante añadida a tu colección.');
    }
    renderCards();
  } catch (error) {
    variantButton.disabled = false;
    showToast(`No se pudo guardar: ${error.message}`, true);
    console.error('No se pudo actualizar la colección:', error.message);
  }
}
async function adjustOwnedQuantity(quantityButton) {
  if (!quantityButton || !remoteUser || quantityButton.disabled) return;
  const cardId = quantityButton.dataset.cardId;
  const variantCode = quantityButton.dataset.variantCode;
  const ownershipKey = `${cardId}:${variantCode}`;
  const owned = ownedCards.get(ownershipKey);
  if (!owned) return;
  const change = quantityButton.dataset.quantityAction === 'increase' ? 1 : -1;
  const nextQuantity = Math.max(0, Math.min(999, Number(owned.quantity) + change));
  quantityButton.disabled = true;
  try {
    if (nextQuantity === 0) {
      const { error } = await remote.removeOwnedCard(remoteUser.id, cardId, variantCode);
      if (error) throw error;
      ownedCards.delete(ownershipKey);
      showToast('Variante eliminada de tu colección.');
    } else {
      const { error } = await remote.updateOwnedQuantity(remoteUser.id, cardId, variantCode, nextQuantity);
      if (error) throw error;
      ownedCards.set(ownershipKey, { ...owned, quantity: nextQuantity });
    }
    renderCards();
  } catch (error) {
    quantityButton.disabled = false;
    showToast(`No se pudo actualizar la cantidad: ${error.message}`, true);
  }
}
el('card-grid').addEventListener('click', event => {
  const quantityButton = event.target.closest('[data-quantity-action]');
  if (quantityButton) { adjustOwnedQuantity(quantityButton); return; }
  toggleOwnedCard(event.target.closest('.variant-toggle'));
});
document.addEventListener('click', event => {
  const closeButton = event.target.closest('.modal-close');
  if (!closeButton) return;
  event.preventDefault();
  const dialog = closeButton.closest('dialog');
  if (dialog?.open) dialog.close();
});
renderCards(); renderAlbums(); renderFriendships();

async function syncToCloud() {
  if (!remote || !remoteUser) return;
  try { await remote.replaceCards(remoteUser.id, cards); await remote.replaceAlbums(remoteUser.id, albums); }
  catch (error) { console.error('No se pudo sincronizar PokéBinder:', error.message); }
}

async function activateCloudSession() {
  if (!remote) return;
  try { remoteUser = await remote.currentUser(); }
  catch (error) { applyIdentity(); renderCards(); showToast(`No se pudo comprobar la sesión: ${error.message}`, true); return; }
  if (!remoteUser) return;
  el('auth-button').textContent = 'Salir';

  try {
    const profile = await remote.loadProfile(remoteUser.id);
    applyIdentity(profile.display_name);
  } catch (error) {
    const fallbackName = remoteUser.email?.split('@')[0] || 'Entrenador';
    applyIdentity(fallbackName);
    showToast(`Sesión activa; no se pudo cargar el perfil: ${error.message}`, true);
  }

  try {
    const cloudFeaturedCards = await remote.loadFeaturedCards(remoteUser.id);
    featuredCardIds = cloudFeaturedCards;
    localStorage.setItem('pokebinder-featured-cards', JSON.stringify(featuredCardIds));
  } catch (error) {
    console.info('El escaparate todavía no está sincronizado con Supabase.');
  }

  try {
    const [eras, sets] = await Promise.all([remote.loadEras(), remote.loadSets()]);
    catalogEras = eras;
    setDefinitions = Object.fromEntries(sets.map(set => [set.id, {
      name: set.name,
      cards: set.printed_total,
      printedTotal: set.printed_total,
      variants: 0,
      eraId: set.era_id,
      releaseDate: set.release_date,
      logoUrl: set.logo_url,
      sortOrder: set.sort_order
    }]));
    activeSetCode = setDefinitions[activeSetCode] ? activeSetCode : sets[0]?.id;
    const setCount = sets.length;
    el('available-sets-count').textContent = setCount;
    el('available-sets-label').textContent = setCount === 1 ? 'Set disponible' : 'Sets disponibles';
    el('hero-set-count').textContent = setCount;
  } catch (error) {
    showToast(`No se pudo cargar la lista de sets: ${error.message}`, true);
  }

  try {
    const catalogs = await Promise.all(Object.keys(setDefinitions).map(setCode => remote.loadCatalog(setCode)));
    allCatalogCards = catalogs.flat();
    Object.entries(setDefinitions).forEach(([setCode, definition]) => {
      definition.cards = allCatalogCards.filter(card => card.set_code === setCode).length;
    });
    catalogCards = allCatalogCards.filter(card => card.set_code === activeSetCode);
  } catch (error) {
    catalogCards = [];
    showToast(`No se pudo cargar el catálogo: ${error.message}`, true);
  }

  try {
    const variants = await remote.loadCardVariants(allCatalogCards.map(card => card.id));
    variantMigrationReady = true;
    variantsByCard = variants.reduce((map, variant) => {
      if (!map.has(variant.card_id)) map.set(variant.card_id, []);
      map.get(variant.card_id).push(variant);
      return map;
    }, new Map());
    Object.entries(setDefinitions).forEach(([setCode, definition]) => {
      definition.variants = allCatalogCards.filter(card => card.set_code === setCode).reduce((total, card) => total + (variantsByCard.get(card.id)?.length || 0), 0);
    });
  } catch (error) {
    variantMigrationReady = false;
    variantsByCard = new Map(allCatalogCards.map(card => [card.id, [{ card_id: card.id, variant_code: 'standard', label: card.rarity === 'Rare BREAK' ? 'BREAK' : card.rarity?.startsWith('Rare Holo') || ['Rare Ultra', 'Rare Secret'].includes(card.rarity) ? 'Holo' : 'Standard', sort_order: 1 }]]));
    showToast('Sesión activa. Falta aplicar la migración de variantes en Supabase.', true);
  }

  try {
    let collection;
    try { collection = await remote.loadOwnedCards(remoteUser.id); }
    catch { collection = await remote.loadOwnedCardsLegacy(remoteUser.id); }
    ownedCards = new Map(collection.map(card => [`${card.card_id}:${card.variant_code || 'standard'}`, card]));
  } catch (error) {
    ownedCards = new Map();
    showToast(`No se pudo cargar tu colección: ${error.message}`, true);
  }

  try {
    const cloudAlbums = await remote.loadAlbums(remoteUser.id);
    albums = cloudAlbums.filter(album => !demoAlbumNames.has(album.title)).map(album => ({ name: album.title, description: album.description, visibility: album.visibility === 'private' ? 'Solo yo' : 'Amigos', cards: 0, style: album.cover_style === 'teal' ? 'alt' : album.cover_style === 'gold' ? 'gold' : '' }));
  } catch (error) { showToast(`No se pudieron cargar los álbumes: ${error.message}`, true); }

  try { await loadFriends(); }
  catch (error) { friendships = []; renderFriendships(); showToast(`No se pudieron cargar los amigos: ${error.message}`, true); }

  renderCards(); renderAlbums();
  if (!remoteUser.user_metadata?.pokebinder_setup_complete) el('password-modal').showModal();
}

function clearCloudSession() {
  clearTimeout(remoteTimer);
  remoteUser = null;
  catalogCards = []; allCatalogCards = []; catalogEras = []; setDefinitions = {};
  variantsByCard = new Map(); ownedCards = new Map(); friendships = []; activeFriendProfile = null;
  albums = []; featuredCardIds = [];
  applyIdentity();
  el('available-sets-count').textContent = '0';
  el('available-sets-label').textContent = 'Sets disponibles';
  el('auth-button').textContent = 'Entrar';
  if (el('password-modal').open) el('password-modal').close();
  showFriendsOverview();
  renderCards(); renderAlbums(); renderFriendships();
}
const sessionMissing = error => error?.name === 'AuthSessionMissingError' || /auth session missing/i.test(error?.message || '');
el('auth-button').addEventListener('click', async () => {
  if (remoteUser) { await remote.signOut(); clearCloudSession(); return; }
  el('auth-modal').showModal();
});
el('close-auth').addEventListener('click', () => el('auth-modal').close());
el('auth-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!remote) return;
  const message = el('auth-message'); message.textContent = 'Entrando…';
  const { error } = await remote.signIn(el('auth-email').value, el('auth-password').value);
  if (error) { message.textContent = sessionMissing(error) ? 'No hay una sesión de invitación activa. Abre de nuevo el enlace de invitación en este navegador; si ha caducado, pide una invitación nueva.' : 'No hemos podido entrar: ' + error.message; return; }
  el('auth-modal').close(); await activateCloudSession();
});
el('password-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = el('new-password').value;
  const displayName = el('display-name').value.trim();
  const message = el('password-message');
  if (password !== el('repeat-password').value) { message.textContent = 'Las contraseñas no coinciden.'; return; }
  message.textContent = 'Guardando…';
  const { error } = await remote.setPassword(password);
  if (error) {
    if (sessionMissing(error)) {
      clearCloudSession();
      el('auth-message').textContent = 'La sesión de la invitación ha caducado o se abrió en otro navegador. Abre de nuevo el enlace; si ya no funciona, pide una invitación nueva.';
      el('auth-modal').showModal();
    } else {
      message.textContent = 'No hemos podido guardar la contraseña: ' + error.message;
    }
    return;
  }
  const { error: profileError } = await remote.updateProfile(remoteUser.id, displayName);
  if (profileError) { message.textContent = 'La contraseña se guardó, pero el nombre no: ' + profileError.message; return; }
  el('password-modal').close();
});
activateCloudSession();

let deferredInstall;
const installBanner = el('install-banner');
const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
if (!isInstalled && !localStorage.getItem('pokebinder-install-dismissed')) installBanner.hidden = false;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstall = event;
  if (!localStorage.getItem('pokebinder-install-dismissed')) installBanner.hidden = false;
});
el('install-app').addEventListener('click', async () => {
  if (deferredInstall) {
    deferredInstall.prompt();
    await deferredInstall.userChoice;
    deferredInstall = null;
    installBanner.hidden = true;
    return;
  }
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  el('install-help-content').innerHTML = isIOS
    ? '<ol><li>Abre PokéBinder en <b>Safari</b>.</li><li>Pulsa el botón <b>Compartir</b> (el cuadrado con una flecha hacia arriba).</li><li>Selecciona <b>Añadir a pantalla de inicio</b>.</li><li>Pulsa <b>Añadir</b>.</li></ol><p class="install-note">En iPhone, la instalación se hace siempre desde el menú Compartir de Safari.</p>'
    : '<ol><li>Abre el menú de tu navegador.</li><li>Selecciona <b>Instalar aplicación</b> o <b>Añadir a pantalla de inicio</b>.</li><li>Confirma pulsando <b>Instalar</b>.</li></ol><p class="install-note">Si no aparece esa opción, abre PokéBinder con Chrome, Edge o Safari.</p>';
  el('install-help-modal').showModal();
});
el('close-install-help').addEventListener('click', () => el('install-help-modal').close());
el('dismiss-install').addEventListener('click', () => { localStorage.setItem('pokebinder-install-dismissed', '1'); installBanner.hidden = true; });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js'));
