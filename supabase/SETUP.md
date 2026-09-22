# Activar PokéBinder en Supabase

1. Crea un proyecto gratuito en [Supabase](https://supabase.com/dashboard/projects) llamado `pokebinder` y espera a que termine de iniciarse.
2. En **SQL Editor**, crea una consulta, pega el contenido de `schema.sql` y ejecútala una sola vez. Si te indica que alguna tabla ya existe, no borres nada: ejecuta `verify.sql` para comprobar si el esquema ya quedó creado.
3. En **Authentication > Providers > Email**, desactiva el registro público. Así únicamente entrarán las personas que invites.
4. En **Authentication > Users**, usa **Invite user** para enviar invitaciones a tus amigos. El perfil se creará automáticamente al aceptar.
5. En **Settings > API**, copia la **Project URL** y la **Publishable key**. Copia `config.example.js` como `config.js` y sustituye los dos marcadores.

La publishable key puede estar en la web. No compartas ni uses en el navegador una clave marcada como `secret` o `service_role`.

## Regla de privacidad

Las políticas incluidas habilitan Row Level Security: el propietario puede modificar sus cartas, álbumes y anuncios; sus amigos aceptados pueden consultar solo aquello que se comparte. Supabase aplica estas reglas en la base de datos, no solo en la interfaz.
