-- PokéBinder · XY—Ancient Origins (98 numeradas + 2 secretas; 172 variantes).
-- Fuente: https://github.com/PokemonTCG/pokemon-tcg-data/blob/master/cards/en/xy7.json
-- Las impresiones alternativas con sufijo se omiten para mantener el número oficial del set.

begin;

insert into public.card_sets (id, era_id, name, printed_total, release_date, logo_url, sort_order)
values ('xy7', 'xy', 'XY—Ancient Origins', 98, '2015-08-12', 'https://images.pokemontcg.io/xy7/logo.png', 7)
on conflict (id) do update set era_id = excluded.era_id, name = excluded.name, printed_total = excluded.printed_total, release_date = excluded.release_date, logo_url = excluded.logo_url, sort_order = excluded.sort_order;

insert into public.card_catalog (id, name, set_code, set_name, card_number, rarity, image_small_url, image_large_url, release_date) values
  ('xy7-1', 'Oddish', 'xy7', 'Ancient Origins', '1', 'Common', 'https://images.pokemontcg.io/xy7/1.png', 'https://images.pokemontcg.io/xy7/1_hires.png', '2015-08-12'),
  ('xy7-2', 'Gloom', 'xy7', 'Ancient Origins', '2', 'Uncommon', 'https://images.pokemontcg.io/xy7/2.png', 'https://images.pokemontcg.io/xy7/2_hires.png', '2015-08-12'),
  ('xy7-3', 'Vileplume', 'xy7', 'Ancient Origins', '3', 'Rare', 'https://images.pokemontcg.io/xy7/3.png', 'https://images.pokemontcg.io/xy7/3_hires.png', '2015-08-12'),
  ('xy7-4', 'Bellossom', 'xy7', 'Ancient Origins', '4', 'Uncommon', 'https://images.pokemontcg.io/xy7/4.png', 'https://images.pokemontcg.io/xy7/4_hires.png', '2015-08-12'),
  ('xy7-5', 'Spinarak', 'xy7', 'Ancient Origins', '5', 'Common', 'https://images.pokemontcg.io/xy7/5.png', 'https://images.pokemontcg.io/xy7/5_hires.png', '2015-08-12'),
  ('xy7-6', 'Ariados', 'xy7', 'Ancient Origins', '6', 'Uncommon', 'https://images.pokemontcg.io/xy7/6.png', 'https://images.pokemontcg.io/xy7/6_hires.png', '2015-08-12'),
  ('xy7-7', 'Sceptile-EX', 'xy7', 'Ancient Origins', '7', 'Rare Holo EX', 'https://images.pokemontcg.io/xy7/7.png', 'https://images.pokemontcg.io/xy7/7_hires.png', '2015-08-12'),
  ('xy7-8', 'M Sceptile-EX', 'xy7', 'Ancient Origins', '8', 'Rare Holo EX', 'https://images.pokemontcg.io/xy7/8.png', 'https://images.pokemontcg.io/xy7/8_hires.png', '2015-08-12'),
  ('xy7-9', 'Combee', 'xy7', 'Ancient Origins', '9', 'Common', 'https://images.pokemontcg.io/xy7/9.png', 'https://images.pokemontcg.io/xy7/9_hires.png', '2015-08-12'),
  ('xy7-10', 'Vespiquen', 'xy7', 'Ancient Origins', '10', 'Uncommon', 'https://images.pokemontcg.io/xy7/10.png', 'https://images.pokemontcg.io/xy7/10_hires.png', '2015-08-12'),
  ('xy7-11', 'Vespiquen', 'xy7', 'Ancient Origins', '11', 'Rare', 'https://images.pokemontcg.io/xy7/11.png', 'https://images.pokemontcg.io/xy7/11_hires.png', '2015-08-12'),
  ('xy7-12', 'Virizion', 'xy7', 'Ancient Origins', '12', 'Rare Holo', 'https://images.pokemontcg.io/xy7/12.png', 'https://images.pokemontcg.io/xy7/12_hires.png', '2015-08-12'),
  ('xy7-13', 'Flareon', 'xy7', 'Ancient Origins', '13', 'Uncommon', 'https://images.pokemontcg.io/xy7/13.png', 'https://images.pokemontcg.io/xy7/13_hires.png', '2015-08-12'),
  ('xy7-14', 'Entei', 'xy7', 'Ancient Origins', '14', 'Rare', 'https://images.pokemontcg.io/xy7/14.png', 'https://images.pokemontcg.io/xy7/14_hires.png', '2015-08-12'),
  ('xy7-15', 'Entei', 'xy7', 'Ancient Origins', '15', 'Rare Holo', 'https://images.pokemontcg.io/xy7/15.png', 'https://images.pokemontcg.io/xy7/15_hires.png', '2015-08-12'),
  ('xy7-16', 'Larvesta', 'xy7', 'Ancient Origins', '16', 'Common', 'https://images.pokemontcg.io/xy7/16.png', 'https://images.pokemontcg.io/xy7/16_hires.png', '2015-08-12'),
  ('xy7-17', 'Volcarona', 'xy7', 'Ancient Origins', '17', 'Rare Holo', 'https://images.pokemontcg.io/xy7/17.png', 'https://images.pokemontcg.io/xy7/17_hires.png', '2015-08-12'),
  ('xy7-18', 'Volcarona', 'xy7', 'Ancient Origins', '18', 'Rare', 'https://images.pokemontcg.io/xy7/18.png', 'https://images.pokemontcg.io/xy7/18_hires.png', '2015-08-12'),
  ('xy7-19', 'Magikarp', 'xy7', 'Ancient Origins', '19', 'Common', 'https://images.pokemontcg.io/xy7/19.png', 'https://images.pokemontcg.io/xy7/19_hires.png', '2015-08-12'),
  ('xy7-20', 'Gyarados', 'xy7', 'Ancient Origins', '20', 'Rare', 'https://images.pokemontcg.io/xy7/20.png', 'https://images.pokemontcg.io/xy7/20_hires.png', '2015-08-12'),
  ('xy7-21', 'Gyarados', 'xy7', 'Ancient Origins', '21', 'Rare Holo', 'https://images.pokemontcg.io/xy7/21.png', 'https://images.pokemontcg.io/xy7/21_hires.png', '2015-08-12'),
  ('xy7-22', 'Vaporeon', 'xy7', 'Ancient Origins', '22', 'Uncommon', 'https://images.pokemontcg.io/xy7/22.png', 'https://images.pokemontcg.io/xy7/22_hires.png', '2015-08-12'),
  ('xy7-23', 'Relicanth', 'xy7', 'Ancient Origins', '23', 'Common', 'https://images.pokemontcg.io/xy7/23.png', 'https://images.pokemontcg.io/xy7/23_hires.png', '2015-08-12'),
  ('xy7-24', 'Regice', 'xy7', 'Ancient Origins', '24', 'Rare', 'https://images.pokemontcg.io/xy7/24.png', 'https://images.pokemontcg.io/xy7/24_hires.png', '2015-08-12'),
  ('xy7-25', 'Kyurem-EX', 'xy7', 'Ancient Origins', '25', 'Rare Holo EX', 'https://images.pokemontcg.io/xy7/25.png', 'https://images.pokemontcg.io/xy7/25_hires.png', '2015-08-12'),
  ('xy7-26', 'Jolteon', 'xy7', 'Ancient Origins', '26', 'Rare Holo', 'https://images.pokemontcg.io/xy7/26.png', 'https://images.pokemontcg.io/xy7/26_hires.png', '2015-08-12'),
  ('xy7-27', 'Ampharos-EX', 'xy7', 'Ancient Origins', '27', 'Rare Holo EX', 'https://images.pokemontcg.io/xy7/27.png', 'https://images.pokemontcg.io/xy7/27_hires.png', '2015-08-12'),
  ('xy7-28', 'M Ampharos-EX', 'xy7', 'Ancient Origins', '28', 'Rare Holo EX', 'https://images.pokemontcg.io/xy7/28.png', 'https://images.pokemontcg.io/xy7/28_hires.png', '2015-08-12'),
  ('xy7-29', 'Rotom', 'xy7', 'Ancient Origins', '29', 'Uncommon', 'https://images.pokemontcg.io/xy7/29.png', 'https://images.pokemontcg.io/xy7/29_hires.png', '2015-08-12'),
  ('xy7-30', 'Unown', 'xy7', 'Ancient Origins', '30', 'Common', 'https://images.pokemontcg.io/xy7/30.png', 'https://images.pokemontcg.io/xy7/30_hires.png', '2015-08-12'),
  ('xy7-31', 'Baltoy', 'xy7', 'Ancient Origins', '31', 'Common', 'https://images.pokemontcg.io/xy7/31.png', 'https://images.pokemontcg.io/xy7/31_hires.png', '2015-08-12'),
  ('xy7-32', 'Baltoy', 'xy7', 'Ancient Origins', '32', 'Common', 'https://images.pokemontcg.io/xy7/32.png', 'https://images.pokemontcg.io/xy7/32_hires.png', '2015-08-12'),
  ('xy7-33', 'Claydol', 'xy7', 'Ancient Origins', '33', 'Rare', 'https://images.pokemontcg.io/xy7/33.png', 'https://images.pokemontcg.io/xy7/33_hires.png', '2015-08-12'),
  ('xy7-34', 'Golett', 'xy7', 'Ancient Origins', '34', 'Common', 'https://images.pokemontcg.io/xy7/34.png', 'https://images.pokemontcg.io/xy7/34_hires.png', '2015-08-12'),
  ('xy7-35', 'Golurk', 'xy7', 'Ancient Origins', '35', 'Rare', 'https://images.pokemontcg.io/xy7/35.png', 'https://images.pokemontcg.io/xy7/35_hires.png', '2015-08-12'),
  ('xy7-36', 'Hoopa-EX', 'xy7', 'Ancient Origins', '36', 'Rare Holo EX', 'https://images.pokemontcg.io/xy7/36.png', 'https://images.pokemontcg.io/xy7/36_hires.png', '2015-08-12'),
  ('xy7-37', 'Machamp-EX', 'xy7', 'Ancient Origins', '37', 'Rare Holo EX', 'https://images.pokemontcg.io/xy7/37.png', 'https://images.pokemontcg.io/xy7/37_hires.png', '2015-08-12'),
  ('xy7-38', 'Wooper', 'xy7', 'Ancient Origins', '38', 'Common', 'https://images.pokemontcg.io/xy7/38.png', 'https://images.pokemontcg.io/xy7/38_hires.png', '2015-08-12'),
  ('xy7-39', 'Quagsire', 'xy7', 'Ancient Origins', '39', 'Common', 'https://images.pokemontcg.io/xy7/39.png', 'https://images.pokemontcg.io/xy7/39_hires.png', '2015-08-12'),
  ('xy7-40', 'Regirock', 'xy7', 'Ancient Origins', '40', 'Rare', 'https://images.pokemontcg.io/xy7/40.png', 'https://images.pokemontcg.io/xy7/40_hires.png', '2015-08-12'),
  ('xy7-41', 'Golurk', 'xy7', 'Ancient Origins', '41', 'Common', 'https://images.pokemontcg.io/xy7/41.png', 'https://images.pokemontcg.io/xy7/41_hires.png', '2015-08-12'),
  ('xy7-42', 'Tyranitar-EX', 'xy7', 'Ancient Origins', '42', 'Rare Holo EX', 'https://images.pokemontcg.io/xy7/42.png', 'https://images.pokemontcg.io/xy7/42_hires.png', '2015-08-12'),
  ('xy7-43', 'M Tyranitar-EX', 'xy7', 'Ancient Origins', '43', 'Rare Holo EX', 'https://images.pokemontcg.io/xy7/43.png', 'https://images.pokemontcg.io/xy7/43_hires.png', '2015-08-12'),
  ('xy7-44', 'Sableye', 'xy7', 'Ancient Origins', '44', 'Uncommon', 'https://images.pokemontcg.io/xy7/44.png', 'https://images.pokemontcg.io/xy7/44_hires.png', '2015-08-12'),
  ('xy7-45', 'Inkay', 'xy7', 'Ancient Origins', '45', 'Common', 'https://images.pokemontcg.io/xy7/45.png', 'https://images.pokemontcg.io/xy7/45_hires.png', '2015-08-12'),
  ('xy7-46', 'Malamar', 'xy7', 'Ancient Origins', '46', 'Common', 'https://images.pokemontcg.io/xy7/46.png', 'https://images.pokemontcg.io/xy7/46_hires.png', '2015-08-12'),
  ('xy7-47', 'Beldum', 'xy7', 'Ancient Origins', '47', 'Common', 'https://images.pokemontcg.io/xy7/47.png', 'https://images.pokemontcg.io/xy7/47_hires.png', '2015-08-12'),
  ('xy7-48', 'Metang', 'xy7', 'Ancient Origins', '48', 'Uncommon', 'https://images.pokemontcg.io/xy7/48.png', 'https://images.pokemontcg.io/xy7/48_hires.png', '2015-08-12'),
  ('xy7-49', 'Metagross', 'xy7', 'Ancient Origins', '49', 'Rare', 'https://images.pokemontcg.io/xy7/49.png', 'https://images.pokemontcg.io/xy7/49_hires.png', '2015-08-12'),
  ('xy7-50', 'Metagross', 'xy7', 'Ancient Origins', '50', 'Rare', 'https://images.pokemontcg.io/xy7/50.png', 'https://images.pokemontcg.io/xy7/50_hires.png', '2015-08-12'),
  ('xy7-51', 'Registeel', 'xy7', 'Ancient Origins', '51', 'Rare', 'https://images.pokemontcg.io/xy7/51.png', 'https://images.pokemontcg.io/xy7/51_hires.png', '2015-08-12'),
  ('xy7-52', 'Ralts', 'xy7', 'Ancient Origins', '52', 'Common', 'https://images.pokemontcg.io/xy7/52.png', 'https://images.pokemontcg.io/xy7/52_hires.png', '2015-08-12'),
  ('xy7-53', 'Kirlia', 'xy7', 'Ancient Origins', '53', 'Uncommon', 'https://images.pokemontcg.io/xy7/53.png', 'https://images.pokemontcg.io/xy7/53_hires.png', '2015-08-12'),
  ('xy7-54', 'Gardevoir', 'xy7', 'Ancient Origins', '54', 'Rare Holo', 'https://images.pokemontcg.io/xy7/54.png', 'https://images.pokemontcg.io/xy7/54_hires.png', '2015-08-12'),
  ('xy7-55', 'Cottonee', 'xy7', 'Ancient Origins', '55', 'Common', 'https://images.pokemontcg.io/xy7/55.png', 'https://images.pokemontcg.io/xy7/55_hires.png', '2015-08-12'),
  ('xy7-56', 'Whimsicott', 'xy7', 'Ancient Origins', '56', 'Uncommon', 'https://images.pokemontcg.io/xy7/56.png', 'https://images.pokemontcg.io/xy7/56_hires.png', '2015-08-12'),
  ('xy7-57', 'Giratina-EX', 'xy7', 'Ancient Origins', '57', 'Rare Holo EX', 'https://images.pokemontcg.io/xy7/57.png', 'https://images.pokemontcg.io/xy7/57_hires.png', '2015-08-12'),
  ('xy7-58', 'Goomy', 'xy7', 'Ancient Origins', '58', 'Common', 'https://images.pokemontcg.io/xy7/58.png', 'https://images.pokemontcg.io/xy7/58_hires.png', '2015-08-12'),
  ('xy7-59', 'Sliggoo', 'xy7', 'Ancient Origins', '59', 'Uncommon', 'https://images.pokemontcg.io/xy7/59.png', 'https://images.pokemontcg.io/xy7/59_hires.png', '2015-08-12'),
  ('xy7-60', 'Goodra', 'xy7', 'Ancient Origins', '60', 'Rare Holo', 'https://images.pokemontcg.io/xy7/60.png', 'https://images.pokemontcg.io/xy7/60_hires.png', '2015-08-12'),
  ('xy7-61', 'Meowth', 'xy7', 'Ancient Origins', '61', 'Common', 'https://images.pokemontcg.io/xy7/61.png', 'https://images.pokemontcg.io/xy7/61_hires.png', '2015-08-12'),
  ('xy7-62', 'Persian', 'xy7', 'Ancient Origins', '62', 'Common', 'https://images.pokemontcg.io/xy7/62.png', 'https://images.pokemontcg.io/xy7/62_hires.png', '2015-08-12'),
  ('xy7-63', 'Eevee', 'xy7', 'Ancient Origins', '63', 'Common', 'https://images.pokemontcg.io/xy7/63.png', 'https://images.pokemontcg.io/xy7/63_hires.png', '2015-08-12'),
  ('xy7-64', 'Porygon', 'xy7', 'Ancient Origins', '64', 'Common', 'https://images.pokemontcg.io/xy7/64.png', 'https://images.pokemontcg.io/xy7/64_hires.png', '2015-08-12'),
  ('xy7-65', 'Porygon2', 'xy7', 'Ancient Origins', '65', 'Uncommon', 'https://images.pokemontcg.io/xy7/65.png', 'https://images.pokemontcg.io/xy7/65_hires.png', '2015-08-12'),
  ('xy7-66', 'Porygon-Z', 'xy7', 'Ancient Origins', '66', 'Rare', 'https://images.pokemontcg.io/xy7/66.png', 'https://images.pokemontcg.io/xy7/66_hires.png', '2015-08-12'),
  ('xy7-67', 'Porygon-Z', 'xy7', 'Ancient Origins', '67', 'Rare Holo', 'https://images.pokemontcg.io/xy7/67.png', 'https://images.pokemontcg.io/xy7/67_hires.png', '2015-08-12'),
  ('xy7-68', 'Lugia-EX', 'xy7', 'Ancient Origins', '68', 'Rare Holo EX', 'https://images.pokemontcg.io/xy7/68.png', 'https://images.pokemontcg.io/xy7/68_hires.png', '2015-08-12'),
  ('xy7-69', 'Ace Trainer', 'xy7', 'Ancient Origins', '69', 'Uncommon', 'https://images.pokemontcg.io/xy7/69.png', 'https://images.pokemontcg.io/xy7/69_hires.png', '2015-08-12'),
  ('xy7-70', 'Ampharos Spirit Link', 'xy7', 'Ancient Origins', '70', 'Uncommon', 'https://images.pokemontcg.io/xy7/70.png', 'https://images.pokemontcg.io/xy7/70_hires.png', '2015-08-12'),
  ('xy7-71', 'Eco Arm', 'xy7', 'Ancient Origins', '71', 'Uncommon', 'https://images.pokemontcg.io/xy7/71.png', 'https://images.pokemontcg.io/xy7/71_hires.png', '2015-08-12'),
  ('xy7-72', 'Energy Recycler', 'xy7', 'Ancient Origins', '72', 'Uncommon', 'https://images.pokemontcg.io/xy7/72.png', 'https://images.pokemontcg.io/xy7/72_hires.png', '2015-08-12'),
  ('xy7-73', 'Faded Town', 'xy7', 'Ancient Origins', '73', 'Uncommon', 'https://images.pokemontcg.io/xy7/73.png', 'https://images.pokemontcg.io/xy7/73_hires.png', '2015-08-12'),
  ('xy7-74', 'Forest of Giant Plants', 'xy7', 'Ancient Origins', '74', 'Uncommon', 'https://images.pokemontcg.io/xy7/74.png', 'https://images.pokemontcg.io/xy7/74_hires.png', '2015-08-12'),
  ('xy7-75', 'Hex Maniac', 'xy7', 'Ancient Origins', '75', 'Uncommon', 'https://images.pokemontcg.io/xy7/75.png', 'https://images.pokemontcg.io/xy7/75_hires.png', '2015-08-12'),
  ('xy7-76', 'Level Ball', 'xy7', 'Ancient Origins', '76', 'Uncommon', 'https://images.pokemontcg.io/xy7/76.png', 'https://images.pokemontcg.io/xy7/76_hires.png', '2015-08-12'),
  ('xy7-77', 'Lucky Helmet', 'xy7', 'Ancient Origins', '77', 'Uncommon', 'https://images.pokemontcg.io/xy7/77.png', 'https://images.pokemontcg.io/xy7/77_hires.png', '2015-08-12'),
  ('xy7-78', 'Lysandre', 'xy7', 'Ancient Origins', '78', 'Uncommon', 'https://images.pokemontcg.io/xy7/78.png', 'https://images.pokemontcg.io/xy7/78_hires.png', '2015-08-12'),
  ('xy7-79', 'Paint Roller', 'xy7', 'Ancient Origins', '79', 'Uncommon', 'https://images.pokemontcg.io/xy7/79.png', 'https://images.pokemontcg.io/xy7/79_hires.png', '2015-08-12'),
  ('xy7-80', 'Sceptile Spirit Link', 'xy7', 'Ancient Origins', '80', 'Uncommon', 'https://images.pokemontcg.io/xy7/80.png', 'https://images.pokemontcg.io/xy7/80_hires.png', '2015-08-12'),
  ('xy7-81', 'Tyranitar Spirit Link', 'xy7', 'Ancient Origins', '81', 'Uncommon', 'https://images.pokemontcg.io/xy7/81.png', 'https://images.pokemontcg.io/xy7/81_hires.png', '2015-08-12'),
  ('xy7-82', 'Dangerous Energy', 'xy7', 'Ancient Origins', '82', 'Uncommon', 'https://images.pokemontcg.io/xy7/82.png', 'https://images.pokemontcg.io/xy7/82_hires.png', '2015-08-12'),
  ('xy7-83', 'Flash Energy', 'xy7', 'Ancient Origins', '83', 'Uncommon', 'https://images.pokemontcg.io/xy7/83.png', 'https://images.pokemontcg.io/xy7/83_hires.png', '2015-08-12'),
  ('xy7-84', 'Sceptile-EX', 'xy7', 'Ancient Origins', '84', 'Rare Ultra', 'https://images.pokemontcg.io/xy7/84.png', 'https://images.pokemontcg.io/xy7/84_hires.png', '2015-08-12'),
  ('xy7-85', 'M Sceptile-EX', 'xy7', 'Ancient Origins', '85', 'Rare Ultra', 'https://images.pokemontcg.io/xy7/85.png', 'https://images.pokemontcg.io/xy7/85_hires.png', '2015-08-12'),
  ('xy7-86', 'Kyurem-EX', 'xy7', 'Ancient Origins', '86', 'Rare Ultra', 'https://images.pokemontcg.io/xy7/86.png', 'https://images.pokemontcg.io/xy7/86_hires.png', '2015-08-12'),
  ('xy7-87', 'Ampharos-EX', 'xy7', 'Ancient Origins', '87', 'Rare Ultra', 'https://images.pokemontcg.io/xy7/87.png', 'https://images.pokemontcg.io/xy7/87_hires.png', '2015-08-12'),
  ('xy7-88', 'M Ampharos-EX', 'xy7', 'Ancient Origins', '88', 'Rare Ultra', 'https://images.pokemontcg.io/xy7/88.png', 'https://images.pokemontcg.io/xy7/88_hires.png', '2015-08-12'),
  ('xy7-89', 'Hoopa-EX', 'xy7', 'Ancient Origins', '89', 'Rare Ultra', 'https://images.pokemontcg.io/xy7/89.png', 'https://images.pokemontcg.io/xy7/89_hires.png', '2015-08-12'),
  ('xy7-90', 'Machamp-EX', 'xy7', 'Ancient Origins', '90', 'Rare Ultra', 'https://images.pokemontcg.io/xy7/90.png', 'https://images.pokemontcg.io/xy7/90_hires.png', '2015-08-12'),
  ('xy7-91', 'Tyranitar-EX', 'xy7', 'Ancient Origins', '91', 'Rare Ultra', 'https://images.pokemontcg.io/xy7/91.png', 'https://images.pokemontcg.io/xy7/91_hires.png', '2015-08-12'),
  ('xy7-92', 'M Tyranitar-EX', 'xy7', 'Ancient Origins', '92', 'Rare Ultra', 'https://images.pokemontcg.io/xy7/92.png', 'https://images.pokemontcg.io/xy7/92_hires.png', '2015-08-12'),
  ('xy7-93', 'Giratina-EX', 'xy7', 'Ancient Origins', '93', 'Rare Ultra', 'https://images.pokemontcg.io/xy7/93.png', 'https://images.pokemontcg.io/xy7/93_hires.png', '2015-08-12'),
  ('xy7-94', 'Lugia-EX', 'xy7', 'Ancient Origins', '94', 'Rare Ultra', 'https://images.pokemontcg.io/xy7/94.png', 'https://images.pokemontcg.io/xy7/94_hires.png', '2015-08-12'),
  ('xy7-95', 'Steven', 'xy7', 'Ancient Origins', '95', 'Rare Ultra', 'https://images.pokemontcg.io/xy7/95.png', 'https://images.pokemontcg.io/xy7/95_hires.png', '2015-08-12'),
  ('xy7-96', 'Primal Kyogre-EX', 'xy7', 'Ancient Origins', '96', 'Rare Secret', 'https://images.pokemontcg.io/xy7/96.png', 'https://images.pokemontcg.io/xy7/96_hires.png', '2015-08-12'),
  ('xy7-97', 'Primal Groudon-EX', 'xy7', 'Ancient Origins', '97', 'Rare Secret', 'https://images.pokemontcg.io/xy7/97.png', 'https://images.pokemontcg.io/xy7/97_hires.png', '2015-08-12'),
  ('xy7-98', 'M Rayquaza-EX', 'xy7', 'Ancient Origins', '98', 'Rare Secret', 'https://images.pokemontcg.io/xy7/98.png', 'https://images.pokemontcg.io/xy7/98_hires.png', '2015-08-12'),
  ('xy7-99', 'Energy Retrieval', 'xy7', 'Ancient Origins', '99', 'Rare Secret', 'https://images.pokemontcg.io/xy7/99.png', 'https://images.pokemontcg.io/xy7/99_hires.png', '2015-08-12'),
  ('xy7-100', 'Trainers'' Mail', 'xy7', 'Ancient Origins', '100', 'Rare Secret', 'https://images.pokemontcg.io/xy7/100.png', 'https://images.pokemontcg.io/xy7/100_hires.png', '2015-08-12')
on conflict (id) do update set name = excluded.name, set_code = excluded.set_code, set_name = excluded.set_name, card_number = excluded.card_number, rarity = excluded.rarity, image_small_url = excluded.image_small_url, image_large_url = excluded.image_large_url, release_date = excluded.release_date;

insert into public.card_variants (card_id, variant_code, label, sort_order)
select id, 'standard', case when rarity in ('Rare Holo', 'Rare Holo EX', 'Rare Ultra', 'Rare Secret') then 'Holo' else 'Standard' end, 1
from public.card_catalog where set_code = 'xy7'
on conflict (card_id, variant_code) do update set label = excluded.label, sort_order = excluded.sort_order;

insert into public.card_variants (card_id, variant_code, label, sort_order)
select id, 'reverse_holo', 'Reverse Holo', 2 from public.card_catalog
where set_code = 'xy7' and rarity in ('Common', 'Uncommon', 'Rare', 'Rare Holo')
on conflict (card_id, variant_code) do update set label = excluded.label, sort_order = excluded.sort_order;

commit;
