# LEZ: SURVIVAL — despliegue en Render

## Contenido
- `public/index.html`: juego web adaptable a celular.
- `server.js`: servidor Node.js y Socket.IO para crear/unirse a salas de hasta 2 jugadores y transmitir posiciones básicas.
- `render.yaml`: configuración de despliegue para Render.
- `package.json`: dependencias y comando de inicio.

## Publicar desde iPhone
1. Descarga `LEZ_Online_Pack.zip` y descomprímelo en Archivos.
2. Crea una cuenta en GitHub y un repositorio nuevo llamado `lez-survival`.
3. En GitHub, abre el repositorio y usa **Add file → Upload files** para subir los archivos y carpetas descomprimidos (incluye `public`, `server.js`, `package.json` y `render.yaml`). Confirma con **Commit changes**.
4. Crea una cuenta en Render y elige **New → Blueprint**.
5. Conecta GitHub, selecciona `lez-survival` y confirma el despliegue detectado desde `render.yaml`.
6. Espera a que Render indique **Live**. Abre la URL `https://...onrender.com` en Safari y compártela con tus amigos.

No compartas contraseñas ni códigos de acceso con nadie. Usa el inicio de sesión oficial de GitHub/Render.

## Comprobar servidor
Abre `https://TU-URL.onrender.com/health`. Debe responder con JSON indicando `ok: true`.

## Estado real y límites
Esta versión incluye salas privadas de 5 caracteres, entrada a sala, límite de 2 jugadores y transmisión de posición básica por Socket.IO. La interfaz local también tiene perfil, tienda, inventario, misiones, ajustes, pausa y juego solitario/cooperativo local.

**Aún no es un multijugador cooperativo completo:** enemigos, balas, daño, oleadas y puntuación se calculan localmente. La notificación de inicio de sala confirma el inicio de la sala, no una simulación compartida completa. Los datos de perfil/monedas se guardan localmente en cada navegador. No uses dinero real ni datos personales en esta demo.

El plan gratuito de hosting puede suspender el servicio por inactividad y tardar en despertar. Render puede cambiar los límites de sus planes.
