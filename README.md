# PokéBinder

Web instalable para llevar una colección privada de cartas Pokémon con amigos. El catálogo está en inglés y se organiza por eras y sets.

La documentación de funcionamiento y mantenimiento está en **[docs/README.md](docs/README.md)**. Empieza por ahí antes de modificar el catálogo, Supabase o el despliegue.

## Desarrollo local

Requiere Node.js. Desde la raíz del repositorio:

```powershell
npm start
```

Abre `http://localhost:8000`. Para comprobar el paquete que usa Cloudflare Pages:

```powershell
npm run build
```

El build genera `dist/` con los archivos públicos. La web publicada es [pokebinder-9eg.pages.dev](https://pokebinder-9eg.pages.dev/).

No abras `index.html` como archivo local: la autenticación y la instalación de la PWA necesitan un origen HTTP o HTTPS.
