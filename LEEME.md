# Dormir o Rendir — GitHub Pages (envío directo de resultados a Discord)

Esta carpeta ES el sitio completo. Sube **su contenido** a la raíz de tu repositorio. No necesitas `INICIAR_JUEGO.bat` ni instalar Python.

## Publicar

1. Crea un repositorio en GitHub, por ejemplo `dormir-o-rendir`.
2. En la raíz del repositorio, sube `index.html` y las carpetas `css`, `js`, `assets`, `docs`. **No subas la carpeta contenedora** como un nivel extra.
3. Ve a **Settings > Pages > Build and deployment**.
4. Selecciona **Deploy from a branch**, rama **main**, carpeta **/(root)**, y pulsa **Save**.
5. Tu sitio normalmente tendrá una dirección como `https://USUARIO.github.io/dormir-o-rendir/`.

## Resultados enviados a Discord

Al terminar una partida de siete días, el sitio intenta enviar automáticamente el nombre o apodo, el resultado, las puntuaciones y el tiempo de juego a Discord. No hay botón de prueba en la pantalla inicial.

**Limitación importante:** el navegador usa `fetch` en modo `no-cors` y `multipart/form-data`. Puede ejecutar la petición pero NO sabe si Discord aceptó el mensaje. Si la red bloquea el envío, GitHub Pages por sí solo no puede resolverlo: habrá que utilizar un pequeño intermediario.

## Privacidad y seguridad

**Esta versión de pruebas incluye un webhook público en `js/data/discord-config.js`.** Cualquier persona que lea el sitio podrá verlo, intentar usarlo y enviar mensajes. Discord también podría invalidarlo tras publicarse. No publiques aquí tokens personales, contraseñas ni datos de estudiantes. Se recomienda usar apodos y reemplazar el webhook para una versión definitiva.

## Estructura editable

- `index.html`: página principal
- `css/`: diseño y responsive
- `js/data/scenes.js`: situaciones, decisiones e indicadores
- `js/data/book-pages.js`: páginas del folleto como imágenes
- `js/data/discord-config.js`: URL de webhook (prueba)
- `js/discord.js`: envío de resultados
- `assets/img/scenes/`: imágenes del juego por día
- `assets/img/book/`: imágenes del libro
- `docs/FUENTES_DE_AUDIO.md`: fuentes y licencias de los audios

La música real y algunas grabaciones requieren Internet.

## Versión adaptable para Android y iPhone

Consulta `docs/ACTUALIZAR_GITHUB.md`. Las imágenes de escenas ahora se usan en `.webp` para cargar más rápido. No modifiques ni publiques las direcciones del webhook fuera de las pruebas.


## Cambio de interfaz (noviembre 2026)
Se eliminó el panel «Ambiente sonoro» con sus botones de silencio, repetición y volumen. Los sonidos de cada escena siguen reproduciéndose automáticamente con volumen fijo y se detienen al salir del juego o cambiar de día. En móviles el panel lateral se omite y los indicadores siguen disponibles en la parte superior.
