# Actualizar GitHub Pages — versión adaptable a celulares

## Qué se corrigió
- Las imágenes de cada noche ahora ocupan **todo el ancho** de la tarjeta; no aparece una banda vacía a la derecha.
- En teléfonos Android y iPhone aparece primero el estado resumido de la semana, luego la escena y las decisiones; los controles de sonido quedan al final.
- Los indicadores se actualizan al tomar decisiones.
- Las imágenes fueron convertidas a **WebP**, con el mismo tamaño visual pero menor peso para conexiones móviles.
- El libro digital, el registro del nombre, los siete días y el envío de los resultados a Discord se mantienen.

## Cómo subir los cambios
1. Extrae el ZIP.
2. En GitHub abre tu repositorio.
3. Reemplaza los archivos `index.html`, `css/game.css`, `css/responsive.css`, `js/game.js` y `js/data/scenes.js`.
4. Sube las imágenes `.webp` de `assets/img/scenes/` y la imagen `assets/img/residencia-principal.webp`.
5. Confirma los cambios; GitHub Pages actualizará el sitio según tu configuración.
6. En el celular recarga la página (si se ve la versión vieja, borra el caché del sitio).

Para mantener todos los archivos organizados, también puedes sustituir el proyecto completo por el contenido del ZIP integral.

## Importante
El archivo `js/data/discord-config.js` contiene la dirección del webhook para esta versión de pruebas: no publiques el repositorio si no quieres que terceros puedan usar esa dirección. Para producción, regenerar el webhook y mover el envío a un backend seguro.
