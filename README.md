# PokéBinder

Primera versión de una PWA privada para coleccionistas de Pokémon.

## Probarla localmente

Abre `index.html` en un navegador. La colección y los álbumes se guardan solo en el almacenamiento local de ese navegador.

Para probar el inicio de sesión de Supabase desde el mismo ordenador, inicia el servidor local con:

```powershell
& 'C:\Users\Pc\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' dev-server.js
```

Y abre `http://localhost:8000`.

## Instalarla en iPhone

Cuando se publique con HTTPS, ábrela con Safari, pulsa **Compartir** y selecciona **Añadir a pantalla de inicio**. No necesita App Store ni cuota de Apple.

## Para que sea compartida

El siguiente paso requiere un proveedor de acceso por invitación y una base de datos común. La interfaz ya se mantendría; sustituiríamos `localStorage` por ese servicio y aplicaríamos reglas para que cada usuario solo pueda modificar su contenido.
