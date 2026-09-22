# Documentación de PokéBinder

Guías para entender el proyecto sin reconstruir decisiones de conversaciones anteriores.

| Si necesitas… | Lee… |
| --- | --- |
| Entender qué funciona hoy y qué queda pendiente | [Estado del producto](estado.md) |
| Seguir los datos desde la interfaz hasta Supabase | [Arquitectura y datos](arquitectura.md) |
| Añadir un set, sus cartas y sus variantes | [Importar un set](importar-set.md) |
| Arrancar, desplegar, invitar usuarios o resolver problemas comunes | [Operación](operacion.md) |

## Ficha rápida

- Repositorio: `https://github.com/tzfrann/pokebinder`, rama `main`.
- Web: `https://pokebinder-9eg.pages.dev/` mediante Cloudflare Pages.
- Backend: Supabase (Auth y PostgreSQL con RLS). Su referencia de proyecto es `ozrmfgptvazfxyndiuhs`. No se guardan contraseñas ni claves secretas en esta documentación.
- Frontend: HTML, CSS y JavaScript sin framework ni dependencias de npm.
- Build: `npm run build` copia 15 archivos públicos a `dist/`.
- Catálogo: en inglés, fuente de datos [PokemonTCG/pokemon-tcg-data](https://github.com/PokemonTCG/pokemon-tcg-data); las imágenes se enlazan desde `images.pokemontcg.io`.
- Archivos SQL: `supabase/`. Se ejecutan en el SQL Editor del proyecto de Supabase; GitHub y Cloudflare no aplican cambios de base de datos.

## Regla para mantener estas guías

Cuando cambie una función, un script de importación, una política de acceso o el despliegue, actualiza la guía correspondiente en el mismo commit. En particular, distingue entre **archivo SQL preparado**, **SQL ejecutado en Supabase** y **función comprobada en producción**.
