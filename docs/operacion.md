# Operación diaria y publicación

## Trabajar en local

Desde la raíz del repositorio, con Node.js instalado:

```powershell
npm start
```

Abre `http://localhost:8000`. `dev-server.js` sirve los archivos sin dependencias externas. No uses `file://` para probar inicio de sesión o service worker. El build de producción se comprueba con `npm run build`; escribe `dist/`, carpeta ignorada por Git.

## Publicar

Cloudflare Pages está conectado a la rama `main` del repositorio `tzfrann/pokebinder`. Su configuración actual usa el resultado de `npm run build` en `dist/`. Un push a `main` inicia un despliegue. La URL pública es [pokebinder-9eg.pages.dev](https://pokebinder-9eg.pages.dev/).

Cuando cambies JavaScript, HTML o CSS, incrementa el nombre `CACHE` de `service-worker.js` antes de publicar; así la PWA instala la nueva caché. Después del push, espera a que Cloudflare termine, comprueba el `service-worker.js` publicado y recarga la web. En algunas instalaciones hace falta una segunda recarga para activar la versión nueva.

Los SQL del repositorio **no se ejecutan con el despliegue**. Cada migración o seed se aplica en el SQL Editor de Supabase y se verifica con una consulta de lectura. Evita ejecutar `schema.sql` de nuevo sobre un proyecto existente: contiene instrucciones de creación inicial, no una migración repetible.

### Si hay que reconstruir el proyecto desde cero

En un **proyecto Supabase nuevo y vacío**, el orden de referencia es `schema.sql` → `catalog-migration.sql` → `era-migration.sql` → `seed-xy1.sql` → `variant-migration.sql` → `featured-cards-migration.sql` → `friendships-migration.sql` → los seeds `xy2` a `xy9` en orden. `dynamic-catalog-migration.sql` normaliza los nombres de `xy1` y `xy2`; puede aplicarse tras esos seeds. Este orden documenta los archivos existentes; prueba cada paso y no lo repitas sobre la base de datos actual. Después configura `supabase/config.js` con la URL y la clave publishable del nuevo proyecto, y las URLs de redirección de Auth.

## Invitar a un amigo

En Supabase **Authentication → Users → Invite user**, envía la invitación al correo del amigo. La app usa el proveedor Email y la intención es mantener desactivado el registro público en **Authentication → Providers → Email**. El trigger `on_auth_user_created` crea su fila de `profiles`. Tras completar su acceso, puede fijar contraseña y nombre visible. Comprueba que las URLs de redirección de Auth incluyan el dominio publicado, no solo `localhost`.

Si alguien abre la web sin sesión, debe ver el botón **Entrar**; no es un error. Si la invitación no inicia sesión, comprueba que abrió el enlace completo en el mismo navegador donde usará la web, que este redirige a `https://pokebinder-9eg.pages.dev/` y que no ha caducado. La caducidad de invitaciones depende de **Authentication → Providers → Email → Email OTP Expiration**; Supabase documenta una hora como valor predeterminado. Si caducó, envía una invitación nueva desde Supabase. No pidas a nadie que comparta el enlace completo: contiene credenciales de acceso de un solo uso.

Una cuenta nueva todavía no es amiga de nadie. Dentro de la web, buscad el nombre visible, enviad la solicitud y aceptadla. Solo entonces las políticas permiten leer la colección y los álbumes compartidos del otro.

## Dónde mirar cuando algo falla

| Síntoma | Primera comprobación |
| --- | --- |
| El set no aparece | Consulta `card_sets` en Supabase. El archivo SQL en GitHub no implica que se haya ejecutado. |
| Aparece el set, pero no sus cartas | Consulta `card_catalog` filtrando por `set_code` y revisa el aviso de la web. |
| Se ven cartas, pero faltan variantes o progreso | Consulta `card_variants` y confirma que el seed llegó hasta el final. |
| Las imágenes no cargan | Abre una URL `image_small_url` del catálogo; se alojan fuera de Cloudflare. |
| Un amigo no ve la colección | Confirma que `friendships.status = 'accepted'` y que ambos han iniciado sesión. |
| Aparece «Auth session missing» | Comprueba si hay sesión real. Sin sesión, la web debe ofrecer **Entrar**; si venía de una invitación, revisa caducidad y URL de redirección. |
| Un álbum privado aparece para otra persona | Revisa las políticas RLS de `albums` antes de seguir publicando cambios. |
| Sigue viéndose una versión vieja | Comprueba el nombre `CACHE` del service worker publicado y recarga dos veces. |

`supabase/verify.sql` solo comprueba las seis tablas y políticas **del esquema inicial**; no verifica el catálogo, las variantes ni los seeds nuevos. Para estos usa la consulta de [importar un set](importar-set.md).
