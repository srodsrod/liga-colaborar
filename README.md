# Liga Asperger 7 · «¡Colabora!» con merchandising solidario

Prototipo académico (ITBA · Comercio Electrónico). Reproduce la sección
[¡Colabora!](https://ligaasperger7.org.ar/colabora/) del sitio oficial y agrega la
sección **«Colaborá y llevate un regalo con propósito»**. Incluye también el comienzo
de la página de inicio con una **burbuja promocional** que lleva a esa sección.

> No es el sitio oficial ni una campaña activa. No procesa pagos, no conecta
> MercadoPago, no envía correos y no guarda datos (todo vive en memoria del navegador).

## Cómo abrirlo

Es un sitio estático (HTML + CSS + JavaScript), **no necesita instalar nada**.

- **En la compu:** doble clic en `index.html` (inicio) o `colabora.html`.
- **En GitHub Pages:** subir esta carpeta a un repositorio y activar
  *Settings → Pages → Deploy from a branch → main / (root)*.

Solo necesita internet para la tipografía «Roboto Condensed» (sin conexión usa una fuente similar).

## Estructura

```
index.html        Inicio (primera parte) + burbuja promocional «¡Colaborá y llevate un regalo!»
colabora.html     Colaborar: sección de regalos, opciones actuales, formulario y confirmación
css/estilos.css   Estilos (Tailwind ya compilado, no se edita a mano)
css/tailwind-fuente.css  Fuente para regenerar estilos.css (opcional)
js/config.js      ← DATOS EDITABLES: montos, aportes, regalos, imágenes, textos
js/app.js         Lógica: tarjetas, formulario, validación y confirmación simulada
img/              Logo e íconos oficiales + ilustraciones de productos
```

## Dónde cambiar cosas

| Qué | Dónde |
| --- | --- |
| Montos, nombres de aportes, regalos, descripciones, etiqueta "Recomendado" | `js/config.js` → `niveles` |
| Textos de la campaña y pasos de "¿Cómo funciona?" | `js/config.js` → `campania` |
| Modalidades de entrega (y cuál está deshabilitada) | `js/config.js` → `entregas` |
| Textos de la burbuja del inicio | `index.html` → bloque `BURBUJA PROMOCIONAL` (el monto «desde» sale solo de la config) |
| Imágenes de los productos | `img/productos/` (y la ruta `imagen` en `js/config.js`) |

Después de editar, guardar y recargar la página (F5).

**Nota sobre estilos:** `css/estilos.css` incluye solo las clases de Tailwind que usa hoy la página.
Cambiar datos en `js/config.js` no requiere tocar el CSS. Si se agregan clases de Tailwind
nuevas en el HTML/JS, hay que regenerarlo (requiere Node.js):

```
npm install tailwindcss@4.1.11 @tailwindcss/cli@4.1.11
npx @tailwindcss/cli -i css/tailwind-fuente.css -o css/estilos.css --minify
```

El logo (`img/logo.svg`), la foto de portada (`img/portada.webp`) y los íconos del pie son los del sitio oficial.
Las ilustraciones de productos son diseños neutros hechos para la demo.
