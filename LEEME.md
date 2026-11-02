# Noches en residencia · UCR Grecia

Web responsive (GitHub Pages) con el minijuego **Sobrevive la semana** y el informe completo de Canva, **18 páginas**.

## Contenido

- `index.html`: web completa, lista para publicar con GitHub Pages.
- `assets/docs/noches-en-residencia.pdf`: PDF original de Canva, que se descarga directamente al pulsar el botón.
- `assets/img/book/pagina-01.webp` a `pagina-18.webp`: las 18 páginas reales del informe en el libro 3D.
- `js/data/book-pages.js`: nombres y orden de páginas.
- `js/audio.js`: sonidos a volumen 100 % del navegador, sin controles de sonido visibles. La potencia final depende de las bocinas del aula; ajusta el volumen del equipo y prueba antes de presentar.
- `js/discord.js`: envío automático de resultados al finalizar el juego. No hay casilla de consentimiento: se mantiene un aviso claro de que el apodo y resultados se envían.

## Actualizar GitHub Pages

En tu repositorio, sustituye los archivos de la web por los del ZIP (mantén el árbol de carpetas). En Settings > Pages, publica desde `main` y `/(root)`.

## Importante sobre Discord

`js/data/discord-config.js` contiene un webhook configurado en el proyecto original. En una página pública ese webhook es visible para cualquier visitante; puede ser utilizado por terceros o revocado por Discord. Para un uso público seguro, se recomienda un intermediario servidor/función segura que guarde el webhook como secreto. No se cambió la configuración de envíos de la versión que ya te funcionaba.

## Audio y permisos

Los sonidos actuales vienen de Wikimedia Commons y requieren Internet. Los navegadores móviles pueden bloquear la reproducción hasta la primera interacción con el juego. Ninguna página puede garantizar el volumen físico en una sala: depende del sistema operativo, bocinas y proyector. Los créditos de audio están en `docs/FUENTES_DE_AUDIO.md`.

## Actualizar el informe después

Edita el informe en Canva, descarga el PDF y sustituye `assets/docs/noches-en-residencia.pdf`. Para actualizar también las páginas del libro 3D, vuelve a exportar imágenes por página y reemplaza los archivos `pagina-XX.webp` manteniendo el orden de `js/data/book-pages.js`.


### Navegación del informe — giro suave de una hoja
El informe muestra una sola página a la vez en PC, Android y iPhone. Al avanzar o retroceder, la hoja se inclina ligeramente con perspectiva y sombra, sin dar una vuelta de 180 grados. Se mantienen las 18 páginas y el PDF original.
