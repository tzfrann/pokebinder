# Estado del producto

Fecha de revisión de esta guía: 1 de octubre de 2026. Describe el código del repositorio; el estado de los SQL en Supabase se basa en lo que ha confirmado el usuario.

## Funciona actualmente

- Acceso por cuenta de Supabase. El registro público está pensado para estar desactivado y los usuarios entran por invitación.
- Catálogo en inglés organizado por era y set. El orden de las cartas es numérico.
- Colección personal por **carta y variante** (`standard` o `reverse_holo`), con cantidad de 1 a 999. Una variante no marcada se considera ausente.
- Dentro de cada set propio hay filtros combinables con búsqueda y rareza: todas, tengo, me faltan, repetidas y para intercambiar. Los resultados se calculan por variante, por lo que una normal poseída no oculta una reverse pendiente. El número del botón «Repetidas» cuenta variantes con más de una copia; el resumen de la colección cuenta copias adicionales.
- Progreso por cartas distintas y por todas las variantes. El progreso incluye las cartas secretas cuando las hay; el número impreso de la carta mantiene el denominador oficial del set.
- Escaparate de hasta tres cartas poseídas.
- Búsqueda de perfiles, solicitudes de amistad y aceptación o rechazo. Los amigos pueden ver el perfil, progreso y detalle de cada set de otro usuario.
- Cada variante poseída se puede marcar o desmarcar como «Disponible para intercambio», incluso si solo hay una copia. Los amigos ven todas las variantes marcadas en su perfil y pueden filtrar las que les faltan. El detalle de cada set también muestra la disponibilidad.
- Trades muestra en lista todas las variantes que el usuario ha marcado como disponibles y permite retirarlas. El interruptor «Añadir repetidas automáticamente» guarda su estado en los metadatos de la cuenta: al activarlo marca las repetidas actuales y luego marca las variantes que pasen de una a dos copias; al desactivarlo conserva las marcas anteriores.
- Álbumes con nombre, descripción, estilo y visibilidad `private` o `friends`.
- PWA instalable. El service worker guarda los archivos de la aplicación; las imágenes y los datos de Supabase dependen de la conexión.

## Catálogo

| Código | Set | Cartas en el SQL | Variantes en el SQL | Estado conocido |
| --- | --- | ---: | ---: | --- |
| `xy1` | XY Base Set | 146 | Consultar SQL/BD | Importado y usado |
| `xy2` | XY—Flashfire | 109 | 200 | Importado y usado |
| `xy3` | XY—Furious Fists | 113 | 210 | Importado y usado |
| `xy4` | XY—Phantom Forces | 122 (119 + 3 secretas) | 226 | Usuario indica que los sets funcionan; sin verificación directa de BD |
| `xy5` | XY—Primal Clash | 164 (160 + 4 secretas) | 296 | Usuario indica que los sets funcionan; sin verificación directa de BD |
| `xy6` | XY—Roaring Skies | 110 (108 + 2 secretas) | 196 | Usuario indica que los sets funcionan; sin verificación directa de BD |
| `xy7` | XY—Ancient Origins | 100 (98 + 2 sobre el total impreso) | 172 | Usuario indica que los sets funcionan; sin verificación directa de BD |
| `xy8` | XY—BREAKthrough | 164 (162 + 2 secretas) | 302 | Usuario indica que los sets funcionan; sin verificación directa de BD |
| `xy9` | XY—BREAKpoint | 123 (122 + 1 secreta) | 220 | Usuario indica que los sets funcionan; sin verificación directa de BD |

Los sets visibles en la web salen de `card_sets`, no de esta tabla. Si no aparece un set, comprueba primero que se ejecutó su SQL en Supabase.

## Límites y trabajo pendiente

- Los álbumes todavía **no permiten escoger ni ordenar cartas**. La tabla `album_cards` existe, pero la interfaz actual solo guarda la cabecera del álbum. «Ver álbum» todavía no abre un contenido real.
- La sincronización actual de álbumes borra y reinserta sus filas, cambiando los IDs. Hay que corregirla antes de añadir cartas persistentes a cada álbum.
- La sección **Trades** gestiona disponibilidad, pero todavía no publica anuncios ni ofrece solicitudes o mensajes de intercambio. La tabla `trade_posts` existe, pero el frontend no la utiliza.
- Faltan los filtros equivalentes dentro de los sets de amigos.
- El catálogo no se administra desde la web: cada set nuevo requiere preparar y ejecutar un SQL.
