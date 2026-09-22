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
| `card_variants` | Acabados por carta. Clave `(card_id, variant_code)`; hoy se usan `standard` y `reverse_holo`. |
| `user_card_collection` | Clave `(user_id, card_id, variant_code)` y cantidad. La ausencia de una fila significa que no se posee esa variante. |
| `friendships` | Solicitudes pendientes o aceptadas. Un índice impide duplicados en ambas direcciones. |
| `albums`, `album_cards` | Cabeceras de álbum y tabla preparada para sus cartas; esta última no está conectada a la interfaz. |
| `cards`, `trade_posts` | Tablas del esquema inicial. `cards` pertenece al prototipo previo; los anuncios de `trade_posts` todavía no tienen interfaz funcional. |

## Privacidad y permisos

Supabase aplica Row Level Security. Los usuarios autenticados leen el catálogo y los perfiles. Cada propietario modifica solo sus datos. La colección personal es visible para el propietario y para amigos con solicitud aceptada. Un álbum con visibilidad `private` solo lo lee su dueño; `friends` lo leen amigos aceptados. La visibilidad no se basa únicamente en ocultar botones del navegador.

La clave publishable de `supabase/config.js` no concede poderes de administración. Nunca pongas una clave `secret` o `service_role` en el frontend. Los cambios de esquema y las importaciones se ejecutan desde el SQL Editor con una cuenta administradora del proyecto.

## Cálculos que conviene conservar

- **Set completo:** número de IDs de carta diferentes poseídos / número real de cartas importadas, incluidas las secretas.
- **Todas las variantes:** filas poseídas de `user_card_collection` / filas disponibles de `card_variants` para ese set. Las copias adicionales no aumentan este progreso.
- **Copias:** suma de `quantity` de las variantes poseídas.
- **Repetidas que no tengo:** para cada `(card_id, variant_code)`, el amigo tiene `quantity > 1` y el usuario actual no posee la variante. Se muestran `quantity − 1` copias.

`supabase-client.js` consulta variantes en lotes de 100 IDs y pagina las colecciones de 500 filas para evitar el límite de resultados de Supabase al añadir más sets.

## Persistencia heredada que hay que tener presente

Las marcas de posesión y cantidades del catálogo se guardan directamente en `user_card_collection`. El escaparate se guarda en `profiles.featured_card_ids`. Los álbumes siguen una ruta anterior: se guardan primero en `localStorage` y `syncToCloud()` los sincroniza con un retraso de 450 ms mediante `replaceAlbums()`, que **borra y vuelve a insertar** las cabeceras en Supabase. Sus IDs cambian. Antes de conectar cartas reales a `album_cards`, hay que sustituir ese reemplazo total por operaciones de crear/editar/borrar que conserven el ID del álbum. La tabla antigua `cards` también se sincroniza por reemplazo y ya no es el catálogo principal.
