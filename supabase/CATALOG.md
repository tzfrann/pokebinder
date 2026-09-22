# Catálogo de cartas

PokéBinder usará un único catálogo en inglés. No habrá selector ni columna de idioma: cada impresión se identifica por el código del set y el número de carta.

## Modelo

- `card_catalog` contiene cada carta una sola vez, incluida su imagen enlazada y metadatos.
- `user_card_collection` solo registra qué cartas posee cada persona, cantidad, estado y si desea intercambiarlas.
- Una carta ausente de `user_card_collection` equivale a “no la tengo”. Esto permite calcular el progreso de cualquier set sin crear registros innecesarios.

## Importación

Ejecuta `catalog-migration.sql` antes de cargar datos. Importaremos por sets y no el catálogo mundial de golpe: reduce almacenamiento, permite empezar por los sets que os interesan y evita depender de un plan de pago para consultas masivas.

La interfaz se conectará a estas dos tablas después de importar el primer set.

## XY Base Set

La primera era será **XY** y su primer set será **XY Base Set** (`xy1`). La jerarquía está normalizada en `card_eras` y `card_sets`, de modo que más adelante se pueden añadir los demás sets de cada era sin cambiar la interfaz.

## Añadir Phantom Forces y Primal Clash

En Supabase > SQL Editor, ejecuta por separado y en este orden:

1. `seed-xy4.sql` — XY—Phantom Forces: 119 numeradas, 3 secretas, 226 variantes. Las impresiones alternativas `24a` y `65a` se excluyen del progreso numerado.
2. `seed-xy5.sql` — XY—Primal Clash: 160 numeradas, 4 secretas, 296 variantes.

Cada script se ejecuta dentro de una transacción y es repetible. No modifica las colecciones de los usuarios. Tras ejecutarlos, recarga la web para que aparezcan en la era XY. La web calcula el progreso con las cartas numeradas y secretas, pero mantiene el denominador impreso (`/119` y `/160`) en el número visible de cada carta.

Para regenerar los archivos a partir de [PokemonTCG/pokemon-tcg-data](https://github.com/PokemonTCG/pokemon-tcg-data), descarga `cards/en/xy4.json` y `cards/en/xy5.json` en esta carpeta como `xy4-source.json` y `xy5-source.json`, y ejecuta `node supabase/generate-next-xy-seeds.js` desde la raíz del proyecto.
