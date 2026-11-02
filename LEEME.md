# Dormir o Rendir · Semana Ambiental 2026

Sitio estático listo para GitHub Pages, con minijuego y el **tríptico original de Semana Ambiental**.

## Lo nuevo
- Brochure con seis paneles en orden de lectura y giro sutil, cómodo en teléfonos y PC.
- Se pueden desplegar las dos caras originales completas desde el mismo visor.
- El botón **Descargar tríptico PDF** descarga `assets/docs/Brochure_Semana_Ambiental_2026.pdf`, copia intacta del PDF entregado, en dos páginas A4 apaisadas (tres paneles por cara).
- Se mantienen el minijuego de siete días, el sonido y el envío automático a Discord de la versión previa.

## Subir a GitHub Pages
Sube **el contenido dentro de este ZIP a la raíz del repositorio**: index.html, css, js, assets, docs, y archivos ocultos. No coloques toda la carpeta dentro de otra carpeta. En Settings → Pages elige Deploy from branch → main → /(root).

## Editar brochure
- PDF descargable: `assets/docs/Brochure_Semana_Ambiental_2026.pdf`.
- Paneles: `assets/img/brochure/portada.webp`, `solapa.webp`, `interior-izquierdo.webp`, `interior-centro.webp`, `interior-derecho.webp`, `contraportada.webp`.
- Dos caras: `cara-exterior.webp`, `cara-interior.webp`.
- Orden y títulos: `js/data/book-pages.js`.
- Animación: `js/book.js`, `css/book.css`.

El PDF debe mantenerse tal cual se exporta de Canva para impresión, mientras que las imágenes webp sirven como vista de lectura, no sustituyen el PDF.

**Privacidad:** el webhook de Discord de la versión anterior permanece en código del navegador y por eso puede quedar expuesto en GitHub público. Para compartir la página ampliamente, es recomendable usar un intermediario seguro y rotar la URL.

## Discord sin controles de prueba
No hay botón de prueba, casilla de autorización ni mensajes de prueba. Al finalizar los siete días, el juego intenta enviar los resultados automáticamente a Discord. El navegador no puede confirmar la recepción mediante `no-cors`.
Si GitHub sigue mostrando la versión anterior, subí de nuevo todos los archivos de este ZIP y recargá la web con Ctrl+F5.
