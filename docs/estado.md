# Estado del producto

Fecha de revisión de esta guía: 22 de septiembre de 2026. Describe el código del repositorio, no garantiza que un SQL pendiente ya se haya ejecutado en el proyecto de Supabase.

## Funciona actualmente

- Acceso por cuenta de Supabase. El registro público está pensado para estar desactivado y los usuarios entran por invitación.
- Catálogo en inglés organizado por era y set. El orden de las cartas es numérico.
- Colección personal por **carta y variante** (`standard` o `reverse_holo`), con cantidad de 1 a 999. Una variante no marcada se considera ausente.
- Progreso por cartas distintas y por todas las variantes. El progreso incluye las cartas secretas cuando las hay; el número impreso de la carta mantiene el denominador oficial del set.
- Escaparate de hasta tres cartas poseídas.
- Búsqueda de perfiles, solicitudes de amistad y aceptación o rechazo. Los amigos pueden ver el perfil, progreso y detalle de cada set de otro usuario.
- «Repetidas que no tengo» en el perfil de un amigo: compara la **misma carta y variante**. Aparece cuando el amigo tiene al menos dos copias y el usuario actual ninguna. Muestra `cantidad − 1` como copias potencialmente disponibles.
- Álbumes con nombre, descripción, estilo y visibilidad `private` o `friends`.
- PWA instalable. El service worker guarda los archivos de la aplicación; las imágenes y los datos de Supabase dependen de la conexión.

## Catálogo

| Código | Set | Cartas en el SQL | Variantes en el SQL | Estado conocido |
| --- | --- | ---: | ---: | --- |
| `xy1` | XY Base Set | 146 | Consultar SQL/BD | Importado y usado |
| `xy2` | XY—Flashfire | 109 | 200 | Importado y usado |
| `xy3` | XY—Furious Fists | 113 | 210 | Importado y usado |
| `xy4` | XY—Phantom Forces | 122 (119 + 3 secretas) | 226 | SQL preparado; falta confirmar ejecución en Supabase |
| `xy5` | XY—Primal Clash | 164 (160 + 4 secretas) | 296 | SQL preparado; falta confirmar ejecución en Supabase |

Los sets visibles en la web salen de `card_sets`, no de esta tabla. Si no aparece un set, comprueba primero que se ejecutó su SQL en Supabase.

## Límites y trabajo pendiente

- Los álbumes todavía **no permiten escoger ni ordenar cartas**. La tabla `album_cards` existe, pero la interfaz actual solo guarda la cabecera del álbum. «Ver álbum» todavía no abre un contenido real.
- La sincronización actual de álbumes borra y reinserta sus filas, cambiando los IDs. Hay que corregirla antes de añadir cartas persistentes a cada álbum.
- La sección **Trades** es una maqueta; no publica anuncios. La tabla `trade_posts` existe, pero el frontend no la utiliza.
- El campo `available_for_trade` existe en la colección, pero la coincidencia «Repetidas que no tengo» se basa por ahora solo en `quantity > 1`. No expresa consentimiento del amigo para intercambiar esa copia.
- Faltan filtros de «tengo», «faltan» y «repetidas» dentro de la colección propia y la de amigos.
- El catálogo no se administra desde la web: cada set nuevo requiere preparar y ejecutar un SQL.
