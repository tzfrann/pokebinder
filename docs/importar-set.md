# Importar un nuevo set

El catálogo se amplía **desde Supabase**. Una publicación de Cloudflare por sí sola no inserta cartas. La web descubre automáticamente las nuevas filas de `card_sets`, `card_catalog` y `card_variants` al recargar tras iniciar sesión.

## Antes de generar el SQL

1. Elige el siguiente código de set (`xy6`, por ejemplo) y comprueba su orden dentro de la era en la [fuente del catálogo](https://github.com/PokemonTCG/pokemon-tcg-data/tree/master/cards/en). Verifica el nombre, fecha, total impreso, cartas secretas y posibles números alternativos con una checklist del set.
2. Descarga `cards/en/<codigo>.json` como `supabase/<codigo>-source.json`. Los archivos `*-source.json` están excluidos de Git por `.gitignore`.
3. Revisa rarezas y acabados. Las reglas actuales dan una variante base a todas las cartas y reverse a `Common`, `Uncommon`, `Rare` y `Rare Holo`. Comprueba si hay excepciones (energías, cartas promocionales, impresiones alternativas). No apliques esa regla a otra era sin comprobarla.

## Generar el archivo

Para los sets `xy4` a `xy9`, el generador está en `supabase/generate-next-xy-seeds.js`. Su lista `sets` contiene código, nombre, total impreso, número de cartas por encima de ese total, fecha y orden. Para el siguiente set, añade una entrada y ajusta cualquier exclusión o regla especial después de contrastar la checklist. **No confundas la cantidad de cartas con rareza `Rare Secret` con el número de cartas por encima del total impreso**: en `xy7` hay cinco con esa rareza, pero solo dos números por encima de 98. En `xy8` y `xy9` aparece `Rare BREAK`: su impresión base se etiqueta `BREAK` y no tiene reverse. El script filtra números no enteros y valida que la secuencia de números sea completa, pero **esa exclusión debe revisarse para cada set**.

Desde la raíz del proyecto:

```powershell
node supabase/generate-next-xy-seeds.js xy8 xy9
```

Pasa como argumentos solo los códigos que quieres generar. Sin argumentos, el script intenta generar todos los sets de su lista y necesita todos sus archivos fuente locales. El resultado `supabase/seed-<codigo>.sql` incluye, en este orden: fila de `card_sets`, cartas de `card_catalog`, variantes base y reverse. Los SQL generados se ejecutan dentro de una transacción y usan `on conflict ... do update`, así que volver a ejecutarlos no duplica esas filas. No borres cartas de un set ya utilizado: podrían estar referenciadas por colecciones de usuarios.

## Comprobación antes de aplicar

- Confirma que el número de filas de carta es `total impreso + secretas` y que los IDs y números no se repiten.
- Confirma los números y nombres extremos, especialmente secretas y alternativas.
- Cuenta las variantes previstas: una base por carta más una reverse para cada carta que la admite.
- Comprueba que el SQL no toca `user_card_collection`, `profiles` ni `friendships`.
- Ejecuta `node --check supabase/generate-next-xy-seeds.js` y `npm run build` si cambiaste también el frontend.

## Aplicar en Supabase

1. En el proyecto correcto, abre **SQL Editor → New query**.
2. Pega **un** `seed-<codigo>.sql` completo y ejecútalo. Si hay dos sets, ejecuta dos consultas separadas, en orden de lanzamiento.
3. Comprueba el resultado con esta consulta de solo lectura, cambiando el código:

```sql
select s.id, s.name, s.printed_total,
       count(distinct c.id) as cartas_importadas,
       count(v.variant_code) as variantes_importadas
from public.card_sets s
left join public.card_catalog c on c.set_code = s.id
left join public.card_variants v on v.card_id = c.id
where s.id = 'xy4'
group by s.id, s.name, s.printed_total;
```

4. Recarga la web, entra en **Mi colección → era → set** y comprueba primera carta, última numerada, secretas, orden, imágenes, botones de variantes y ambas barras de progreso.
5. Confirma también el perfil de un amigo: al pulsar el set debe mostrar las mismas cartas en modo lectura.
6. Actualiza la tabla de [estado](estado.md): deja constancia de si el SQL solo está preparado, aplicado o comprobado en producción.

## Casos actuales

Los seeds disponibles van de [`xy4`](../supabase/seed-xy4.sql) a [`xy9`](../supabase/seed-xy9.sql). `xy4` omite `24a` y `65a`; `xy6` omite `77a` y `92a`; `xy7` omite `75a`; `xy8` omite `146a`; `xy9` omite `98a`, `98b` y `107a`. Para `xy8` se esperan 164 cartas y 302 variantes; para `xy9`, 123 cartas y 220 variantes. Al redactar esta guía aún no hay confirmación de que todos los SQL `xy4` a `xy9` se hayan ejecutado en Supabase.
