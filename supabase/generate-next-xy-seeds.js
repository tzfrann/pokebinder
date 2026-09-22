// Genera los SQL de XY—Phantom Forces y XY—Primal Clash desde los JSON de PokemonTCG.
// Descarga xy4.json y xy5.json de PokemonTCG/pokemon-tcg-data/cards/en/ como
// xy4-source.json y xy5-source.json en esta carpeta antes de ejecutarlo.
const fs = require('fs');
const path = require('path');

const sets = [
  { id: 'xy4', name: 'Phantom Forces', total: 119, secretCount: 3, date: '2014-11-05', order: 4 },
  { id: 'xy5', name: 'Primal Clash', total: 160, secretCount: 4, date: '2015-02-04', order: 5 }
];
const reverseRarities = new Set(['Common', 'Uncommon', 'Rare', 'Rare Holo']);
const holoRarities = new Set(['Rare Holo', 'Rare Holo EX', 'Rare Ultra', 'Rare Secret']);
const quote = value => value == null ? 'null' : `'${String(value).replaceAll("'", "''")}'`;

for (const set of sets) {
  const sourcePath = path.join(__dirname, `${set.id}-source.json`);
  const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const cards = source.filter(card => /^\d+$/.test(card.number));
  const expectedCount = set.total + set.secretCount;
  const numbers = new Set(cards.map(card => Number(card.number)));
  if (cards.length !== expectedCount || numbers.size !== expectedCount ||
      Array.from({ length: expectedCount }, (_, index) => index + 1).some(number => !numbers.has(number))) {
    throw new Error(`${set.id}: se esperaban las cartas numeradas 1–${expectedCount} sin huecos ni duplicados`);
  }
  if (cards.some(card => card.id !== `${set.id}-${card.number}` || !card.name || !card.rarity || !card.images?.small || !card.images?.large)) {
    throw new Error(`${set.id}: faltan identificadores, metadatos o imágenes`);
  }
  const variantCount = cards.length + cards.filter(card => reverseRarities.has(card.rarity)).length;
  const rows = cards.map(card => `  (${[
    card.id, card.name, set.id, set.name, card.number, card.rarity,
    card.images.small, card.images.large, set.date
  ].map(quote).join(', ')})`).join(',\n');
  const sql = `-- PokéBinder · XY—${set.name} (${set.total} numeradas + ${set.secretCount} secretas; ${variantCount} variantes).\n` +
    `-- Fuente: https://github.com/PokemonTCG/pokemon-tcg-data/blob/master/cards/en/${set.id}.json\n` +
    `-- Las impresiones alternativas con sufijo se omiten para mantener el número oficial del set.\n\n` +
    `begin;\n\n` +
    `insert into public.card_sets (id, era_id, name, printed_total, release_date, logo_url, sort_order)\n` +
    `values (${quote(set.id)}, 'xy', ${quote(`XY—${set.name}`)}, ${set.total}, ${quote(set.date)}, ${quote(`https://images.pokemontcg.io/${set.id}/logo.png`)}, ${set.order})\n` +
    `on conflict (id) do update set era_id = excluded.era_id, name = excluded.name, printed_total = excluded.printed_total, release_date = excluded.release_date, logo_url = excluded.logo_url, sort_order = excluded.sort_order;\n\n` +
    `insert into public.card_catalog (id, name, set_code, set_name, card_number, rarity, image_small_url, image_large_url, release_date) values\n` +
    rows +
    `\non conflict (id) do update set name = excluded.name, set_code = excluded.set_code, set_name = excluded.set_name, card_number = excluded.card_number, rarity = excluded.rarity, image_small_url = excluded.image_small_url, image_large_url = excluded.image_large_url, release_date = excluded.release_date;\n\n` +
    `insert into public.card_variants (card_id, variant_code, label, sort_order)\n` +
    `select id, 'standard', case when rarity in (${[...holoRarities].map(quote).join(', ')}) then 'Holo' else 'Standard' end, 1\n` +
    `from public.card_catalog where set_code = ${quote(set.id)}\n` +
    `on conflict (card_id, variant_code) do update set label = excluded.label, sort_order = excluded.sort_order;\n\n` +
    `insert into public.card_variants (card_id, variant_code, label, sort_order)\n` +
    `select id, 'reverse_holo', 'Reverse Holo', 2 from public.card_catalog\n` +
    `where set_code = ${quote(set.id)} and rarity in (${[...reverseRarities].map(quote).join(', ')})\n` +
    `on conflict (card_id, variant_code) do update set label = excluded.label, sort_order = excluded.sort_order;\n\n` +
    `commit;\n`;
  fs.writeFileSync(path.join(__dirname, `seed-${set.id}.sql`), sql);
  console.log(`${set.id}: ${cards.length} cartas, ${variantCount} variantes; seed-${set.id}.sql generado.`);
}
