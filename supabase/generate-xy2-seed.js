// Genera la migración completa de XY—Flashfire desde el dataset descargado.
const fs = require('fs');
const path = require('path');
const source = JSON.parse(fs.readFileSync(path.join(__dirname, 'xy2-source.json'), 'utf8'));
// 88a es una impresión alternativa promocional de Blacksmith, no otro número del set.
const cards = source.filter(card => card.number !== '88a');
const quote = value => value == null ? 'null' : "'" + String(value).replaceAll("'", "''") + "'";
const row = card => [
  quote(card.id), quote(card.name), quote('xy2'), quote('Flashfire'), quote(card.number), quote(card.rarity),
  quote(card.images?.small), quote(card.images?.large), quote('2014-05-07')
].join(', ');

const sql = `-- PokéBinder · XY—Flashfire (109 cartas numeradas, 200 variantes)\n` +
`-- Fuente de catálogo: PokemonTCG/pokemon-tcg-data.\n\n` +
`insert into public.card_sets (id, era_id, name, printed_total, release_date, logo_url, sort_order)\n` +
`values ('xy2', 'xy', 'XY—Flashfire', 109, '2014-05-07', 'https://images.pokemontcg.io/xy2/logo.png', 2)\n` +
`on conflict (id) do update set era_id = excluded.era_id, name = excluded.name, printed_total = excluded.printed_total, release_date = excluded.release_date, logo_url = excluded.logo_url, sort_order = excluded.sort_order;\n\n` +
`insert into public.card_catalog (id, name, set_code, set_name, card_number, rarity, image_small_url, image_large_url, release_date) values\n` +
cards.map(card => `  (${row(card)})`).join(',\n') +
`\non conflict (id) do update set name = excluded.name, set_code = excluded.set_code, set_name = excluded.set_name, card_number = excluded.card_number, rarity = excluded.rarity, image_small_url = excluded.image_small_url, image_large_url = excluded.image_large_url, release_date = excluded.release_date;\n\n` +
`insert into public.card_variants (card_id, variant_code, label, sort_order)\n` +
`select id, 'standard', case when rarity in ('Rare Holo', 'Rare Holo EX', 'Rare Ultra', 'Rare Secret') then 'Holo' else 'Standard' end, 1\n` +
`from public.card_catalog where set_code = 'xy2'\n` +
`on conflict (card_id, variant_code) do update set label = excluded.label, sort_order = excluded.sort_order;\n\n` +
`insert into public.card_variants (card_id, variant_code, label, sort_order)\n` +
`select id, 'reverse_holo', 'Reverse Holo', 2 from public.card_catalog\n` +
`where set_code = 'xy2' and rarity in ('Common', 'Uncommon', 'Rare', 'Rare Holo')\n` +
`on conflict (card_id, variant_code) do update set label = excluded.label, sort_order = excluded.sort_order;\n`;

fs.writeFileSync(path.join(__dirname, 'seed-xy2.sql'), sql);
console.log(`Generado seed-xy2.sql con ${cards.length} cartas.`);
