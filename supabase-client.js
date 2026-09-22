window.pokeBinderRemote = (() => {
  const config = window.POKE_BINDER_SUPABASE;
  if (!config?.url || !config?.publishableKey || !window.supabase) return null;
  const client = window.supabase.createClient(config.url, config.publishableKey);

  return {
    client,
    async currentUser() {
      const { data: { session }, error: sessionError } = await client.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) return null;
      const { data: { user }, error } = await client.auth.getUser();
      if (error) throw error;
      return user;
    },
    async loadProfile(userId) {
      const { data, error } = await client.from('profiles').select('display_name').eq('id', userId).single();
      if (error) throw error;
      return data;
    },
    async signIn(email, password) {
      return client.auth.signInWithPassword({ email, password });
    },
    async setPassword(password) {
      return client.auth.updateUser({ password, data: { pokebinder_setup_complete: true } });
    },
    async updateProfile(userId, displayName) {
      return client.from('profiles').update({ display_name: displayName }).eq('id', userId);
    },
    async loadFeaturedCards(userId) {
      const { data, error } = await client.from('profiles').select('featured_card_ids').eq('id', userId).single();
      if (error) throw error;
      return data.featured_card_ids || [];
    },
    async saveFeaturedCards(userId, cardIds) {
      return client.from('profiles').update({ featured_card_ids: cardIds }).eq('id', userId);
    },
    async searchProfiles(query, currentUserId) {
      const { data, error } = await client.from('profiles').select('id, display_name, avatar_color').ilike('display_name', `%${query}%`).neq('id', currentUserId).order('display_name').limit(12);
      if (error) throw error;
      return data;
    },
    async loadPublicProfile(userId) {
      const { data, error } = await client.from('profiles').select('id, display_name, avatar_color, featured_card_ids').eq('id', userId).single();
      if (error) throw error;
      return data;
    },
    async loadFriendships(userId) {
      const { data, error } = await client.from('friendships').select('id, requester_id, addressee_id, status, created_at, requester:profiles!friendships_requester_id_fkey(id, display_name, avatar_color), addressee:profiles!friendships_addressee_id_fkey(id, display_name, avatar_color)').or(`requester_id.eq.${userId},addressee_id.eq.${userId}`).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async sendFriendRequest(requesterId, addresseeId) {
      return client.from('friendships').insert({ requester_id: requesterId, addressee_id: addresseeId });
    },
    async acceptFriendRequest(friendshipId) {
      return client.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
    },
    async deleteFriendship(friendshipId) {
      return client.from('friendships').delete().eq('id', friendshipId);
    },
    async signOut() { return client.auth.signOut(); },
    async loadCards(userId) {
      const { data, error } = await client.from('cards').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async loadCatalog(setCode) {
      const { data, error } = await client.from('card_catalog').select('*').eq('set_code', setCode);
      if (error) throw error;
      return data.sort((first, second) => first.card_number.localeCompare(second.card_number, 'en', { numeric: true, sensitivity: 'base' }));
    },
    async loadEras() {
      const { data, error } = await client.from('card_eras').select('id, name, sort_order').order('sort_order');
      if (error) throw error;
      return data;
    },
    async loadSets() {
      const { data, error } = await client.from('card_sets').select('id, era_id, name, printed_total, release_date, logo_url, sort_order').order('sort_order');
      if (error) throw error;
      return data;
    },
    async loadCardVariants(cardIds) {
      if (!cardIds.length) return [];
      // Cada lote queda por debajo del límite de filas de PostgREST al crecer el catálogo.
      const batches = [];
      for (let index = 0; index < cardIds.length; index += 100) {
        batches.push(cardIds.slice(index, index + 100));
      }
      const results = await Promise.all(batches.map(async batch => {
        const { data, error } = await client
          .from('card_variants')
          .select('card_id, variant_code, label, sort_order')
          .in('card_id', batch)
          .order('sort_order');
        if (error) throw error;
        return data;
      }));
      return results.flat();
    },
    async loadOwnedCards(userId) {
      const pageSize = 500;
      const rows = [];
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await client.from('user_card_collection')
          .select('card_id, variant_code, quantity, available_for_trade')
          .eq('user_id', userId)
          .order('card_id')
          .order('variant_code')
          .range(offset, offset + pageSize - 1);
        if (error) throw error;
        rows.push(...data);
        if (data.length < pageSize) return rows;
      }
    },
    async loadOwnedCardsLegacy(userId) {
      const { data, error } = await client.from('user_card_collection').select('card_id, quantity, available_for_trade').eq('user_id', userId);
      if (error) throw error;
      return data.map(card => ({ ...card, variant_code: 'standard' }));
    },
    async setCardOwned(userId, cardId, variantCode, quantity = 1) {
      return client.from('user_card_collection').insert({ user_id: userId, card_id: cardId, variant_code: variantCode, quantity });
    },
    async removeOwnedCard(userId, cardId, variantCode) {
      return client.from('user_card_collection').delete().eq('user_id', userId).eq('card_id', cardId).eq('variant_code', variantCode);
    },
    async updateOwnedQuantity(userId, cardId, variantCode, quantity) {
      return client.from('user_card_collection').update({ quantity }).eq('user_id', userId).eq('card_id', cardId).eq('variant_code', variantCode);
    },
    async replaceCards(userId, cards) {
      const { error: removeError } = await client.from('cards').delete().eq('user_id', userId);
      if (removeError) throw removeError;
      if (!cards.length) return;
      const rows = cards.map(card => ({ user_id: userId, card_name: card.name, set_name: card.set, card_number: card.number, rarity: card.rarity, quantity: Number(card.quantity) }));
      const { error } = await client.from('cards').insert(rows);
      if (error) throw error;
    },
    async loadAlbums(userId) {
      const { data, error } = await client.from('albums').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async replaceAlbums(userId, albums) {
      const { error: removeError } = await client.from('albums').delete().eq('user_id', userId);
      if (removeError) throw removeError;
      if (!albums.length) return;
      const rows = albums.map(album => ({ user_id: userId, title: album.name, description: album.description || null, visibility: album.visibility === 'Solo yo' ? 'private' : 'friends', cover_style: album.style === 'alt' ? 'teal' : album.style === 'gold' ? 'gold' : 'purple' }));
      const { error } = await client.from('albums').insert(rows);
      if (error) throw error;
    }
  };
})();
