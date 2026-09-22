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
