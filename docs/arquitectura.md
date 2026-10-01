# Arquitectura y datos

## Recorrido de una petición

`index.html` define las vistas. `app.js` gestiona interacción, renderizado y estado temporal. `supabase-client.js` concentra las consultas a Supabase; `supabase/config.js` contiene la URL del proyecto y una clave **publishable**, apta para el navegador. `service-worker.js` almacena los archivos estáticos de la PWA. No hay servidor propio ni compilación de JavaScript: `scripts/build.js` copia los 15 archivos públicos a `dist/`.

El orden de carga al iniciar sesión en `activateCloudSession()` es: perfil y escaparate → eras y sets → cartas de cada set → variantes → colección del usuario → álbumes → amistades. Si falla una fase, la interfaz muestra un aviso o usa un estado de respaldo; por eso un set puede aparecer en la lista aunque todavía no tenga cartas cargadas.

## Modelo de Supabase

| Tabla | Contenido y regla principal |
| --- | --- |
| `profiles` | Nombre, color de avatar y hasta tres IDs de cartas destacadas. El perfil se crea con un trigger de `auth.users`. |
| `card_eras` → `card_sets` | Jerarquía y orden de sets. `printed_total` es el denominador impreso en la carta. |
| `card_catalog` | Una fila por impresión numerada; ID como `xy4-1`, nombre, rareza, número, URLs de imagen. |
| `card_variants` | Acabados por carta. Clave `(card_id, variant_code)`; hoy se usan `standard` y `reverse_holo`. Las cartas de rareza `Rare BREAK` llevan la etiqueta base `BREAK` y no reciben reverse. |
| `user_card_collection` | Clave `(user_id, card_id, variant_code)` y cantidad. La ausencia de una fila significa que no se posee esa variante. |
| `friendships` | Solicitudes pendientes o aceptadas. Un índice impide duplicados en ambas direcciones. |
| `albums`, `album_cards` | Cabeceras de álbum y tabla preparada para sus cartas; esta última no está conectada a la interfaz. |
| `cards`, `trade_posts` | `cards` pertenece al prototipo previo. `trade_posts` alimenta los anuncios activos; RLS permite leer solo anuncios propios o de amigos aceptados y editar solo los propios. |

## Privacidad y permisos

Supabase aplica Row Level Security. Los usuarios autenticados leen el catálogo y los perfiles. Cada propietario modifica solo sus datos. La colección personal es visible para el propietario y para amigos con solicitud aceptada. Un álbum con visibilidad `private` solo lo lee su dueño; `friends` lo leen amigos aceptados. La visibilidad no se basa únicamente en ocultar botones del navegador.

La clave publishable de `supabase/config.js` no concede poderes de administración. Nunca pongas una clave `secret` o `service_role` en el frontend. Los cambios de esquema y las importaciones se ejecutan desde el SQL Editor con una cuenta administradora del proyecto.

## Cálculos que conviene conservar

- **Set completo:** número de IDs de carta diferentes poseídos / número real de cartas importadas, incluidas las secretas.
- **Todas las variantes:** filas poseídas de `user_card_collection` / filas disponibles de `card_variants` para ese set. Las copias adicionales no aumentan este progreso.
- **Copias:** suma de `quantity` de las variantes poseídas.
- **Disponibles para intercambio:** cada fila propia de `user_card_collection` tiene `available_for_trade`. El dueño lo marca expresamente, sin mínimo de copias. El perfil del amigo muestra todas las variantes marcadas; «Me faltan» compara la misma pareja `(card_id, variant_code)` con la colección del usuario actual. No se afirma cuántas copias quiere entregar.
- **Automatización de repetidas:** `auth.users.user_metadata.auto_trade_duplicates` almacena el estado por cuenta, sin migración SQL. La activación marca mediante una actualización masiva las filas propias con `quantity > 1`. Mientras está activada, el paso de una a dos copias establece `available_for_trade = true` junto con la cantidad. Desactivarla no cambia las marcas. Retirar manualmente una variante repetida no se revierte por cambios posteriores de cantidad si ya era repetida.
- **Anuncios exactos:** `supabase/trade-card-migration.sql` añade `trade_posts.card_id` y `variant_code` con referencia conjunta a `card_variants`. Son nulos para anuncios antiguos. Los anuncios «Busco» de amigos coinciden solo si el usuario posee esa pareja exacta; el filtro de tradeables exige además `available_for_trade = true`. Los anuncios propios no cuentan como coincidencias.
- **Filtros de mi set:** las pestañas filtran variantes, no solo IDs de carta. «Tengo» requiere una fila propia; «Me faltan» requiere ausencia de esa fila; «Repetidas» requiere `quantity > 1`; «Para intercambiar» requiere `available_for_trade = true`. Una carta se muestra si al menos una variante coincide y solo aparecen los controles de las variantes coincidentes. Búsqueda y rareza se aplican antes de calcular los contadores de las pestañas.

`supabase-client.js` consulta variantes en lotes de 100 IDs y pagina las colecciones de 500 filas para evitar el límite de resultados de Supabase al añadir más sets.

## Persistencia heredada que hay que tener presente

Las marcas de posesión y cantidades del catálogo se guardan directamente en `user_card_collection`. El escaparate se guarda en `profiles.featured_card_ids`. Los álbumes siguen una ruta anterior: se guardan primero en `localStorage` y `syncToCloud()` los sincroniza con un retraso de 450 ms mediante `replaceAlbums()`, que **borra y vuelve a insertar** las cabeceras en Supabase. Sus IDs cambian. Antes de conectar cartas reales a `album_cards`, hay que sustituir ese reemplazo total por operaciones de crear/editar/borrar que conserven el ID del álbum. La tabla antigua `cards` también se sincroniza por reemplazo y ya no es el catálogo principal.
