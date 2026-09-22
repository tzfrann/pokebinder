// Genera el SQL de importación de XY Base Set a partir del JSON descargado.
// No requiere claves y no envía datos: solo escribe seed-xy1.sql localmente.
const fs = require('fs');
const path = require('path');
const cards = JSON.parse(fs.readFileSync(path.join(__dirname, 'xy1-source.json'), 'utf8'));
const quote = value => value == null ? 'null' : "'" + String(value).replaceAll("'", "''") + "'";
const row = card => [
  quote(card.id), quote(card.name), quote('xy1'), quote('XY'), quote(card.number), quote(card.rarity),
  quote(card.images?.small), quote(card.images?.large), quote('2014-02-05')
].join(', ');

const sql = `-- Generado desde PokemonTCG/pokemon-tcg-data · XY Base Set (${cards.length} cartas)\n` +
`insert into public.card_eras (id, name, sort_order) values ('xy', 'XY', 1)\non conflict (id) do update set name = excluded.name, sort_order = excluded.sort_order;\n\n` +
`insert into public.card_sets (id, era_id, name, printed_total, release_date, logo_url, sort_order)\nvalues ('xy1', 'xy', 'XY Base Set', ${cards.length}, '2014-02-05', 'https://images.pokemontcg.io/xy1/logo.png', 1)\non conflict (id) do update set era_id = excluded.era_id, name = excluded.name, printed_total = excluded.printed_total, release_date = excluded.release_date, logo_url = excluded.logo_url, sort_order = excluded.sort_order;\n\n` +
`insert into public.card_catalog (id, name, set_code, set_name, card_number, rarity, image_small_url, image_large_url, release_date) values\n` +
cards.map(card => `  (${row(card)})`).join(',\n') +
`\non conflict (id) do update set name = excluded.name, set_code = excluded.set_code, set_name = excluded.set_name, card_number = excluded.card_number, rarity = excluded.rarity, image_small_url = excluded.image_small_url, image_large_url = excluded.image_large_url, release_date = excluded.release_date;\n`;
fs.writeFileSync(path.join(__dirname, 'seed-xy1.sql'), sql);
console.log(`Generado seed-xy1.sql con ${cards.length} cartas.`);
